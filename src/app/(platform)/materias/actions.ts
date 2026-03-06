"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { enrollInCourse, unenrollFromCourse } from "@/db/queries/content";

export async function toggleEnrollmentAction(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao autenticado" };
  }

  // Check current enrollment via supabase (respects RLS)
  const { data: existing } = await supabase
    .from("student_enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    await unenrollFromCourse(user.id, courseId);
  } else {
    await enrollInCourse(user.id, courseId);
  }

  revalidatePath("/materias");
  revalidatePath("/aluno");

  return { enrolled: !existing };
}
