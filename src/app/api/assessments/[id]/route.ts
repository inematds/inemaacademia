import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nao autenticado." },
      { status: 401 }
    );
  }

  // Fetch assessment
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (assessmentError || !assessment) {
    return NextResponse.json(
      { error: "Avaliacao nao encontrada." },
      { status: 404 }
    );
  }

  // Fetch assessment questions with full question data
  const { data: assessmentQuestions, error: questionsError } = await supabase
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

  if (questionsError) {
    return NextResponse.json(
      { error: "Erro ao carregar questoes." },
      { status: 500 }
    );
  }

  // Fetch previous attempts count
  const { count: attemptCount } = await supabase
    .from("assessment_attempts")
    .select("*", { count: "exact", head: true })
    .eq("assessment_id", id)
    .eq("student_id", user.id);

  // Map questions to the expected format
  const questions = (assessmentQuestions ?? []).map((aq: Record<string, unknown>) => {
    const q = aq.questions as Record<string, unknown> | null;
    return {
      id: q?.id ?? aq.question_id,
      type: q?.type ?? "multiple_choice",
      questionText: q?.question_text ?? "",
      options: q?.options ?? null,
      correctAnswer: q?.correct_answer ?? null,
      explanation: q?.explanation ?? null,
      hints: q?.hints ?? null,
      points: q?.points ?? 10,
    };
  });

  return NextResponse.json({
    assessment: {
      id: assessment.id,
      title: assessment.title,
      type: assessment.type,
      relatedId: assessment.related_id,
      timeLimitMinutes: assessment.time_limit_minutes,
      passingScore: assessment.passing_score,
      maxAttempts: assessment.max_attempts,
      shuffleQuestions: assessment.shuffle_questions,
    },
    questions,
    attemptCount: attemptCount ?? 0,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nao autenticado." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const {
    totalQuestions,
    correctAnswers,
    score,
    timeSpentSeconds,
    answers,
  } = body as {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpentSeconds: number;
    answers: { questionId: string; correct: boolean; userAnswer: unknown }[];
  };

  // Fetch assessment to validate
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (!assessment) {
    return NextResponse.json(
      { error: "Avaliacao nao encontrada." },
      { status: 404 }
    );
  }

  // Check max attempts
  if (assessment.max_attempts > 0) {
    const { count } = await supabase
      .from("assessment_attempts")
      .select("*", { count: "exact", head: true })
      .eq("assessment_id", id)
      .eq("student_id", user.id);

    if ((count ?? 0) >= assessment.max_attempts) {
      return NextResponse.json(
        { error: "Numero maximo de tentativas atingido." },
        { status: 403 }
      );
    }
  }

  // Create attempt record
  const { data: attempt, error: attemptError } = await supabase
    .from("assessment_attempts")
    .insert({
      student_id: user.id,
      assessment_id: id,
      score: score.toFixed(2),
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_spent_seconds: timeSpentSeconds,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (attemptError) {
    return NextResponse.json(
      { error: "Erro ao salvar tentativa." },
      { status: 500 }
    );
  }

  // Save individual answers
  if (answers && answers.length > 0) {
    const answerRecords = answers.map((a) => ({
      student_id: user.id,
      question_id: a.questionId,
      answer: a.userAnswer ?? null,
      is_correct: a.correct,
      attempt_number: 1,
      time_spent_seconds: 0,
    }));

    await supabase.from("student_answers").insert(answerRecords);
  }

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      correctAnswers: attempt.correct_answers,
      timeSpentSeconds: attempt.time_spent_seconds,
      passed: score >= assessment.passing_score,
    },
  });
}
