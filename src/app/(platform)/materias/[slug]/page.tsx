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
import {
  getSubjectBySlug,
  getCoursesBySubject,
  getCourseProgressForUser,
  getUserProfile,
  getEnrolledCourseIds,
} from "@/db/queries/content";
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
  const subject = await getSubjectBySlug(slug);
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
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [coursesList, profile, enrolledIds] = await Promise.all([
    getCoursesBySubject(subject.id),
    user ? getUserProfile(user.id) : null,
    user ? getEnrolledCourseIds(user.id) : ([] as string[]),
  ]);

  const gradeLevel = profile?.gradeLevel ?? null;
  const isCurricular = subject.category === "curricular";

  const coursesWithProgress = await Promise.all(
    coursesList.map(async (course) => {
      let completedLessons = 0;
      let totalLessons = 0;
      if (user) {
        const progress = await getCourseProgressForUser(user.id, course.id);
        if (progress) {
          completedLessons = progress.completedLessons;
          totalLessons = progress.totalLessons;
        }
      }
      const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const matchesGrade =
        !isCurricular ||
        !gradeLevel ||
        !course.gradeLevels ||
        course.gradeLevels.split(",").includes(gradeLevel);
      return {
        id: course.id,
        name: course.name,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        completedLessons,
        totalLessons,
        progress: pct,
        matchesGrade,
      };
    }),
  );

  // Sort: matching grade first, then non-matching
  const sortedCourses = isCurricular && gradeLevel
    ? [
        ...coursesWithProgress.filter((c) => c.matchesGrade),
        ...coursesWithProgress.filter((c) => !c.matchesGrade),
      ]
    : coursesWithProgress;

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

      {coursesWithProgress.length === 0 && (
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
