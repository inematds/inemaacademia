"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface MultipleChoiceProps {
  question: Question;
  onAnswer: (answer: string) => void;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
}

const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function MultipleChoice({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect: _isCorrect,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(selectedAnswer);

  const options = question.options ?? [];
  const correctAnswer = question.correctAnswer as string;

  function handleSelect(option: string) {
    if (answered) return;
    setSelected(option);
    onAnswer(option);
  }

  function getOptionClasses(option: string) {
    if (!answered) {
      return cn(
        "flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 py-3 sm:p-4 cursor-pointer transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected === option
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      );
    }

    if (option === correctAnswer) {
      return "flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 py-3 sm:p-4 min-h-[48px] border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md";
    }

    if (option === selected && option !== correctAnswer) {
      return "flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 py-3 sm:p-4 min-h-[48px] border-red-500 bg-red-50 dark:bg-red-950/30";
    }

    return "flex items-center gap-3 sm:gap-4 rounded-xl border-2 px-3 py-3 sm:p-4 min-h-[48px] border-border opacity-50";
  }

  function getLabelClasses(option: string) {
    if (!answered) {
      return cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm transition-all duration-200",
        selected === option
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      );
    }

    if (option === correctAnswer) {
      return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm bg-green-500 text-white";
    }

    if (option === selected && option !== correctAnswer) {
      return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm bg-red-500 text-white";
    }

    return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm bg-muted text-muted-foreground";
  }

  return (
    <fieldset className="space-y-3" aria-label="Opcoes de resposta">
      <legend
        className="mb-6 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      {options.map((option, index) => (
        <motion.button
          key={option}
          type="button"
          role="radio"
          aria-checked={selected === option}
          aria-label={`Opcao ${LABELS[index]}`}
          onClick={() => handleSelect(option)}
          disabled={answered}
          className={getOptionClasses(option)}
          whileHover={!answered ? { scale: 1.01 } : undefined}
          whileTap={!answered ? { scale: 0.99 } : undefined}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <span className={getLabelClasses(option)}>{LABELS[index]}</span>
          <span
            className="flex-1 text-left text-base"
            dangerouslySetInnerHTML={{ __html: option }}
          />
          {answered && option === correctAnswer && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500 text-xl"
            >
              ✓
            </motion.span>
          )}
          {answered && option === selected && option !== correctAnswer && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500 text-xl"
            >
              ✗
            </motion.span>
          )}
        </motion.button>
      ))}
    </fieldset>
  );
}
