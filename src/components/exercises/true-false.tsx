"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface TrueFalseProps {
  question: Question;
  onAnswer: (answer: boolean) => void;
  answered: boolean;
  selectedAnswer: boolean | null;
  isCorrect: boolean | null;
}

export function TrueFalse({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect: _isCorrect,
}: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(selectedAnswer);

  const correctAnswer = question.correctAnswer as boolean;

  function handleSelect(value: boolean) {
    if (answered) return;
    setSelected(value);
    onAnswer(value);
  }

  function getButtonClasses(value: boolean) {
    const base =
      "flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl border-3 p-8 font-bold text-xl transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

    if (!answered) {
      if (selected === value) {
        return cn(
          base,
          value
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 shadow-lg"
            : "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 shadow-lg"
        );
      }
      return cn(
        base,
        "border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground"
      );
    }

    // After answering
    if (value === correctAnswer) {
      return cn(
        base,
        "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 shadow-lg"
      );
    }

    if (value === selected && value !== correctAnswer) {
      return cn(
        base,
        "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
      );
    }

    return cn(base, "border-border opacity-40 text-muted-foreground");
  }

  return (
    <fieldset aria-label="Verdadeiro ou Falso">
      <legend
        className="mb-8 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      <div className="flex gap-4" role="radiogroup" aria-label="Escolha verdadeiro ou falso">
        <motion.button
          type="button"
          role="radio"
          aria-checked={selected === true}
          onClick={() => handleSelect(true)}
          disabled={answered}
          className={getButtonClasses(true)}
          whileHover={!answered ? { scale: 1.03 } : undefined}
          whileTap={!answered ? { scale: 0.97 } : undefined}
        >
          <span className="text-4xl">{answered && true === correctAnswer ? "✓" : "V"}</span>
          <span>Verdadeiro</span>
        </motion.button>
        <motion.button
          type="button"
          role="radio"
          aria-checked={selected === false}
          onClick={() => handleSelect(false)}
          disabled={answered}
          className={getButtonClasses(false)}
          whileHover={!answered ? { scale: 1.03 } : undefined}
          whileTap={!answered ? { scale: 0.97 } : undefined}
        >
          <span className="text-4xl">{answered && false === correctAnswer ? "✓" : "F"}</span>
          <span>Falso</span>
        </motion.button>
      </div>
    </fieldset>
  );
}
