import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./leaderboard-client";

export const metadata = {
  title: "Ranking | INEMA Academia",
};

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentId = user.id;

  // Get top 50 all-time
  const { data: allTimeRanking } = await supabase
    .from("student_stats")
    .select("student_id, total_xp, level, current_streak")
    .order("total_xp", { ascending: false })
    .limit(50);

  // Get all profile data for ranked students
  const allStudentIds = [
    ...new Set([
      ...(allTimeRanking ?? []).map((r) => r.student_id),
    ]),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", allStudentIds.length > 0 ? allStudentIds : ["__none__"]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { fullName: p.full_name, avatarUrl: p.avatar_url }]),
  );

  // Get user's class (if any)
  const { data: userClasses } = await supabase
    .from("class_students")
    .select("class_id, classes(id, name)")
    .eq("student_id", studentId);

  let classRanking: Array<{
    studentId: string;
    totalXp: number;
    level: number;
    fullName: string;
    avatarUrl: string | null;
  }> = [];

  let className: string | null = null;

  if (userClasses && userClasses.length > 0) {
    const classInfo = userClasses[0].classes as unknown as { id: string; name: string } | null;
    className = classInfo?.name ?? null;
    const classId = userClasses[0].class_id;

    // Get all students in the class
    const { data: classStudents } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", classId);

    const classStudentIds = (classStudents ?? []).map((cs) => cs.student_id);

    if (classStudentIds.length > 0) {
      const { data: classStats } = await supabase
        .from("student_stats")
        .select("student_id, total_xp, level")
        .in("student_id", classStudentIds)
        .order("total_xp", { ascending: false });

      // Fetch class profiles
      const { data: classProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", classStudentIds);

      const classProfileMap = new Map(
        (classProfiles ?? []).map((p) => [
          p.id,
          { fullName: p.full_name, avatarUrl: p.avatar_url },
        ]),
      );

      classRanking = (classStats ?? []).map((s) => ({
        studentId: s.student_id,
        totalXp: s.total_xp,
        level: s.level,
        fullName: classProfileMap.get(s.student_id)?.fullName ?? "Estudante",
        avatarUrl: classProfileMap.get(s.student_id)?.avatarUrl ?? null,
      }));
    }
  }

  const allTimeData = (allTimeRanking ?? []).map((r) => ({
    studentId: r.student_id,
    totalXp: r.total_xp,
    level: r.level,
    currentStreak: r.current_streak,
    fullName: profileMap.get(r.student_id)?.fullName ?? "Estudante",
    avatarUrl: profileMap.get(r.student_id)?.avatarUrl ?? null,
  }));

  return (
    <LeaderboardClient
      currentUserId={studentId}
      allTimeRanking={allTimeData}
      classRanking={classRanking}
      className_={className}
    />
  );
}
