"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AssessmentPlayer,
  type AssessmentConfig,
  type AssessmentResult,
} from "@/components/assessments";
import type { Question } from "@/types/exercises";

interface Props {
  config: AssessmentConfig;
  questions: Question[];
  lessonId: string;
  attemptNumber: number;
}

export function LessonQuizClient({
  config,
  questions,
  lessonId,
  attemptNumber,
}: Props) {
  const router = useRouter();

  async function handleComplete(result: AssessmentResult) {
    try {
      await fetch(`/api/assessments/${config.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctCount,
          score: result.score,
          timeSpentSeconds: result.timeSeconds,
          answers: result.answers,
        }),
      });

      if (result.passed) {
        toast.success("Quiz concluido com sucesso!");
      } else {
        toast.info("Voce pode tentar novamente.");
      }
    } catch {
      toast.error("Erro ao salvar resultado.");
    }
  }

  function handleExit() {
    router.push(`/licao/${lessonId}`);
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Sem questoes</h2>
          <p className="text-muted-foreground">
            Este quiz ainda nao possui questoes cadastradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AssessmentPlayer
      config={config}
      questions={questions}
      onComplete={handleComplete}
      onExit={handleExit}
      attemptNumber={attemptNumber}
    />
  );
}
