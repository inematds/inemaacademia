import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  PencilLine,
  HelpCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getSubjectBySlug,
  getCourseBySlug,
  getCourseWithUnitsAndLessons,
  getLessonProgressForUser,
} from "@/db/queries/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const typeIcons: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  article: FileText,
  exercise: PencilLine,
  quiz: HelpCircle,
};

const typeLabels: Record<string, string> = {
  video: "Video",
  article: "Artigo",
  exercise: "Exercicio",
  quiz: "Quiz",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; cursoSlug: string }>;
}) {
  const { cursoSlug } = await params;
  const course = await getCourseBySlug(cursoSlug);
  return {
    title: course
      ? `${course.name} | INEMA Academia`
      : "Curso | INEMA Academia",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; cursoSlug: string }>;
}) {
  const { slug, cursoSlug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const course = await getCourseBySlug(cursoSlug);
  if (!course || course.subjectId !== subject.id) notFound();

  const courseData = await getCourseWithUnitsAndLessons(course.id);
  if (!courseData) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gather lesson progress for the user
  const progressMap = new Map<string, string>();
  if (user) {
    for (const unit of courseData.units) {
      for (const lesson of unit.lessons) {
        const progress = await getLessonProgressForUser(user.id, lesson.id);
        if (progress) {
          progressMap.set(lesson.id, progress.status);
        }
      }
    }
  }

  const totalLessons = courseData.units.reduce(
    (sum, u) => sum + u.lessons.length,
    0,
  );
  const completedCount = Array.from(progressMap.values()).filter(
    (s) => s === "completed",
  ).length;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/materias/${slug}`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/materias" className="hover:text-foreground">
              Materias
            </Link>
            <span>/</span>
            <Link
              href={`/materias/${slug}`}
              className="hover:text-foreground"
              style={{ color: subject.color ?? undefined }}
            >
              {subject.name}
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {courseData.name}
          </h1>
          <p className="text-muted-foreground">{courseData.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {completedCount} de {totalLessons} licoes concluidas
          </span>
          <span className="font-medium">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} />
      </div>

      {/* Units accordion */}
      <Accordion
        type="multiple"
        defaultValue={courseData.units.map((u) => u.id)}
        className="space-y-3"
      >
        {courseData.units.map((unit, unitIndex) => {
          const unitCompleted = unit.lessons.filter(
            (l) => progressMap.get(l.id) === "completed",
          ).length;
          const unitTotal = unit.lessons.length;

          return (
            <AccordionItem
              key={unit.id}
              value={unit.id}
              className="rounded-lg border bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      backgroundColor: subject.color ?? "#3B82F6",
                    }}
                  >
                    {unitIndex + 1}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{unit.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {unitCompleted}/{unitTotal} licoes concluidas
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pt-2">
                  {unit.lessons.map((lesson) => {
                    const status = progressMap.get(lesson.id);
                    const isCompleted = status === "completed";
                    const TypeIcon = typeIcons[lesson.type] ?? Circle;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/licao/${lesson.id}`}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent group"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                        ) : (
                          <TypeIcon className="size-5 text-muted-foreground shrink-0 group-hover:text-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className={
                              isCompleted
                                ? "text-sm text-muted-foreground line-through"
                                : "text-sm"
                            }
                          >
                            {lesson.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {typeLabels[lesson.type] ?? lesson.type}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {courseData.units.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="size-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">Nenhuma unidade disponivel</h2>
          <p className="text-muted-foreground">
            O conteudo deste curso sera adicionado em breve.
          </p>
        </div>
      )}
    </div>
  );
}
