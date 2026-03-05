"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  PencilLine,
  HelpCircle,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { markLessonComplete } from "./actions";

type Lesson = {
  id: string;
  unitId: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
};

type LessonContentData = {
  id: string;
  lessonId: string;
  contentType: string;
  videoUrl: string | null;
  articleBody: string | null;
  exerciseData: unknown;
  createdAt: Date;
} | null;

type Unit = {
  id: string;
  courseId: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
} | null;

type Course = {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
} | null;

type Subject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
} | null;

const typeIcons: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  article: FileText,
  exercise: PencilLine,
  quiz: HelpCircle,
};

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function VideoPlayer({ url }: { url: string }) {
  const videoId = extractYoutubeId(url);
  if (!videoId) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-muted aspect-video">
        <p className="text-muted-foreground">Video nao disponivel</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Video da aula"
        className="absolute inset-0 size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ArticleRenderer({ body }: { body: string }) {
  // Simple markdown-like rendering with support for headings, bold, lists, blockquotes, code blocks, and KaTeX
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={i}
            className="my-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm"
          >
            <code>{codeContent}</code>
          </pre>,
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<br key={i} />);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mt-6 mb-3 text-lg font-semibold">
          {line.slice(4)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mt-8 mb-4 text-xl font-bold">
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="mt-8 mb-4 text-2xl font-bold">
          {line.slice(2)}
        </h1>,
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="my-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
        >
          {line.slice(2)}
        </blockquote>,
      );
      continue;
    }

    // List items
    if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-6 list-disc text-sm leading-relaxed">
          {renderInline(line.slice(2))}
        </li>,
      );
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s(.+)/);
    if (olMatch) {
      elements.push(
        <li key={i} className="ml-6 list-decimal text-sm leading-relaxed">
          {renderInline(olMatch[2])}
        </li>,
      );
      continue;
    }

    // LaTeX block ($$...$$)
    if (line.startsWith("$$") && line.endsWith("$$") && line.length > 4) {
      elements.push(
        <div
          key={i}
          className="my-4 overflow-x-auto rounded-lg bg-muted/50 p-4 text-center font-mono text-sm"
        >
          {line.slice(2, -2)}
        </div>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed">
        {renderInline(line)}
      </p>,
    );
  }

  return <div className="prose-sm max-w-none space-y-1">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**, *italic*, `code`, $latex$
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(
        <strong key={key++} className="font-semibold">
          {boldMatch[1]}
        </strong>,
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.slice(0, codeMatch.index));
      }
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // Inline math $...$
    const mathMatch = remaining.match(/\$(.+?)\$/);
    if (mathMatch && mathMatch.index !== undefined) {
      if (mathMatch.index > 0) {
        parts.push(remaining.slice(0, mathMatch.index));
      }
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted/50 px-1 py-0.5 text-xs font-mono italic"
        >
          {mathMatch[1]}
        </code>,
      );
      remaining = remaining.slice(mathMatch.index + mathMatch[0].length);
      continue;
    }

    // No more matches
    parts.push(remaining);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function ExerciseContent({ data }: { data: unknown }) {
  const exerciseData = data as {
    questions?: Array<{
      question: string;
      options: string[];
      correct: number;
    }>;
  };

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!exerciseData?.questions) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Exercicio nao disponivel</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exerciseData.questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium">
            Questao {qi + 1}: {q.question}
          </h3>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => {
                  if (!showResults) {
                    setAnswers((prev) => ({ ...prev, [qi]: oi }));
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm text-left transition-colors min-h-[48px]",
                  answers[qi] === oi && !showResults && "border-primary bg-primary/5",
                  showResults && oi === q.correct && "border-green-500 bg-green-50",
                  showResults &&
                    answers[qi] === oi &&
                    oi !== q.correct &&
                    "border-red-500 bg-red-50",
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-full border text-xs font-medium">
                  {String.fromCharCode(65 + oi)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Button
        onClick={() => setShowResults(true)}
        disabled={
          showResults ||
          Object.keys(answers).length < exerciseData.questions.length
        }
        className="w-full"
      >
        {showResults ? "Resultado exibido" : "Verificar Respostas"}
      </Button>

      {showResults && (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="font-medium">
            Voce acertou{" "}
            {
              exerciseData.questions.filter(
                (q, i) => answers[i] === q.correct,
              ).length
            }{" "}
            de {exerciseData.questions.length} questoes!
          </p>
        </div>
      )}
    </div>
  );
}

export function LessonPageClient({
  lesson,
  content,
  unit,
  course,
  subject,
  siblingLessons,
  prevLesson,
  nextLesson,
  userId: _userId,
  initialStatus,
}: {
  lesson: Lesson;
  content: LessonContentData;
  unit: Unit;
  course: Course;
  subject: Subject;
  siblingLessons: Lesson[];
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  userId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prefetch next lesson for instant navigation
  useEffect(() => {
    if (nextLesson) {
      router.prefetch(`/licao/${nextLesson.id}`);
    }
    if (prevLesson) {
      router.prefetch(`/licao/${prevLesson.id}`);
    }
  }, [nextLesson, prevLesson, router]);

  function handleMarkComplete() {
    startTransition(async () => {
      const result = await markLessonComplete(lesson.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setStatus("completed");
        toast.success("Licao marcada como concluida!");
      }
    });
  }

  const backHref =
    subject && course
      ? `/materias/${subject.slug}/${course.slug}`
      : "/materias";

  const sidebarNav = (
    <nav className="space-y-1 p-4">
      <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
        {unit?.name ?? "Unidade"}
      </p>
      {siblingLessons.map((l) => {
        const TypeIcon = typeIcons[l.type] ?? Circle;
        const isCurrent = l.id === lesson.id;

        return (
          <Link
            key={l.id}
            href={`/licao/${l.id}`}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isCurrent
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <TypeIcon className="size-4 shrink-0" />
            <span className="truncate">{l.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 rounded-lg border bg-card overflow-hidden">
          {sidebarNav}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navegacao da unidade</SheetTitle>
              </SheetHeader>
              {sidebarNav}
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{lesson.name}</h1>
            {lesson.description && (
              <p className="text-sm text-muted-foreground truncate">
                {lesson.description}
              </p>
            )}
          </div>

          <Badge variant="outline">
            {lesson.type === "video"
              ? "Video"
              : lesson.type === "article"
                ? "Artigo"
                : lesson.type === "exercise"
                  ? "Exercicio"
                  : "Quiz"}
          </Badge>
        </div>

        {/* Content */}
        <div className="rounded-lg border bg-card p-4 lg:p-6">
          {content?.contentType === "video" && content.videoUrl && (
            <VideoPlayer url={content.videoUrl} />
          )}

          {content?.contentType === "article" && content.articleBody && (
            <ArticleRenderer body={content.articleBody} />
          )}

          {content?.contentType === "exercise" && content.exerciseData != null && (
            <ExerciseContent data={content.exerciseData} />
          )}

          {!content && (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">
                Conteudo desta licao ainda nao disponivel.
              </p>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-2 sm:order-1">
            {prevLesson && (
              <Button variant="outline" className="min-h-[44px] w-full sm:w-auto" asChild>
                <Link href={`/licao/${prevLesson.id}`}>
                  <ArrowLeft className="mr-2 size-4" />
                  Anterior
                </Link>
              </Button>
            )}
          </div>

          <div className="order-1 flex flex-col gap-2 sm:order-2 sm:flex-row sm:items-center sm:gap-3">
            {status === "completed" ? (
              <Button disabled variant="secondary" className="min-h-[44px]">
                <CheckCircle2 className="mr-2 size-4 text-green-500" />
                Concluida
              </Button>
            ) : (
              <Button onClick={handleMarkComplete} disabled={isPending} className="min-h-[44px]">
                {isPending ? "Salvando..." : "Marcar como concluida"}
              </Button>
            )}

            {nextLesson && (
              <Button variant="outline" className="min-h-[44px]" asChild>
                <Link href={`/licao/${nextLesson.id}`}>
                  Proxima
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
