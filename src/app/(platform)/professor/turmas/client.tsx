"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClass, archiveClass } from "../actions";
import {
  Plus,
  Users,
  Copy,
  Archive,
  Search,
} from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  code: string;
  schoolName: string | null;
  gradeLevel: string | null;
  isActive: boolean;
  createdAt: string;
  studentCount: number;
}

interface Props {
  classes: ClassItem[];
}

export function ClassesListClient({ classes }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = classes.filter((cls) => {
    const matchesFilter =
      cls.name.toLowerCase().includes(filter.toLowerCase()) ||
      cls.code.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = showArchived ? true : cls.isActive;
    return matchesFilter && matchesStatus;
  });

  async function handleCreate(formData: FormData) {
    setCreating(true);
    const result = await createClass(formData);
    setCreating(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Turma criada! Codigo: ${result.code}`);
      router.refresh();
    }
  }

  async function handleArchive(classId: string) {
    const result = await archiveClass(classId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Turma arquivada.");
      router.refresh();
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Codigo copiado!");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Turmas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas turmas e alunos
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova turma</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da turma *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Matematica 9A - 2026"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descricao opcional da turma"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Escola</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    placeholder="Nome da escola"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Ano/Serie</Label>
                  <Input
                    id="gradeLevel"
                    name="gradeLevel"
                    placeholder="Ex: 9o ano"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={creating}>
                  {creating ? "Criando..." : "Criar turma"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou codigo..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4 mr-1" />
          {showArchived ? "Mostrando arquivadas" : "Mostrar arquivadas"}
        </Button>
      </div>

      {/* Class list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">Nenhuma turma encontrada</h3>
            <p className="text-sm text-muted-foreground">
              {filter
                ? "Tente outro termo de busca."
                : "Crie sua primeira turma para comecar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <Card
              key={cls.id}
              className={!cls.isActive ? "opacity-60" : ""}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/professor/turmas/${cls.id}`}
                      className="font-semibold hover:underline block truncate"
                    >
                      {cls.name}
                    </Link>
                    {cls.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {cls.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={cls.isActive ? "default" : "secondary"}>
                    {cls.isActive ? "Ativa" : "Arquivada"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {cls.studentCount} aluno{cls.studentCount !== 1 ? "s" : ""}
                  </div>
                  {cls.gradeLevel && (
                    <span>{cls.gradeLevel}</span>
                  )}
                </div>

                {/* Code */}
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Codigo:{" "}
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {cls.code}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(cls.code)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/professor/turmas/${cls.id}`}>
                      Gerenciar
                    </Link>
                  </Button>
                  {cls.isActive && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Arquivar turma?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            A turma &quot;{cls.name}&quot; sera arquivada e nao
                            aceitara novos alunos. Os dados serao
                            mantidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleArchive(cls.id)}
                          >
                            Arquivar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
