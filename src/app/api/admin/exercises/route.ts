import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const questionSchema = z.object({
  type: z.enum([
    "multiple_choice",
    "multiple_select",
    "true_false",
    "numeric_input",
    "text_input",
    "fill_blank",
    "ordering",
    "matching",
  ]),
  questionText: z.string().min(1),
  options: z.array(z.string()).default([]),
  correctAnswer: z.unknown(),
  explanation: z.string().default(""),
  hints: z.array(z.string()).default([]),
  points: z.number().int().min(1).default(10),
});

const exerciseSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().default(""),
  lessonId: z.string().uuid().optional(),
  questions: z.array(questionSchema).min(1),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Acesso restrito a administradores" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = exerciseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, instructions, lessonId, questions } = parsed.data;

  const { data: exercise, error: exError } = await supabase
    .from("exercises")
    .insert({
      title,
      instructions,
      lesson_id: lessonId ?? null,
      order: 0,
    })
    .select("id")
    .single();

  if (exError || !exercise) {
    return NextResponse.json(
      { error: "Erro ao criar exercicio" },
      { status: 500 }
    );
  }

  const questionRows = questions.map((q, i) => ({
    exercise_id: exercise.id,
    type: q.type,
    question_text: q.questionText,
    options: q.options.length > 0 ? q.options : null,
    correct_answer: q.correctAnswer,
    explanation: q.explanation || null,
    hints: q.hints.length > 0 ? q.hints : null,
    points: q.points,
    order: i,
  }));

  const { error: qError } = await supabase
    .from("questions")
    .insert(questionRows);

  if (qError) {
    return NextResponse.json(
      { error: "Erro ao criar questoes" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { id: exercise.id, message: "Exercicio criado com sucesso" },
    { status: 201 }
  );
}
