"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema/progress";
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
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.studentId, user.id),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(lessonProgress)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    // Insert new
    await db.insert(lessonProgress).values({
      studentId: user.id,
      lessonId,
      status: "completed",
      completedAt: new Date(),
      timeSpentSeconds: 0,
    });
  }

  return { success: true };
}
