import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentPageClient } from "./client";
import type { QuestionType } from "@/types/exercises";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch assessment
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Avaliacao nao encontrada</h2>
          <p className="text-muted-foreground">
            Esta avaliacao nao existe ou foi removida.
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
    .eq("assessment_id", id)
    .order("order", { ascending: true });

  const questions = (assessmentQuestions ?? []).map((aq: Record<string, unknown>) => {
    const q = aq.questions as Record<string, unknown> | null;
    return {
      id: (q?.id as string) ?? (aq.question_id as string),
      type: ((q?.type as string) ?? "multiple_choice") as QuestionType,
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
    .eq("assessment_id", id)
    .eq("student_id", user.id);

  const currentAttempt = (attemptCount ?? 0) + 1;
  const maxAttempts = assessment.max_attempts as number;
  const canAttempt = maxAttempts === 0 || currentAttempt <= maxAttempts;

  const config = {
    id: assessment.id as string,
    title: assessment.title as string,
    type: assessment.type as
      | "lesson_quiz"
      | "unit_quiz"
      | "unit_test"
      | "course_challenge",
    timeLimitMinutes: (assessment.time_limit_minutes as number | null) ?? null,
    passingScore: (assessment.passing_score as number) ?? 70,
    maxAttempts: maxAttempts,
    shuffleQuestions: (assessment.shuffle_questions as boolean) ?? true,
  };

  // Get best previous score
  const { data: bestAttempt } = await supabase
    .from("assessment_attempts")
    .select("score")
    .eq("assessment_id", id)
    .eq("student_id", user.id)
    .not("completed_at", "is", null)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AssessmentPageClient
      config={config}
      questions={questions}
      attemptNumber={currentAttempt}
      canAttempt={canAttempt}
      bestScore={bestAttempt ? parseFloat(bestAttempt.score as string) : null}
    />
  );
}
