import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClassesListClient } from "./client";

export default async function ClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all classes for this teacher
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  // Get student counts per class
  const classIds = (classes ?? []).map((c: Record<string, unknown>) => c.id as string);
  let studentCounts: Record<string, number> = {};

  if (classIds.length > 0) {
    const { data: enrollments } = await supabase
      .from("class_students")
      .select("class_id")
      .in("class_id", classIds);

    if (enrollments) {
      studentCounts = enrollments.reduce(
        (acc: Record<string, number>, e: Record<string, unknown>) => {
          const cid = e.class_id as string;
          acc[cid] = (acc[cid] || 0) + 1;
          return acc;
        },
        {}
      );
    }
  }

  const classesWithCounts = (classes ?? []).map(
    (cls: Record<string, unknown>) => ({
      id: cls.id as string,
      name: cls.name as string,
      description: (cls.description as string) ?? null,
      code: cls.code as string,
      schoolName: (cls.school_name as string) ?? null,
      gradeLevel: (cls.grade_level as string) ?? null,
      isActive: cls.is_active as boolean,
      createdAt: cls.created_at as string,
      studentCount: studentCounts[cls.id as string] ?? 0,
    })
  );

  return <ClassesListClient classes={classesWithCounts} />;
}
