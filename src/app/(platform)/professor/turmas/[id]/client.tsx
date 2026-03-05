"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addStudent, removeStudent, updateClass } from "../../actions";
import {
  Copy,
  UserPlus,
  UserMinus,
  Flame,
  Star,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  FileText,
} from "lucide-react";

interface Student {
  id: string;
  enrollmentId: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
  xp: number;
  streak: number;
  level: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  contentId: string;
  dueDate: string | null;
  createdAt: string;
}

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  code: string;
  schoolName: string | null;
  gradeLevel: string | null;
  isActive: boolean;
}

interface Props {
  classData: ClassData;
  students: Student[];
  assignments: Assignment[];
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  lesson: "Licao",
  exercise: "Exercicio",
  quiz: "Quiz",
  unit_test: "Prova",
};

export function ClassDetailClient({
  classData,
  students,
  assignments,
}: Props) {
  const router = useRouter();
  const [addingStudent, setAddingStudent] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleAddStudent(formData: FormData) {
    setAddingStudent(true);
    const identifier = formData.get("identifier") as string;
    const result = await addStudent(classData.id, identifier);
    setAddingStudent(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Aluno adicionado com sucesso!");
      router.refresh();
    }
  }

  async function handleRemoveStudent(studentId: string) {
    const result = await removeStudent(classData.id, studentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Aluno removido da turma.");
      router.refresh();
    }
  }

  async function handleEdit(formData: FormData) {
    setEditing(true);
    const result = await updateClass(classData.id, formData);
    setEditing(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Turma atualizada!");
      router.refresh();
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(classData.code);
    toast.success("Codigo copiado!");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{classData.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-mono font-bold">{classData.code}</span>
              <Copy className="h-3.5 w-3.5" />
            </button>
            {classData.gradeLevel && (
              <Badge variant="outline">{classData.gradeLevel}</Badge>
            )}
            <Badge variant={classData.isActive ? "default" : "secondary"}>
              {classData.isActive ? "Ativa" : "Arquivada"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/professor/turmas/${classData.id}/relatorios`}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Relatorios
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/professor/turmas/${classData.id}/atribuir`}>
              <ClipboardList className="h-4 w-4 mr-1" />
              Atribuir tarefa
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-1.5" />
            Alunos ({students.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <FileText className="h-4 w-4 mr-1.5" />
            Tarefas ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1.5" />
            Configuracoes
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Adicionar aluno
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar aluno</DialogTitle>
                </DialogHeader>
                <form action={handleAddStudent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">ID do aluno</Label>
                    <Input
                      id="identifier"
                      name="identifier"
                      placeholder="ID do aluno"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Informe o ID do aluno para adiciona-lo a turma.
                      Ou compartilhe o codigo{" "}
                      <span className="font-mono font-bold">
                        {classData.code}
                      </span>{" "}
                      para que o aluno entre por conta propria.
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={addingStudent}>
                      {addingStudent ? "Adicionando..." : "Adicionar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Nenhum aluno</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe o codigo{" "}
                  <span className="font-mono font-bold">
                    {classData.code}
                  </span>{" "}
                  para que seus alunos entrem na turma.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="text-center">Nivel</TableHead>
                    <TableHead className="text-center">XP</TableHead>
                    <TableHead className="text-center">Ofensiva</TableHead>
                    <TableHead className="text-center">Entrou em</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {student.avatarUrl && (
                              <AvatarImage src={student.avatarUrl} />
                            )}
                            <AvatarFallback className="text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {student.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{student.level}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 text-yellow-500" />
                          {student.xp}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          {student.streak}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {new Date(student.joinedAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remover aluno?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Remover {student.name} da turma? O aluno podera
                                entrar novamente com o codigo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveStudent(student.id)
                                }
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" asChild>
              <Link href={`/professor/turmas/${classData.id}/atribuir`}>
                <ClipboardList className="h-4 w-4 mr-1" />
                Nova tarefa
              </Link>
            </Button>
          </div>

          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Nenhuma tarefa</h3>
                <p className="text-sm text-muted-foreground">
                  Atribua conteudos para seus alunos praticarem.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{assignment.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {CONTENT_TYPE_LABELS[assignment.contentType] ??
                            assignment.contentType}
                        </Badge>
                        {assignment.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Prazo:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Criada em{" "}
                          {new Date(
                            assignment.createdAt
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Editar turma</h3>
              <form action={handleEdit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da turma *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={classData.name}
                    required
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descricao</Label>
                  <Input
                    id="edit-description"
                    name="description"
                    defaultValue={classData.description ?? ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-schoolName">Escola</Label>
                    <Input
                      id="edit-schoolName"
                      name="schoolName"
                      defaultValue={classData.schoolName ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gradeLevel">Ano/Serie</Label>
                    <Input
                      id="edit-gradeLevel"
                      name="gradeLevel"
                      defaultValue={classData.gradeLevel ?? ""}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={editing}>
                  {editing ? "Salvando..." : "Salvar alteracoes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
