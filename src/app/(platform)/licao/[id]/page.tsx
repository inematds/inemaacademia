import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonPageClient } from "./lesson-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("name")
    .eq("id", id)
    .single();
  return {
    title: lesson
      ? `${lesson.name} | INEMA Academia`
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

  if (!user) redirect("/login");

  // Fetch lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, unit_id, name, slug, description, type, order, is_active, created_at")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  // Fetch content, unit, and progress in parallel
  const [{ data: content }, { data: unit }, { data: progressData }] = await Promise.all([
    supabase
      .from("lesson_content")
      .select("id, lesson_id, content_type, video_url, article_body, exercise_data, created_at")
      .eq("lesson_id", lesson.id)
      .single(),
    supabase
      .from("units")
      .select("id, course_id, name, slug, description, order, is_active, created_at")
      .eq("id", lesson.unit_id)
      .single(),
    supabase
      .from("lesson_progress")
      .select("status")
      .eq("student_id", user.id)
      .eq("lesson_id", lesson.id)
      .single(),
  ]);

  // Fetch course, sibling lessons, and subject
  const [courseResult, { data: siblingLessons }] = await Promise.all([
    unit
      ? supabase
          .from("courses")
          .select("id, subject_id, name, slug, description, thumbnail_url, order, is_active, created_at")
          .eq("id", unit.course_id)
          .single()
      : Promise.resolve({ data: null }),
    unit
      ? supabase
          .from("lessons")
          .select("id, unit_id, name, slug, description, type, order, is_active, created_at")
          .eq("unit_id", unit.id)
          .eq("is_active", true)
          .order("order")
      : Promise.resolve({ data: [] }),
  ]);

  const course = courseResult?.data ?? null;

  const { data: subject } = course
    ? await supabase
        .from("subjects")
        .select("id, name, slug, description, icon, color, category, order, is_active, created_at")
        .eq("id", course.subject_id)
        .single()
    : { data: null };

  const siblings = siblingLessons ?? [];
  const currentIndex = siblings.findIndex((l) => l.id === id);
  const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextLesson = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  // Map to the format expected by LessonPageClient (camelCase from drizzle schema)
  const lessonMapped = {
    id: lesson.id,
    unitId: lesson.unit_id,
    name: lesson.name,
    slug: lesson.slug,
    description: lesson.description,
    type: lesson.type,
    order: lesson.order,
    isActive: lesson.is_active,
    createdAt: new Date(lesson.created_at),
  };

  const contentMapped = content
    ? {
        id: content.id,
        lessonId: content.lesson_id,
        contentType: content.content_type,
        videoUrl: content.video_url,
        articleBody: content.article_body,
        exerciseData: content.exercise_data,
        createdAt: new Date(content.created_at),
      }
    : null;

  const unitMapped = unit
    ? {
        id: unit.id,
        courseId: unit.course_id,
        name: unit.name,
        slug: unit.slug,
        description: unit.description,
        order: unit.order,
        isActive: unit.is_active,
        createdAt: new Date(unit.created_at),
      }
    : null;

  const courseMapped = course
    ? {
        id: course.id,
        subjectId: course.subject_id,
        name: course.name,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
        order: course.order,
        isActive: course.is_active,
        createdAt: new Date(course.created_at),
      }
    : null;

  const subjectMapped = subject
    ? {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        description: subject.description,
        icon: subject.icon,
        color: subject.color,
        category: subject.category,
        order: subject.order,
        isActive: subject.is_active,
        createdAt: new Date(subject.created_at),
      }
    : null;

  const mapSibling = (s: (typeof siblings)[0]) => ({
    id: s.id,
    unitId: s.unit_id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    type: s.type,
    order: s.order,
    isActive: s.is_active,
    createdAt: new Date(s.created_at),
  });

  return (
    <LessonPageClient
      lesson={lessonMapped}
      content={contentMapped}
      unit={unitMapped}
      course={courseMapped}
      subject={subjectMapped}
      siblingLessons={siblings.map(mapSibling)}
      prevLesson={prevLesson ? mapSibling(prevLesson) : null}
      nextLesson={nextLesson ? mapSibling(nextLesson) : null}
      userId={user.id}
      initialStatus={progressData?.status ?? "not_started"}
    />
  );
}
