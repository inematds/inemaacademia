"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exercises";

interface MatchingProps {
  question: Question;
  onAnswer: (answer: Record<string, string>) => void;
  answered: boolean;
  selectedAnswer: Record<string, string> | null;
  isCorrect: boolean | null;
}

export function Matching({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  isCorrect: _isCorrect,
}: MatchingProps) {
  const correctAnswer = (question.correctAnswer as Record<string, string>) ?? {};
  const leftItems = Object.keys(correctAnswer);
  const rightItems = Object.values(correctAnswer);

  // Shuffle right items once on mount
  const [shuffledRight] = useState<string[]>(() => {
    const arr = [...rightItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const [matches, setMatches] = useState<Record<string, string>>(
    selectedAnswer ?? {}
  );
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [lines, setLines] = useState<
    { from: DOMRect; to: DOMRect; left: string; right: string }[]
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const newLines: typeof lines = [];

    for (const [left, right] of Object.entries(matches)) {
      const leftEl = leftRefs.current[left];
      const rightEl = rightRefs.current[right];
      if (leftEl && rightEl) {
        newLines.push({
          from: leftEl.getBoundingClientRect(),
          to: rightEl.getBoundingClientRect(),
          left,
          right,
        });
      }
    }
    setLines(newLines);
  }, [matches]);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [updateLines]);

  function handleLeftClick(item: string) {
    if (answered) return;
    if (activeLeft === item) {
      setActiveLeft(null);
      return;
    }
    // If already matched, remove the match
    if (matches[item]) {
      const next = { ...matches };
      delete next[item];
      setMatches(next);
      onAnswer(next);
    }
    setActiveLeft(item);
  }

  function handleRightClick(item: string) {
    if (answered || !activeLeft) return;

    // Remove any existing match to this right item
    const next = { ...matches };
    for (const key of Object.keys(next)) {
      if (next[key] === item) {
        delete next[key];
      }
    }

    next[activeLeft] = item;
    setMatches(next);
    setActiveLeft(null);
    onAnswer(next);
  }

  function isMatchCorrect(left: string) {
    if (!answered) return null;
    return matches[left] === correctAnswer[left];
  }

  function getLeftClasses(item: string) {
    const base =
      "w-full text-left rounded-xl border-2 p-3 text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    if (answered) {
      const correct = isMatchCorrect(item);
      if (correct) return cn(base, "border-green-500 bg-green-50 dark:bg-green-950/30");
      return cn(base, "border-red-500 bg-red-50 dark:bg-red-950/30");
    }
    if (activeLeft === item) {
      return cn(base, "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30");
    }
    if (matches[item]) {
      return cn(base, "border-primary/50 bg-primary/5");
    }
    return cn(base, "border-border hover:border-primary/50 cursor-pointer");
  }

  function getRightClasses(item: string) {
    const base =
      "w-full text-left rounded-xl border-2 p-3 text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
    const isMatched = Object.values(matches).includes(item);

    if (answered) {
      const matchedLeft = Object.entries(matches).find(
        ([, v]) => v === item
      )?.[0];
      if (matchedLeft && correctAnswer[matchedLeft] === item) {
        return cn(base, "border-green-500 bg-green-50 dark:bg-green-950/30");
      }
      if (matchedLeft) {
        return cn(base, "border-red-500 bg-red-50 dark:bg-red-950/30");
      }
      return cn(base, "border-border opacity-50");
    }

    if (isMatched) {
      return cn(base, "border-primary/50 bg-primary/5");
    }
    if (activeLeft) {
      return cn(
        base,
        "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
      );
    }
    return cn(base, "border-border");
  }

  const containerRect = containerRef.current?.getBoundingClientRect();

  return (
    <div>
      <div
        className="mb-4 text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      <p className="mb-6 text-sm text-muted-foreground">
        Clique em um item da esquerda e depois no item correspondente da direita
      </p>
      <div ref={containerRef} className="relative">
        {/* SVG overlay for connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: "visible" }}
        >
          {lines.map((line) => {
            if (!containerRect) return null;
            const x1 = line.from.right - containerRect.left;
            const y1 = line.from.top + line.from.height / 2 - containerRect.top;
            const x2 = line.to.left - containerRect.left;
            const y2 = line.to.top + line.to.height / 2 - containerRect.top;

            const matchCorrect = answered
              ? correctAnswer[line.left] === line.right
              : null;
            const strokeColor =
              matchCorrect === true
                ? "#22c55e"
                : matchCorrect === false
                  ? "#ef4444"
                  : "hsl(var(--primary))";

            return (
              <motion.line
                key={`${line.left}-${line.right}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>

        <div className="grid grid-cols-2 gap-3 sm:gap-8">
          {/* Left column */}
          <div className="space-y-3">
            {leftItems.map((item, i) => (
              <motion.button
                key={item}
                type="button"
                ref={(el) => {
                  leftRefs.current[item] = el;
                }}
                onClick={() => handleLeftClick(item)}
                disabled={answered}
                aria-label={`Item ${i + 1} da esquerda`}
                aria-pressed={activeLeft === item}
                className={getLeftClasses(item)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </span>
              </motion.button>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {shuffledRight.map((item, i) => (
              <motion.button
                key={item}
                type="button"
                ref={(el) => {
                  rightRefs.current[item] = el;
                }}
                onClick={() => handleRightClick(item)}
                disabled={answered || !activeLeft}
                aria-label={`Item ${i + 1} da direita`}
                className={getRightClasses(item)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2"
        >
          <Badge
            variant={_isCorrect ? "default" : "destructive"}
          >
            {Object.entries(matches).filter(
              ([k, v]) => correctAnswer[k] === v
            ).length}{" "}
            de {leftItems.length} corretas
          </Badge>
        </motion.div>
      )}
    </div>
  );
}
