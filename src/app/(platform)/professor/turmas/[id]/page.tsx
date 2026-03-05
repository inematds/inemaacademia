import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ClassDetailClient } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch class
  const { data: cls } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) notFound();

  // Fetch students with profiles and stats
  const { data: classStudents } = await supabase
    .from("class_students")
    .select(
      `
      id,
      student_id,
      joined_at
    `
    )
    .eq("class_id", id)
    .order("joined_at", { ascending: false });

  const studentIds = (classStudents ?? []).map(
    (s: Record<string, unknown>) => s.student_id as string
  );

  let profiles: Record<string, unknown>[] = [];
  let stats: Record<string, unknown>[] = [];

  if (studentIds.length > 0) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", studentIds);
    profiles = profileData ?? [];

    const { data: statsData } = await supabase
      .from("student_stats")
      .select("student_id, total_xp, current_streak, level")
      .in("student_id", studentIds);
    stats = statsData ?? [];
  }

  const students = (classStudents ?? []).map(
    (cs: Record<string, unknown>) => {
      const profile = profiles.find(
        (p) => p.id === cs.student_id
      ) as Record<string, unknown> | undefined;
      const studentStats = stats.find(
        (s) => s.student_id === cs.student_id
      ) as Record<string, unknown> | undefined;

      return {
        id: cs.student_id as string,
        enrollmentId: cs.id as string,
        name: (profile?.full_name as string) ?? "Aluno",
        avatarUrl: (profile?.avatar_url as string) ?? null,
        joinedAt: cs.joined_at as string,
        xp: (studentStats?.total_xp as number) ?? 0,
        streak: (studentStats?.current_streak as number) ?? 0,
        level: (studentStats?.level as number) ?? 1,
      };
    }
  );

  // Fetch assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("class_id", id)
    .order("created_at", { ascending: false });

  const formattedAssignments = (assignments ?? []).map(
    (a: Record<string, unknown>) => ({
      id: a.id as string,
      title: a.title as string,
      description: (a.description as string) ?? null,
      contentType: a.content_type as string,
      contentId: a.content_id as string,
      dueDate: (a.due_date as string) ?? null,
      createdAt: a.created_at as string,
    })
  );

  const classData = {
    id: cls.id as string,
    name: cls.name as string,
    description: (cls.description as string) ?? null,
    code: cls.code as string,
    schoolName: (cls.school_name as string) ?? null,
    gradeLevel: (cls.grade_level as string) ?? null,
    isActive: cls.is_active as boolean,
  };

  return (
    <ClassDetailClient
      classData={classData}
      students={students}
      assignments={formattedAssignments}
    />
  );
}
