import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateAttemptSchema = z.object({
  attemptId: z.string().uuid(),
  score: z.number().min(0).max(100).optional(),
  totalQuestions: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

// POST: Start a new attempt
export async function POST(
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

  // Check for an existing incomplete attempt
  const { data: existingAttempt } = await supabase
    .from("assessment_attempts")
    .select("*")
    .eq("assessment_id", id)
    .eq("student_id", user.id)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAttempt) {
    return NextResponse.json({
      attempt: {
        id: existingAttempt.id,
        startedAt: existingAttempt.started_at,
        resumed: true,
      },
    });
  }

  // Create new attempt
  const { data: attempt, error } = await supabase
    .from("assessment_attempts")
    .insert({
      student_id: user.id,
      assessment_id: id,
      score: "0",
      total_questions: 0,
      correct_answers: 0,
      time_spent_seconds: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao iniciar tentativa." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      startedAt: attempt.started_at,
      resumed: false,
    },
  });
}

// PUT: Update attempt (save progress or finalize)
export async function PUT(
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
  const parsed = updateAttemptSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { attemptId, score, totalQuestions, correctAnswers, timeSpentSeconds, completed } =
    parsed.data;

  // Verify attempt belongs to user
  const { data: attempt } = await supabase
    .from("assessment_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("assessment_id", id)
    .eq("student_id", user.id)
    .single();

  if (!attempt) {
    return NextResponse.json(
      { error: "Tentativa nao encontrada." },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {};

  if (score !== undefined) updateData.score = score.toFixed(2);
  if (totalQuestions !== undefined) updateData.total_questions = totalQuestions;
  if (correctAnswers !== undefined) updateData.correct_answers = correctAnswers;
  if (timeSpentSeconds !== undefined)
    updateData.time_spent_seconds = timeSpentSeconds;
  if (completed) updateData.completed_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("assessment_attempts")
    .update(updateData)
    .eq("id", attemptId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar tentativa." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    attempt: {
      id: updated.id,
      score: updated.score,
      totalQuestions: updated.total_questions,
      correctAnswers: updated.correct_answers,
      timeSpentSeconds: updated.time_spent_seconds,
      completedAt: updated.completed_at,
    },
  });
}
