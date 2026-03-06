"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleEnrollmentAction(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao autenticado" };
  }

  // Check current enrollment
  const { data: existing } = await supabase
    .from("student_enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    await supabase
      .from("student_enrollments")
      .delete()
      .eq("student_id", user.id)
      .eq("course_id", courseId);
  } else {
    await supabase
      .from("student_enrollments")
      .insert({ student_id: user.id, course_id: courseId });
  }

  revalidatePath("/materias");
  revalidatePath("/aluno");

  return { enrolled: !existing };
}
