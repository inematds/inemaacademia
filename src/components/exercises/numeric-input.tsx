"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface NumericInputProps {
  question: Question;
  onAnswer: (answer: number) => void;
  answered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}

export function NumericInput({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect,
}: NumericInputProps) {
  const [value, setValue] = useState<string>(
    selectedAnswer !== null ? String(selectedAnswer) : ""
  );

  const correctAnswer = question.correctAnswer as {
    value: number;
    tolerance: number;
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (answered) return;
    const raw = e.target.value;
    setValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onAnswer(num);
    }
  }

  return (
    <div>
      <div
        className="mb-8 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      <div className="mx-auto max-w-sm space-y-4">
        <div className="relative">
          <Input
            type="number"
            step="any"
            value={value}
            onChange={handleChange}
            disabled={answered}
            placeholder="Digite sua resposta..."
            aria-label="Sua resposta numerica"
            className={cn(
              "h-14 text-center text-2xl font-mono transition-all duration-300",
              answered && isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/30"
                : answered && !isCorrect
                  ? "border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/30"
                  : ""
            )}
          />
          {answered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {isCorrect ? (
                <span className="text-2xl text-green-500">✓</span>
              ) : (
                <span className="text-2xl text-red-500">✗</span>
              )}
            </motion.div>
          )}
        </div>
        {answered && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              Resposta esperada:{" "}
              <span className="font-bold text-foreground">
                {correctAnswer.value}
              </span>
              {correctAnswer.tolerance > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  (tolerancia: +/- {correctAnswer.tolerance})
                </span>
              )}
            </p>
          </motion.div>
        )}
        {answered && isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Badge variant="default">Resposta correta!</Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}
