"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Video, FileText, Brain, HelpCircle } from "lucide-react";
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

interface Lesson {
  id: string;
  name: string;
  slug: string;
  type: string;
  unitId: string;
  order: number;
  isActive: boolean;
  unitName: string;
  courseName: string;
  subjectName: string;
}

interface Unit {
  id: string;
  name: string;
  courseName: string;
  subjectName: string;
}

interface Props {
  initialLessons: Lesson[];
  units: Unit[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  exercise: <Brain className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  video: "Video",
  article: "Artigo",
  exercise: "Exercicio",
  quiz: "Quiz",
};

export function LessonsAdmin({ initialLessons, units }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lessons, setLessons] = useState(initialLessons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("video");
  const [unitId, setUnitId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [articleBody, setArticleBody] = useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setType("video");
    setUnitId(units[0]?.id ?? "");
    setVideoUrl("");
    setArticleBody("");
    setDialogOpen(true);
  }

  function openEdit(lesson: Lesson) {
    setEditing(lesson);
    setName(lesson.name);
    setDescription("");
    setType(lesson.type);
    setUnitId(lesson.unitId);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!name.trim() || !unitId) {
      toast.error("Nome e unidade sao obrigatorios.");
      return;
    }

    startTransition(async () => {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const body = {
        name,
        slug,
        description,
        type,
        unitId,
        videoUrl: type === "video" ? videoUrl : null,
        articleBody: type === "article" ? articleBody : null,
      };

      const res = await fetch(
        editing ? `/api/admin/lessons/${editing.id}` : "/api/admin/lessons",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        toast.success(editing ? "Licao atualizada!" : "Licao criada!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error("Erro ao salvar licao.");
      }
    });
  }

  function handleDelete(lesson: Lesson) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
        toast.success("Licao removida.");
      } else {
        toast.error("Erro ao remover licao.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Licoes</h1>
        <Button onClick={openCreate} className="min-h-[44px]">
          <Plus className="mr-2 h-4 w-4" />
          Nova Licao
        </Button>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Unidade / Curso / Materia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma licao encontrada.
                </TableCell>
              </TableRow>
            )}
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[lesson.type]}
                    <span className="text-xs">{TYPE_LABELS[lesson.type] ?? lesson.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{lesson.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                  {lesson.unitName} / {lesson.courseName} / {lesson.subjectName}
                </TableCell>
                <TableCell>
                  <Badge variant={lesson.isActive ? "default" : "secondary"}>
                    {lesson.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(lesson)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lesson)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Licao" : "Nova Licao"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Introducao a Algebra" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Artigo</SelectItem>
                    <SelectItem value="exercise">Exercicio</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={unitId} onValueChange={setUnitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.courseName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            {type === "video" && (
              <div className="space-y-2">
                <Label>URL do YouTube</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}
            {type === "article" && (
              <div className="space-y-2">
                <Label>Conteudo do Artigo (Markdown)</Label>
                <Textarea
                  value={articleBody}
                  onChange={(e) => setArticleBody(e.target.value)}
                  placeholder="# Titulo&#10;&#10;Conteudo em Markdown..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}
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
