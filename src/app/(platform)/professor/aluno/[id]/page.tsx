import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Zap, BookOpen, Clock, Trophy, Target } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: Props) {
  const { id: studentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify teacher role
  const { data: teacherProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (teacherProfile?.role !== "professor" && teacherProfile?.role !== "admin") {
    redirect("/aluno");
  }

  // Fetch student data
  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at")
    .eq("id", studentId)
    .single();

  if (!student || student.role !== "aluno") notFound();

  const { data: stats } = await supabase
    .from("student_stats")
    .select("*")
    .eq("student_id", studentId)
    .single();

  // Lesson progress
  const { data: lessonProgress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, time_spent_seconds, completed_at")
    .eq("student_id", studentId);

  // Skill mastery
  const { data: mastery } = await supabase
    .from("skill_mastery")
    .select("lesson_id, mastery_level, mastery_points, last_practiced_at")
    .eq("student_id", studentId);

  // Badges
  const { data: studentBadges } = await supabase
    .from("student_badges")
    .select("earned_at, badges(name, slug, category, icon_url)")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false });

  const completedLessons = (lessonProgress ?? []).filter(
    (p: Record<string, unknown>) => p.status === "completed"
  ).length;
  const totalTimeMinutes = Math.round(
    (lessonProgress ?? []).reduce(
      (sum: number, p: Record<string, unknown>) =>
        sum + ((p.time_spent_seconds as number) ?? 0),
      0
    ) / 60
  );

  const masteryLevels = {
    not_started: 0,
    familiar: 0,
    proficient: 0,
    mastered: 0,
  };
  (mastery ?? []).forEach((m: Record<string, unknown>) => {
    const level = m.mastery_level as keyof typeof masteryLevels;
    if (level in masteryLevels) masteryLevels[level]++;
  });
  const totalSkills = (mastery ?? []).length || 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={(student.avatar_url as string) ?? undefined} />
          <AvatarFallback className="text-xl">
            {(student.full_name as string).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{student.full_name as string}</h1>
          <p className="text-sm text-muted-foreground">
            Cadastrado em{" "}
            {new Date(student.created_at as string).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              XP Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats?.total_xp as number) ?? 0).toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Nivel {(stats?.level as number) ?? 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.current_streak as number) ?? 0} dias
            </div>
            <p className="text-xs text-muted-foreground">
              Recorde: {(stats?.longest_streak as number) ?? 0} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Licoes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons}</div>
            <p className="text-xs text-muted-foreground">completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-green-500" />
              Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTimeMinutes >= 60
                ? `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`
                : `${totalTimeMinutes}m`}
            </div>
            <p className="text-xs text-muted-foreground">tempo de estudo</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Maestria por Nivel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">Dominado</span>
            <Progress
              value={(masteryLevels.mastered / totalSkills) * 100}
              className="flex-1"
            />
            <span className="w-12 text-sm text-right text-green-600">
              {masteryLevels.mastered}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">Proficiente</span>
            <Progress
              value={(masteryLevels.proficient / totalSkills) * 100}
              className="flex-1"
            />
            <span className="w-12 text-sm text-right text-blue-600">
              {masteryLevels.proficient}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">Familiar</span>
            <Progress
              value={(masteryLevels.familiar / totalSkills) * 100}
              className="flex-1"
            />
            <span className="w-12 text-sm text-right text-yellow-600">
              {masteryLevels.familiar}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm">Nao iniciado</span>
            <Progress
              value={(masteryLevels.not_started / totalSkills) * 100}
              className="flex-1"
            />
            <span className="w-12 text-sm text-right text-gray-500">
              {masteryLevels.not_started}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges Conquistados ({(studentBadges ?? []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(studentBadges ?? []).length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum badge conquistado ainda.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {(studentBadges ?? []).map(
                (sb: Record<string, unknown>, i: number) => {
                  const badge = sb.badges as Record<string, unknown> | null;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border p-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        {(badge?.icon_url as string) ? "🏆" : "⭐"}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {(badge?.name as string) ?? "Badge"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {(badge?.category as string) ?? "special"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
