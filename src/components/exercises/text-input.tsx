"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface TextInputProps {
  question: Question;
  onAnswer: (answer: string) => void;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
}

export function TextInput({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect,
}: TextInputProps) {
  const [value, setValue] = useState<string>(selectedAnswer ?? "");

  const correctAnswer = question.correctAnswer as string | string[];
  const acceptedAnswers = Array.isArray(correctAnswer)
    ? correctAnswer
    : [correctAnswer];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (answered) return;
    const text = e.target.value;
    setValue(text);
    onAnswer(text);
  }

  return (
    <div>
      <div
        className="mb-8 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      <div className="mx-auto max-w-md space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={value}
            onChange={handleChange}
            disabled={answered}
            placeholder="Digite sua resposta..."
            className={cn(
              "h-14 text-center text-lg transition-all duration-300",
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
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              Respostas aceitas:{" "}
              <span className="font-bold text-foreground">
                {acceptedAnswers.join(", ")}
              </span>
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
