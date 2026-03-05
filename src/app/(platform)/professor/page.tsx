import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default async function TeacherDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get teacher's classes
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, is_active, created_at")
    .eq("teacher_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const classIds = (classes ?? []).map((c: Record<string, unknown>) => c.id as string);

  // Count total students
  let totalStudents = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from("class_students")
      .select("*", { count: "exact", head: true })
      .in("class_id", classIds);
    totalStudents = count ?? 0;
  }

  // Count pending assignments (due in the future or no due date)
  let pendingAssignments = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", user.id);
    pendingAssignments = count ?? 0;
  }

  // Count pending submissions
  let pendingSubmissions = 0;
  if (classIds.length > 0) {
    const { data: assignmentList } = await supabase
      .from("assignments")
      .select("id")
      .eq("teacher_id", user.id);

    if (assignmentList && assignmentList.length > 0) {
      const assignmentIds = assignmentList.map(
        (a: Record<string, unknown>) => a.id as string
      );
      const { count } = await supabase
        .from("assignment_submissions")
        .select("*", { count: "exact", head: true })
        .in("assignment_id", assignmentIds)
        .eq("status", "pending");
      pendingSubmissions = count ?? 0;
    }
  }

  const stats = [
    {
      label: "Turmas ativas",
      value: classes?.length ?? 0,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      label: "Total de alunos",
      value: totalStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950/30",
    },
    {
      label: "Tarefas criadas",
      value: pendingAssignments,
      icon: ClipboardList,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950/30",
    },
    {
      label: "Entregas pendentes",
      value: pendingSubmissions,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Painel do Professor</h1>
        <p className="text-muted-foreground mt-1">
          Visao geral das suas turmas e atividades
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent classes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Suas turmas</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/professor/turmas">
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {!classes || classes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Nenhuma turma criada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie sua primeira turma para comecar a gerenciar alunos.
              </p>
              <Button asChild>
                <Link href="/professor/turmas">Criar turma</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.slice(0, 6).map((cls: Record<string, unknown>) => (
              <Link
                key={cls.id as string}
                href={`/professor/turmas/${cls.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {cls.name as string}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criada em{" "}
                          {new Date(
                            cls.created_at as string
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant="outline">Ativa</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
