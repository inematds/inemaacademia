"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface FillBlankProps {
  question: Question;
  onAnswer: (answer: string[]) => void;
  answered: boolean;
  selectedAnswer: string[] | null;
  isCorrect: boolean | null;
}

export function FillBlank({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect: _isCorrect,
}: FillBlankProps) {
  const correctAnswers = (question.correctAnswer as string[]) ?? [];

  const blankCount = useMemo(() => {
    const matches = question.questionText.match(/\[BLANK\]/g);
    return matches ? matches.length : 0;
  }, [question.questionText]);

  const [values, setValues] = useState<string[]>(
    selectedAnswer ?? new Array(blankCount).fill("")
  );

  function handleChange(index: number, val: string) {
    if (answered) return;
    const next = [...values];
    next[index] = val;
    setValues(next);
    onAnswer(next);
  }

  function isBlankCorrect(index: number) {
    if (!answered) return null;
    return (
      values[index]?.trim().toLowerCase() ===
      correctAnswers[index]?.trim().toLowerCase()
    );
  }

  // Split question text by [BLANK] and render inputs inline
  const parts = question.questionText.split("[BLANK]");

  let blankIndex = 0;

  return (
    <div>
      <div className="mb-8 text-lg font-medium leading-relaxed flex flex-wrap items-center gap-1">
        {parts.map((part, i) => {
          const currentBlank = blankIndex;
          const showInput = i < parts.length - 1;
          if (showInput) blankIndex++;
          return (
            <span key={i} className="inline-flex items-center gap-1 flex-wrap">
              <span dangerouslySetInnerHTML={{ __html: part }} />
              {showInput && (
                <input
                  type="text"
                  value={values[currentBlank] ?? ""}
                  onChange={(e) => handleChange(currentBlank, e.target.value)}
                  disabled={answered}
                  placeholder="..."
                  className={cn(
                    "inline-block w-32 rounded-lg border-2 border-dashed px-3 py-1 text-center text-base font-semibold outline-none transition-all duration-300",
                    "bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20",
                    answered && isBlankCorrect(currentBlank)
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                      : answered && !isBlankCorrect(currentBlank)
                        ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                        : "border-border"
                  )}
                />
              )}
            </span>
          );
        })}
      </div>
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {correctAnswers.map((answer, i) => {
            const correct = isBlankCorrect(i);
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Badge variant={correct ? "default" : "destructive"}>
                  Espaco {i + 1}
                </Badge>
                {!correct && (
                  <span className="text-muted-foreground">
                    Esperado:{" "}
                    <span className="font-bold text-foreground">{answer}</span>
                  </span>
                )}
                {correct && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Correto!
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
