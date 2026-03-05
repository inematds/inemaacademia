import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400" },
  in_progress: { label: "Em andamento", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400" },
  completed: { label: "Concluida", color: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" },
  late: { label: "Atrasada", color: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400" },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  lesson: "Licao",
  exercise: "Exercicio",
  quiz: "Quiz",
  unit_test: "Prova",
};

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all classes the student is enrolled in
  const { data: enrollments } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", user.id);

  const classIds = (enrollments ?? []).map(
    (e: Record<string, unknown>) => e.class_id as string
  );

  if (classIds.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6">Minhas tarefas</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">Nenhuma turma</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voce ainda nao esta matriculado em nenhuma turma.
            </p>
            <Button asChild>
              <Link href="/aluno/turma/entrar">Entrar em uma turma</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get assignments for those classes
  const { data: allAssignments } = await supabase
    .from("assignments")
    .select(
      `
      id,
      title,
      description,
      content_type,
      content_id,
      due_date,
      created_at,
      classes (
        name
      )
    `
    )
    .in("class_id", classIds)
    .order("created_at", { ascending: false });

  // Get submissions for these assignments
  const assignmentIds = (allAssignments ?? []).map(
    (a: Record<string, unknown>) => a.id as string
  );

  let submissions: Record<string, unknown>[] = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, status, score, completed_at")
      .eq("student_id", user.id)
      .in("assignment_id", assignmentIds);
    submissions = data ?? [];
  }

  const submissionMap = new Map(
    submissions.map((s: Record<string, unknown>) => [
      s.assignment_id as string,
      s,
    ])
  );

  const assignments = (allAssignments ?? []).map(
    (a: Record<string, unknown>) => {
      const submission = submissionMap.get(a.id as string) as Record<string, unknown> | undefined;
      const cls = a.classes as Record<string, unknown> | null;
      const dueDate = a.due_date as string | null;
      const isOverdue =
        dueDate &&
        new Date(dueDate) < new Date() &&
        submission?.status !== "completed";

      return {
        id: a.id as string,
        title: a.title as string,
        description: (a.description as string) ?? null,
        contentType: a.content_type as string,
        contentId: a.content_id as string,
        dueDate,
        createdAt: a.created_at as string,
        className: (cls?.name as string) ?? "Turma",
        status: isOverdue
          ? "late"
          : ((submission?.status as string) ?? "pending"),
        score: submission?.score
          ? parseFloat(submission.score as string)
          : null,
      };
    }
  );

  // Split into pending and completed
  const pending = assignments.filter(
    (a) => a.status === "pending" || a.status === "in_progress" || a.status === "late"
  );
  const completed = assignments.filter((a) => a.status === "completed");

  function getContentLink(contentType: string, contentId: string) {
    switch (contentType) {
      case "lesson":
        return `/licao/${contentId}`;
      case "exercise":
        return `/licao/${contentId}`;
      case "quiz":
        return `/licao/${contentId}/quiz`;
      case "unit_test":
        return `/avaliacao/${contentId}`;
      default:
        return `/licao/${contentId}`;
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minhas tarefas</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/aluno/turma/entrar">Entrar em turma</Link>
        </Button>
      </div>

      <div className="space-y-8">
        {/* Pending assignments */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pendentes ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma tarefa pendente. Parabens!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((assignment) => {
                const statusInfo =
                  STATUS_LABELS[assignment.status] ?? STATUS_LABELS.pending;
                return (
                  <Card key={assignment.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{assignment.className}</span>
                          <Badge variant="outline" className="text-xs">
                            {CONTENT_TYPE_LABELS[assignment.contentType] ??
                              assignment.contentType}
                          </Badge>
                          {assignment.dueDate && (
                            <span className="flex items-center gap-1">
                              {assignment.status === "late" ? (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              Prazo:{" "}
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link
                          href={getContentLink(
                            assignment.contentType,
                            assignment.contentId
                          )}
                        >
                          Iniciar
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed assignments */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Concluidas ({completed.length})
            </h2>
            <div className="space-y-3">
              {completed.map((assignment) => (
                <Card key={assignment.id} className="opacity-80">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <h3 className="font-medium">{assignment.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{assignment.className}</span>
                        <Badge variant="outline" className="text-xs">
                          {CONTENT_TYPE_LABELS[assignment.contentType] ??
                            assignment.contentType}
                        </Badge>
                        {assignment.score !== null && (
                          <span className="font-medium">
                            Nota: {Math.round(assignment.score)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
