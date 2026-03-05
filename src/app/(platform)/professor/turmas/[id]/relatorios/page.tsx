import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ReportsClient } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify class
  const { data: cls } = await supabase
    .from("classes")
    .select("id, name")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) notFound();

  // Get students
  const { data: classStudents } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", id);

  const studentIds = (classStudents ?? []).map(
    (s: Record<string, unknown>) => s.student_id as string
  );

  let profiles: Record<string, unknown>[] = [];
  let studentStats: Record<string, unknown>[] = [];
  let lessonProgress: Record<string, unknown>[] = [];
  let masteryData: Record<string, unknown>[] = [];
  let assignmentData: Record<string, unknown>[] = [];
  let submissionData: Record<string, unknown>[] = [];

  if (studentIds.length > 0) {
    const [profilesRes, statsRes, progressRes, masteryRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", studentIds),
      supabase
        .from("student_stats")
        .select("student_id, total_xp, current_streak, level, last_active_date")
        .in("student_id", studentIds),
      supabase
        .from("lesson_progress")
        .select("student_id, lesson_id, time_spent_seconds, completed_at, status")
        .in("student_id", studentIds),
      supabase
        .from("skill_mastery")
        .select(
          `
          student_id,
          lesson_id,
          mastery_level,
          mastery_points,
          lessons:lesson_id (
            name
          )
        `
        )
        .in("student_id", studentIds),
    ]);

    profiles = profilesRes.data ?? [];
    studentStats = statsRes.data ?? [];
    lessonProgress = progressRes.data ?? [];
    masteryData = masteryRes.data ?? [];
  }

  // Get assignments and submissions for this class
  const { data: assignmentsRaw } = await supabase
    .from("assignments")
    .select("id, title, content_type, due_date, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: false });

  assignmentData = assignmentsRaw ?? [];

  const assignmentIds = assignmentData.map(
    (a: Record<string, unknown>) => a.id as string
  );

  if (assignmentIds.length > 0 && studentIds.length > 0) {
    const { data: subs } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, student_id, status, score, completed_at")
      .in("assignment_id", assignmentIds)
      .in("student_id", studentIds);
    submissionData = subs ?? [];
  }

  // Build students data
  const students = studentIds.map((sid) => {
    const profile = profiles.find(
      (p) => (p as Record<string, unknown>).id === sid
    ) as Record<string, unknown> | undefined;
    const stats = studentStats.find(
      (s) => (s as Record<string, unknown>).student_id === sid
    ) as Record<string, unknown> | undefined;

    const studentLessons = lessonProgress.filter(
      (p) => (p as Record<string, unknown>).student_id === sid
    ) as Record<string, unknown>[];

    const totalTimeSeconds = studentLessons.reduce(
      (sum, p) => sum + ((p.time_spent_seconds as number) ?? 0),
      0
    );

    // Time in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const time7d = studentLessons
      .filter((p) => {
        const date = p.completed_at as string | null;
        return date && new Date(date) >= sevenDaysAgo;
      })
      .reduce(
        (sum, p) => sum + ((p.time_spent_seconds as number) ?? 0),
        0
      );

    // Time in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const time30d = studentLessons
      .filter((p) => {
        const date = p.completed_at as string | null;
        return date && new Date(date) >= thirtyDaysAgo;
      })
      .reduce(
        (sum, p) => sum + ((p.time_spent_seconds as number) ?? 0),
        0
      );

    return {
      id: sid,
      name: (profile?.full_name as string) ?? "Aluno",
      avatarUrl: (profile?.avatar_url as string) ?? null,
      xp: (stats?.total_xp as number) ?? 0,
      streak: (stats?.current_streak as number) ?? 0,
      level: (stats?.level as number) ?? 1,
      lastActive: (stats?.last_active_date as string) ?? null,
      totalTimeMinutes: Math.round(totalTimeSeconds / 60),
      time7dMinutes: Math.round(time7d / 60),
      time30dMinutes: Math.round(time30d / 60),
      completedLessons: studentLessons.filter(
        (p) => p.status === "completed"
      ).length,
    };
  });

  // Build mastery report
  const lessonNamesMap = new Map<string, string>();
  masteryData.forEach((m: Record<string, unknown>) => {
    const lesson = m.lessons as Record<string, unknown> | null;
    if (lesson) {
      lessonNamesMap.set(
        m.lesson_id as string,
        lesson.name as string
      );
    }
  });

  const lessonIds = [...new Set(masteryData.map((m: Record<string, unknown>) => m.lesson_id as string))];
  const masteryMatrix = lessonIds.map((lid) => ({
    lessonId: lid,
    lessonName: lessonNamesMap.get(lid) ?? "Licao",
    students: studentIds.map((sid) => {
      const entry = masteryData.find(
        (m: Record<string, unknown>) =>
          m.student_id === sid && m.lesson_id === lid
      ) as Record<string, unknown> | undefined;
      return {
        studentId: sid,
        level: (entry?.mastery_level as string) ?? "not_started",
        points: (entry?.mastery_points as number) ?? 0,
      };
    }),
  }));

  // Build assignment report
  const assignmentReport = assignmentData.map(
    (a: Record<string, unknown>) => ({
      id: a.id as string,
      title: a.title as string,
      dueDate: (a.due_date as string) ?? null,
      students: studentIds.map((sid) => {
        const sub = submissionData.find(
          (s: Record<string, unknown>) =>
            s.assignment_id === a.id && s.student_id === sid
        ) as Record<string, unknown> | undefined;
        return {
          studentId: sid,
          status: (sub?.status as string) ?? "pending",
          score: sub?.score ? parseFloat(sub.score as string) : null,
        };
      }),
    })
  );

  return (
    <ReportsClient
      className={cls.name as string}
      classId={id}
      students={students}
      masteryMatrix={masteryMatrix}
      assignmentReport={assignmentReport}
    />
  );
}
