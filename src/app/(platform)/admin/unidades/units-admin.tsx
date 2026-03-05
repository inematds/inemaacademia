"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Unit {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  courseId: string;
  order: number;
  isActive: boolean;
}

interface Course {
  id: string;
  name: string;
  subjectName: string;
}

interface Props {
  initialUnits: Unit[];
  courses: Course[];
}

export function UnitsAdmin({ initialUnits, courses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [units, setUnits] = useState(initialUnits);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>("all");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");

  const filteredUnits =
    filterCourse === "all"
      ? units
      : units.filter((u) => u.courseId === filterCourse);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setCourseId(courses[0]?.id ?? "");
    setDialogOpen(true);
  }

  function openEdit(unit: Unit) {
    setEditing(unit);
    setName(unit.name);
    setDescription(unit.description ?? "");
    setCourseId(unit.courseId);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!name.trim() || !courseId) {
      toast.error("Nome e curso sao obrigatorios.");
      return;
    }

    startTransition(async () => {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const body = { name, slug, description, courseId };

      const res = await fetch(
        editing ? `/api/admin/units/${editing.id}` : "/api/admin/units",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        toast.success(editing ? "Unidade atualizada!" : "Unidade criada!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error("Erro ao salvar unidade.");
      }
    });
  }

  function handleDelete(unit: Unit) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/units/${unit.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUnits((prev) => prev.filter((u) => u.id !== unit.id));
        toast.success("Unidade removida.");
      } else {
        toast.error("Erro ao remover unidade.");
      }
    });
  }

  const getCourseName = (id: string) => {
    const c = courses.find((c) => c.id === id);
    return c ? `${c.name} (${c.subjectName})` : "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Unidades</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Label>Filtrar por curso:</Label>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.subjectName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma unidade encontrada.
                </TableCell>
              </TableRow>
            )}
            {filteredUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.name}</TableCell>
                <TableCell>{getCourseName(unit.courseId)}</TableCell>
                <TableCell>
                  <Badge variant={unit.isActive ? "default" : "secondary"}>
                    {unit.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(unit)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(unit)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Unidade" : "Nova Unidade"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Equacoes do 1o Grau" />
            </div>
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.subjectName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
