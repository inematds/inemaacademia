import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getLessonWithContent,
  getLessonProgressForUser,
} from "@/db/queries/content";
import { LessonPageClient } from "./lesson-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLessonWithContent(id);
  return {
    title: data
      ? `${data.lesson.name} | INEMA Academia`
      : "Licao | INEMA Academia",
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getLessonWithContent(id);
  if (!data) notFound();

  // If exercise type, redirect to exercise player
  if (data.lesson.type === "exercise" && data.content?.exerciseData) {
    // For now, render in-page; the exercise player can be built later
  }

  const progress = await getLessonProgressForUser(user.id, data.lesson.id);

  return (
    <LessonPageClient
      lesson={data.lesson}
      content={data.content}
      unit={data.unit}
      course={data.course}
      subject={data.subject}
      siblingLessons={data.siblingLessons}
      prevLesson={data.prevLesson}
      nextLesson={data.nextLesson}
      userId={user.id}
      initialStatus={progress?.status ?? "not_started"}
    />
  );
}
