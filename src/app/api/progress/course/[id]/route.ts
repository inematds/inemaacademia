import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Nao autorizado." },
        { status: 401 },
      );
    }

    const studentId = user.id;

    // Get course info
    const { data: course } = await supabase
      .from("courses")
      .select("id, name, slug, description, thumbnail_url")
      .eq("id", courseId)
      .single();

    if (!course) {
      return NextResponse.json(
        { error: "Curso nao encontrado." },
        { status: 404 },
      );
    }

    // Get units and lessons
    const { data: units } = await supabase
      .from("units")
      .select("id, name, slug, description, order")
      .eq("course_id", courseId)
      .eq("is_active", true)
      .order("order");

    const unitIds = (units ?? []).map((u) => u.id);

    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, unit_id, name, slug, type, order")
      .in("unit_id", unitIds.length > 0 ? unitIds : ["__none__"])
      .eq("is_active", true)
      .order("order");

    const lessonIds = (lessons ?? []).map((l) => l.id);

    // Get lesson progress
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, status, completed_at, time_spent_seconds")
      .eq("student_id", studentId)
      .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["__none__"]);

    const progressMap = new Map(
      (progress ?? []).map((p) => [p.lesson_id, p]),
    );

    // Get skill mastery
    const { data: masteries } = await supabase
      .from("skill_mastery")
      .select("lesson_id, mastery_level, mastery_points")
      .eq("student_id", studentId)
      .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["__none__"]);

    const masteryMap = new Map(
      (masteries ?? []).map((m) => [m.lesson_id, m]),
    );

    // Get course progress summary
    const { data: courseProgress } = await supabase
      .from("course_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .single();

    // Build response
    const unitsWithLessons = (units ?? []).map((unit) => {
      const unitLessons = (lessons ?? [])
        .filter((l) => l.unit_id === unit.id)
        .map((lesson) => {
          const lp = progressMap.get(lesson.id);
          const sm = masteryMap.get(lesson.id);

          return {
            id: lesson.id,
            name: lesson.name,
            slug: lesson.slug,
            type: lesson.type,
            order: lesson.order,
            status: lp?.status ?? "not_started",
            completedAt: lp?.completed_at ?? null,
            timeSpentSeconds: lp?.time_spent_seconds ?? 0,
            masteryLevel: sm?.mastery_level ?? "not_started",
            masteryPoints: sm?.mastery_points ?? 0,
          };
        });

      return {
        id: unit.id,
        name: unit.name,
        slug: unit.slug,
        description: unit.description,
        order: unit.order,
        lessons: unitLessons,
      };
    });

    const totalLessons = lessonIds.length;
    const completedLessons = (progress ?? []).filter(
      (p) => p.status === "completed",
    ).length;

    return NextResponse.json({
      course: {
        id: course.id,
        name: course.name,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnail_url,
      },
      totalLessons,
      completedLessons,
      masteryPercentage: courseProgress?.mastery_percentage
        ? parseFloat(courseProgress.mastery_percentage)
        : totalLessons > 0
          ? parseFloat(((completedLessons / totalLessons) * 100).toFixed(2))
          : 0,
      units: unitsWithLessons,
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
