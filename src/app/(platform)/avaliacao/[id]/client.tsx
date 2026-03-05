"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AssessmentPlayer,
  type AssessmentConfig,
  type AssessmentResult,
} from "@/components/assessments";
import type { Question } from "@/types/exercises";
import {
  Clock,
  FileText,
  Trophy,
  AlertTriangle,
  Play,
} from "lucide-react";

interface Props {
  config: AssessmentConfig;
  questions: Question[];
  attemptNumber: number;
  canAttempt: boolean;
  bestScore: number | null;
}

const TYPE_LABELS: Record<string, string> = {
  lesson_quiz: "Quiz da Licao",
  unit_quiz: "Quiz da Unidade",
  unit_test: "Prova da Unidade",
  course_challenge: "Desafio do Curso",
};

export function AssessmentPageClient({
  config,
  questions,
  attemptNumber,
  canAttempt,
  bestScore,
}: Props) {
  const router = useRouter();
  const [started, setStarted] = useState(false);

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
        toast.success("Avaliacao concluida com sucesso!");
      } else {
        toast.info("Voce nao atingiu a nota minima. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao salvar resultado.");
    }
  }

  function handleExit() {
    router.back();
  }

  if (started) {
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

  // Pre-assessment info screen
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-center text-primary-foreground">
            <Badge variant="secondary" className="mb-3">
              {TYPE_LABELS[config.type] ?? "Avaliacao"}
            </Badge>
            <h1 className="text-2xl font-bold">{config.title}</h1>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm font-medium">
                    {questions.length} questoes
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm font-medium">
                    {config.timeLimitMinutes
                      ? `${config.timeLimitMinutes} min`
                      : "Sem limite"}
                  </div>
                  <div className="text-xs text-muted-foreground">Tempo</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Trophy className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm font-medium">
                    {config.passingScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Nota minima
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm font-medium">
                    {config.maxAttempts > 0
                      ? `${attemptNumber}/${config.maxAttempts}`
                      : "Ilimitadas"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tentativas
                  </div>
                </div>
              </div>
            </div>

            {/* Best score */}
            {bestScore !== null && (
              <div className="text-center py-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  Sua melhor nota:{" "}
                </span>
                <span className="font-bold text-lg">
                  {Math.round(bestScore)}%
                </span>
              </div>
            )}

            {/* Rules */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                - Voce pode navegar livremente entre as questoes.
              </p>
              <p>
                - Marque questoes para revisao antes de finalizar.
              </p>
              {config.timeLimitMinutes && (
                <p>
                  - A avaliacao sera enviada automaticamente ao fim do
                  tempo.
                </p>
              )}
              {config.shuffleQuestions && (
                <p>- A ordem das questoes pode variar entre tentativas.</p>
              )}
            </div>

            {/* Start button */}
            {canAttempt ? (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setStarted(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar avaliacao
              </Button>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm text-red-600 font-medium">
                  Voce ja utilizou todas as tentativas disponiveis.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                  Voltar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
