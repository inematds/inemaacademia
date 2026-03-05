"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectActive,
  reorderSubjects,
  type SubjectFormData,
} from "../actions";

type Subject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
};

export function SubjectsAdmin({
  initialSubjects,
}: {
  initialSubjects: Subject[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const form = useForm<SubjectFormData>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "#3B82F6",
      order: 0,
      isActive: true,
    },
  });

  function openCreate() {
    setEditingSubject(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "#3B82F6",
      order: subjects.length + 1,
      isActive: true,
    });
    setDialogOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    form.reset({
      name: subject.name,
      slug: subject.slug,
      description: subject.description ?? "",
      icon: subject.icon ?? "",
      color: subject.color ?? "#3B82F6",
      order: subject.order,
      isActive: subject.isActive,
    });
    setDialogOpen(true);
  }

  function onSubmit(data: SubjectFormData) {
    startTransition(async () => {
      try {
        if (editingSubject) {
          await updateSubject(editingSubject.id, data);
          toast.success("Materia atualizada com sucesso!");
        } else {
          await createSubject(data);
          toast.success("Materia criada com sucesso!");
        }
        setDialogOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao salvar materia",
        );
      }
    });
  }

  function handleToggleActive(subject: Subject) {
    startTransition(async () => {
      try {
        await toggleSubjectActive(subject.id, !subject.isActive);
        toast.success(
          subject.isActive ? "Materia desativada" : "Materia ativada",
        );
        router.refresh();
      } catch {
        toast.error("Erro ao alterar status");
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteSubject(deleteId);
        toast.success("Materia excluida com sucesso!");
        setDeleteId(null);
        router.refresh();
      } catch {
        toast.error("Erro ao excluir materia. Verifique se nao possui cursos vinculados.");
      }
    });
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newSubjects = [...subjects];
    const [dragged] = newSubjects.splice(dragIndex, 1);
    newSubjects.splice(index, 0, dragged);
    setSubjects(newSubjects);
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
    const orderedIds = subjects.map((s) => s.id);
    startTransition(async () => {
      try {
        await reorderSubjects(orderedIds);
        toast.success("Ordem atualizada");
        router.refresh();
      } catch {
        toast.error("Erro ao reordenar");
      }
    });
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Materias</h1>
          <p className="text-muted-foreground">
            Gerencie as materias da plataforma
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nova Materia
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 hidden sm:table-cell"></TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="hidden md:table-cell">Icone</TableHead>
              <TableHead className="hidden sm:table-cell">Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject, index) => (
              <TableRow
                key={subject.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "cursor-move",
                  dragIndex === index && "opacity-50",
                )}
              >
                <TableCell className="hidden sm:table-cell">
                  <GripVertical className="size-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <div
                    className="size-6 rounded-full border"
                    style={{ backgroundColor: subject.color ?? "#ccc" }}
                  />
                </TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">
                  {subject.slug}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {subject.icon ?? "-"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{subject.order}</TableCell>
                <TableCell>
                  <Badge
                    variant={subject.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(subject)}
                  >
                    {subject.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(subject)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteId(subject.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhuma materia cadastrada
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Editar Materia" : "Nova Materia"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...form.register("name", {
                  onChange: (e) => {
                    if (!editingSubject) {
                      form.setValue("slug", generateSlug(e.target.value));
                    }
                  },
                })}
                placeholder="Ex: Matematica"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="Ex: matematica"
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder="Breve descricao da materia"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icone (lucide)</Label>
                <Input
                  id="icon"
                  {...form.register("icon")}
                  placeholder="Ex: calculator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    {...form.register("color")}
                    className="h-9 w-14 p-1"
                  />
                  <Input
                    {...form.register("color")}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  {...form.register("order", { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Salvando..."
                  : editingSubject
                    ? "Atualizar"
                    : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir materia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. Todos os cursos, unidades e licoes
              vinculados a esta materia tambem serao afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
