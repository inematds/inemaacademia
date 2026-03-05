import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonQuizClient } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LessonQuizPage({ params }: Props) {
  const { id: lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the lesson quiz assessment
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("related_id", lessonId)
    .eq("type", "lesson_quiz")
    .single();

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Quiz nao encontrado</h2>
          <p className="text-muted-foreground">
            Nao ha quiz disponivel para esta licao.
          </p>
        </div>
      </div>
    );
  }

  // Fetch questions
  const { data: assessmentQuestions } = await supabase
    .from("assessment_questions")
    .select(
      `
      id,
      order,
      question_id,
      questions (
        id,
        type,
        question_text,
        options,
        correct_answer,
        explanation,
        hints,
        points
      )
    `
    )
    .eq("assessment_id", assessment.id)
    .order("order", { ascending: true });

  const questions = (assessmentQuestions ?? []).map((aq: Record<string, unknown>) => {
    const q = aq.questions as Record<string, unknown> | null;
    return {
      id: (q?.id as string) ?? (aq.question_id as string),
      type: ((q?.type as string) ?? "multiple_choice") as import("@/types/exercises").QuestionType,
      questionText: (q?.question_text as string) ?? "",
      options: (q?.options as string[] | undefined) ?? undefined,
      correctAnswer: q?.correct_answer ?? undefined,
      explanation: (q?.explanation as string) ?? undefined,
      hints: (q?.hints as string[] | undefined) ?? undefined,
      points: (q?.points as number) ?? 10,
    };
  });

  // Get attempt count
  const { count: attemptCount } = await supabase
    .from("assessment_attempts")
    .select("*", { count: "exact", head: true })
    .eq("assessment_id", assessment.id)
    .eq("student_id", user.id);

  const config = {
    id: assessment.id as string,
    title: assessment.title as string,
    type: assessment.type as "lesson_quiz",
    timeLimitMinutes: null as number | null,
    passingScore: (assessment.passing_score as number) ?? 70,
    maxAttempts: 0, // unlimited
    shuffleQuestions: (assessment.shuffle_questions as boolean) ?? true,
  };

  return (
    <LessonQuizClient
      config={config}
      questions={questions}
      lessonId={lessonId}
      attemptNumber={(attemptCount ?? 0) + 1}
    />
  );
}
