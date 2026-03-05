"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseActive,
  type CourseFormData,
} from "../actions";

type Course = {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  subjectName: string | null;
  subjectSlug: string | null;
};

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

export function CoursesAdmin({
  initialCourses,
  subjects,
}: {
  initialCourses: Course[];
  subjects: Subject[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    if (filterSubject === "all") return initialCourses;
    return initialCourses.filter((c) => c.subjectId === filterSubject);
  }, [initialCourses, filterSubject]);

  const form = useForm<CourseFormData>({
    defaultValues: {
      subjectId: "",
      name: "",
      slug: "",
      description: "",
      thumbnailUrl: "",
      order: 0,
      isActive: true,
    },
  });

  function openCreate() {
    setEditingCourse(null);
    form.reset({
      subjectId: subjects[0]?.id ?? "",
      name: "",
      slug: "",
      description: "",
      thumbnailUrl: "",
      order: initialCourses.length + 1,
      isActive: true,
    });
    setDialogOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    form.reset({
      subjectId: course.subjectId,
      name: course.name,
      slug: course.slug,
      description: course.description ?? "",
      thumbnailUrl: course.thumbnailUrl ?? "",
      order: course.order,
      isActive: course.isActive,
    });
    setDialogOpen(true);
  }

  function onSubmit(data: CourseFormData) {
    startTransition(async () => {
      try {
        if (editingCourse) {
          await updateCourse(editingCourse.id, data);
          toast.success("Curso atualizado com sucesso!");
        } else {
          await createCourse(data);
          toast.success("Curso criado com sucesso!");
        }
        setDialogOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao salvar curso",
        );
      }
    });
  }

  function handleToggleActive(course: Course) {
    startTransition(async () => {
      try {
        await toggleCourseActive(course.id, !course.isActive);
        toast.success(
          course.isActive ? "Curso desativado" : "Curso ativado",
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
        await deleteCourse(deleteId);
        toast.success("Curso excluido com sucesso!");
        setDeleteId(null);
        router.refresh();
      } catch {
        toast.error(
          "Erro ao excluir curso. Verifique se nao possui unidades vinculadas.",
        );
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">
            Gerencie os cursos da plataforma
          </p>
        </div>
        <Button onClick={openCreate} className="min-h-[44px]">
          <Plus className="mr-2 size-4" />
          Novo Curso
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label>Filtrar por materia:</Label>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead className="hidden sm:table-cell">Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">
                  {course.slug}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {course.subjectName ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{course.order}</TableCell>
                <TableCell>
                  <Badge
                    variant={course.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(course)}
                  >
                    {course.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(course)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteId(course.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCourses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum curso encontrado
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
              {editingCourse ? "Editar Curso" : "Novo Curso"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Materia</Label>
              <Select
                value={form.watch("subjectId")}
                onValueChange={(val) => form.setValue("subjectId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...form.register("name", {
                  onChange: (e) => {
                    if (!editingCourse) {
                      form.setValue("slug", generateSlug(e.target.value));
                    }
                  },
                })}
                placeholder="Ex: Algebra Basica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="Ex: algebra-basica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder="Breve descricao do curso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
              <Input
                id="thumbnailUrl"
                {...form.register("thumbnailUrl")}
                placeholder="https://..."
              />
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
                  : editingCourse
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
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. Todas as unidades e licoes
              vinculadas a este curso tambem serao afetadas.
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
