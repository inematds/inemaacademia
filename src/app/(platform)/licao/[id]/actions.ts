"use server";

import { createClient } from "@/lib/supabase/server";

export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nao autenticado" };
  }

  // Check if progress record exists
  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("student_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  if (existing) {
    await supabase
      .from("lesson_progress")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("lesson_progress").insert({
      student_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
      time_spent_seconds: 0,
    });
  }

  return { success: true };
}
