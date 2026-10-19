import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Atom,
  Calculator,
  FlaskConical,
  BookOpen,
  Landmark,
  Pen,
  Globe,
  Cpu,
  Heart,
  Palette,
  Dumbbell,
  type LucideIcon,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CourseCard } from "./course-card";

const iconMap: Record<string, LucideIcon> = {
  Atom: Atom,
  atom: Atom,
  calculator: Calculator,
  Calculator: Calculator,
  "flask-conical": FlaskConical,
  FlaskConical: FlaskConical,
  flask: FlaskConical,
  "book-open": BookOpen,
  BookOpen: BookOpen,
  book: BookOpen,
  landmark: Landmark,
  Landmark: Landmark,
  pen: Pen,
  Pen: Pen,
  globe: Globe,
  Globe: Globe,
  Cpu: Cpu,
  cpu: Cpu,
  Heart: Heart,
  heart: Heart,
  Palette: Palette,
  palette: Palette,
  Dumbbell: Dumbbell,
  dumbbell: Dumbbell,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return {
    title: subject
      ? `${subject.name} | INEMA Academia`
      : "Materia | INEMA Academia",
  };
}

export default async function SubjectCoursesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch subject
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug, description, icon, color, category")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!subject) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch courses, profile, enrollments in parallel
  const [{ data: coursesList }, profileResult, enrollResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, slug, description, thumbnail_url, grade_levels, order")
      .eq("subject_id", subject.id)
      .eq("is_active", true)
      .order("order"),
    user
      ? supabase.from("profiles").select("role, grade_level").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("student_enrollments").select("course_id").eq("student_id", user.id)
      : Promise.resolve({ data: null }),
  ]);

  const gradeLevel = profileResult?.data?.grade_level ?? null;
  // Aluno (ou visitante) nao ve curso sem licao; admin/professor veem tudo.
  const isStudent = !profileResult?.data || profileResult.data.role === "aluno";
  const isCurricular = subject.category === "curricular";
  const enrolledIds = (enrollResult?.data ?? []).map((r: { course_id: string }) => r.course_id);

  // Contagem real de licoes ativas por curso e das concluidas pelo usuario
  // (antes ficava fixo em 0/0).
  const courseIds = (coursesList ?? []).map((c) => c.id);
  const { data: unitRows } = courseIds.length
    ? await supabase
        .from("units")
        .select("course_id, grade_level, lessons(id, is_active)")
        .in("course_id", courseIds)
        .eq("is_active", true)
    : { data: [] as Array<{ course_id: string; grade_level: string | null; lessons: Array<{ id: string; is_active: boolean }> }> };
  const lessonsByCourse = new Map<string, string[]>();
  // Cursos que tem unidade com licao da serie do aluno (ex.: Algebra tem unidade do 7o ano)
  const coursesWithMyGrade = new Set<string>();
  for (const u of (unitRows ?? []) as Array<{ course_id: string; grade_level: string | null; lessons: Array<{ id: string; is_active: boolean }> | null }>) {
    const ids = (u.lessons ?? []).filter((l) => l.is_active).map((l) => l.id);
    lessonsByCourse.set(u.course_id, [...(lessonsByCourse.get(u.course_id) ?? []), ...ids]);
    if (gradeLevel && u.grade_level === gradeLevel && ids.length > 0) coursesWithMyGrade.add(u.course_id);
  }
  const allLessonIds = [...lessonsByCourse.values()].flat();
  const { data: doneRows } =
    user && allLessonIds.length
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("student_id", user.id)
          .eq("status", "completed")
          .in("lesson_id", allLessonIds)
      : { data: [] as Array<{ lesson_id: string }> };
  const doneSet = new Set((doneRows ?? []).map((r: { lesson_id: string }) => r.lesson_id));

  const coursesWithData = (coursesList ?? []).map((course) => {
    const lessonIds = lessonsByCourse.get(course.id) ?? [];
    const totalLessons = lessonIds.length;
    const completedLessons = lessonIds.filter((id) => doneSet.has(id)).length;
    const matchesGrade =
      !isCurricular ||
      !gradeLevel ||
      !course.grade_levels ||
      course.grade_levels.split(",").includes(gradeLevel) ||
      coursesWithMyGrade.has(course.id);
    return {
      id: course.id,
      name: course.name,
      slug: course.slug,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      completedLessons,
      totalLessons,
      progress: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
      matchesGrade,
    };
  });

  const visibleCourses = isStudent
    ? coursesWithData.filter((c) => c.totalLessons > 0)
    : coursesWithData;

  // Sort: matching grade first
  const sortedCourses = isCurricular && gradeLevel
    ? [
        ...visibleCourses.filter((c) => c.matchesGrade),
        ...visibleCourses.filter((c) => !c.matchesGrade),
      ]
    : visibleCourses;

  const Icon = iconMap[subject.icon ?? "book"] ?? BookOpen;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/materias">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: subject.color ?? "#3B82F6" }}
          >
            <Icon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {subject.name}
            </h1>
            <p className="text-muted-foreground">{subject.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            subjectSlug={subject.slug}
            isCurricular={isCurricular}
            gradeLevel={gradeLevel}
            enrolled={enrolledIds.includes(course.id)}
          />
        ))}
      </div>

      {sortedCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">Nenhum curso disponivel</h2>
          <p className="text-muted-foreground">
            Os cursos desta materia serao adicionados em breve.
          </p>
        </div>
      )}
    </div>
  );
}
