import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  FlaskConical,
  BookOpen,
  Landmark,
  Pen,
  Globe,
  type LucideIcon,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getSubjectBySlug,
  getCoursesBySubject,
  getCourseProgressForUser,
} from "@/db/queries/content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, LucideIcon> = {
  calculator: Calculator,
  "flask-conical": FlaskConical,
  flask: FlaskConical,
  "book-open": BookOpen,
  book: BookOpen,
  landmark: Landmark,
  pen: Pen,
  globe: Globe,
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

  const coursesList = await getCoursesBySubject(subject.id);

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
      return { ...course, completedLessons, totalLessons, progress: pct };
    }),
  );

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
        {coursesWithProgress.map((course) => (
          <Link
            key={course.id}
            href={`/materias/${subject.slug}/${course.slug}`}
          >
            <Card className="group h-full transition-shadow hover:shadow-md cursor-pointer">
              {course.thumbnailUrl && (
                <div className="relative h-36 overflow-hidden rounded-t-xl">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.name}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {course.name}
                </CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} licoes
                    </span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              </CardContent>
            </Card>
          </Link>
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
