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
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("name")
    .eq("slug", cursoSlug)
    .eq("is_active", true)
    .single();
  return {
    title: course
      ? `${course.name} | INEMA Academia`
      : "Curso | INEMA Academia",
  };
}

type UnitRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
};

type LessonRow = {
  id: string;
  unit_id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  order: number;
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; cursoSlug: string }>;
}) {
  const { slug, cursoSlug } = await params;
  const supabase = await createClient();

  // Fetch subject
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug, color")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!subject) notFound();

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, slug, description, subject_id")
    .eq("slug", cursoSlug)
    .eq("is_active", true)
    .single();

  if (!course || course.subject_id !== subject.id) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch units first
  const { data: unitsList } = await supabase
    .from("units")
    .select("id, name, slug, description, order")
    .eq("course_id", course.id)
    .eq("is_active", true)
    .order("order");

  const units = (unitsList ?? []) as UnitRow[];
  const unitIds = units.map((u) => u.id);

  // Fetch lessons and progress in parallel
  const [{ data: lessonsData }, progressResult] = await Promise.all([
    unitIds.length > 0
      ? supabase
          .from("lessons")
          .select("id, unit_id, name, slug, description, type, order")
          .in("unit_id", unitIds)
          .eq("is_active", true)
          .order("order")
      : Promise.resolve({ data: [] as LessonRow[] }),
    user
      ? supabase
          .from("lesson_progress")
          .select("lesson_id, status")
          .eq("student_id", user.id)
      : Promise.resolve({ data: null }),
  ]);

  const lessons = (lessonsData ?? []) as LessonRow[];

  // Build progress map
  const progressMap = new Map<string, string>();
  const lessonIds = new Set(lessons.map((l) => l.id));
  if (progressResult?.data) {
    for (const p of progressResult.data) {
      if (lessonIds.has(p.lesson_id)) {
        progressMap.set(p.lesson_id, p.status);
      }
    }
  }

  // Group lessons by unit
  const unitsWithLessons = units.map((unit) => ({
    ...unit,
    lessons: lessons.filter((l) => l.unit_id === unit.id),
  }));

  const totalLessons = lessons.length;
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
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-1">
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
          <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground">{course.description}</p>
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
        defaultValue={unitsWithLessons.map((u) => u.id)}
        className="space-y-3"
      >
        {unitsWithLessons.map((unit, unitIndex) => {
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
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent group min-h-[44px]"
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

      {unitsWithLessons.length === 0 && (
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
