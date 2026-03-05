import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, Clock, Target, Zap } from "lucide-react";

export const metadata = {
  title: "Progresso | INEMA Academia",
};

export default async function ProgressoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentId = user.id;

  // Fetch stats
  const { data: stats } = await supabase
    .from("student_stats")
    .select("*")
    .eq("student_id", studentId)
    .single();

  // Fetch course progress
  const { data: courseProgress } = await supabase
    .from("course_progress")
    .select("*, courses(id, name, slug)")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });

  // Fetch completed lessons count
  const { count: completedCount } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("status", "completed");

  // Fetch in-progress lessons count
  const { count: inProgressCount } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("status", "in_progress");

  // Fetch total time
  const { data: timeData } = await supabase
    .from("lesson_progress")
    .select("time_spent_seconds")
    .eq("student_id", studentId);

  const totalSeconds = (timeData ?? []).reduce(
    (sum, r) => sum + (r.time_spent_seconds ?? 0),
    0,
  );
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

  // Fetch mastery counts
  const { count: masteredCount } = await supabase
    .from("skill_mastery")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("mastery_level", "mastered");

  const statCards = [
    {
      label: "XP Total",
      value: stats?.total_xp ?? 0,
      icon: Zap,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-950/30",
    },
    {
      label: "Licoes concluidas",
      value: completedCount ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950/30",
    },
    {
      label: "Em andamento",
      value: inProgressCount ?? 0,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      label: "Tempo de estudo",
      value: totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950/30",
    },
    {
      label: "Habilidades dominadas",
      value: masteredCount ?? 0,
      icon: Target,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Meu Progresso</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe sua evolucao na plataforma
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.bg}`}
              >
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Cursos</h2>
        {!courseProgress || courseProgress.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Nenhum curso iniciado</h3>
              <p className="text-sm text-muted-foreground">
                Explore as materias e comece um curso para ver seu progresso aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courseProgress.map((cp) => {
              const course = cp.courses as {
                id: string;
                name: string;
                slug: string;
              } | null;
              const pct =
                cp.total_lessons > 0
                  ? Math.round(
                      (cp.completed_lessons / cp.total_lessons) * 100,
                    )
                  : 0;
              return (
                <Card key={cp.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {course?.name ?? "Curso"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {cp.completed_lessons}/{cp.total_lessons} licoes
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
