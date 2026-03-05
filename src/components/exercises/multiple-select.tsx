"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface MultipleSelectProps {
  question: Question;
  onAnswer: (answer: string[]) => void;
  answered: boolean;
  selectedAnswer: string[] | null;
  isCorrect: boolean | null;
}

const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function MultipleSelect({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect: _isCorrect,
}: MultipleSelectProps) {
  const [selected, setSelected] = useState<string[]>(selectedAnswer ?? []);

  const options = question.options ?? [];
  const correctAnswers = (question.correctAnswer as string[]) ?? [];

  function handleToggle(option: string) {
    if (answered) return;
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    setSelected(next);
    onAnswer(next);
  }

  const correctCount = answered
    ? selected.filter((s) => correctAnswers.includes(s)).length
    : 0;

  function getOptionClasses(option: string) {
    if (!answered) {
      return cn(
        "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
        selected.includes(option)
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      );
    }

    const isInCorrect = correctAnswers.includes(option);
    const wasSelected = selected.includes(option);

    if (isInCorrect && wasSelected) {
      return "flex items-center gap-4 rounded-xl border-2 p-4 border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md";
    }
    if (isInCorrect && !wasSelected) {
      return "flex items-center gap-4 rounded-xl border-2 p-4 border-green-500/50 bg-green-50/50 dark:bg-green-950/20 border-dashed";
    }
    if (!isInCorrect && wasSelected) {
      return "flex items-center gap-4 rounded-xl border-2 p-4 border-red-500 bg-red-50 dark:bg-red-950/30";
    }
    return "flex items-center gap-4 rounded-xl border-2 p-4 border-border opacity-50";
  }

  return (
    <div className="space-y-3">
      <div
        className="mb-2 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      <p className="mb-4 text-sm text-muted-foreground">
        Selecione todas as alternativas corretas
      </p>
      {options.map((option, index) => (
        <motion.button
          key={option}
          type="button"
          onClick={() => handleToggle(option)}
          disabled={answered}
          className={getOptionClasses(option)}
          whileHover={!answered ? { scale: 1.01 } : undefined}
          whileTap={!answered ? { scale: 0.99 } : undefined}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Checkbox
            checked={selected.includes(option)}
            disabled={answered}
            className="pointer-events-none"
          />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
            {LABELS[index]}
          </span>
          <span
            className="flex-1 text-left text-base"
            dangerouslySetInnerHTML={{ __html: option }}
          />
        </motion.button>
      ))}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2"
        >
          <Badge
            variant={
              correctCount === correctAnswers.length
                ? "default"
                : "destructive"
            }
          >
            {correctCount} de {correctAnswers.length} corretas
          </Badge>
          {selected.filter((s) => !correctAnswers.includes(s)).length > 0 && (
            <Badge variant="outline">
              {selected.filter((s) => !correctAnswers.includes(s)).length}{" "}
              incorreta(s)
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}
