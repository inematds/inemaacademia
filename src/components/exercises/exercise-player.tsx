"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { triggerConfetti } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Question, QuestionType } from "@/types/exercises";
import { MultipleChoice } from "./multiple-choice";
import { MultipleSelect } from "./multiple-select";
import { TrueFalse } from "./true-false";
import { NumericInput } from "./numeric-input";
import { TextInput } from "./text-input";
import { FillBlank } from "./fill-blank";
import { Ordering } from "./ordering";
import { Matching } from "./matching";

export interface ExerciseResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  timeSeconds: number;
  answers: {
    questionId: string;
    correct: boolean;
    userAnswer: unknown;
  }[];
}

interface ExercisePlayerProps {
  questions: Question[];
  onComplete: (results: ExerciseResult) => void;
}

type AnswerState = {
  value: unknown;
  answered: boolean;
  isCorrect: boolean | null;
};

function checkAnswer(question: Question, userAnswer: unknown): boolean {
  const { type, correctAnswer } = question;

  if (correctAnswer === undefined || correctAnswer === null) return false;

  switch (type) {
    case "multiple_choice":
      return userAnswer === correctAnswer;

    case "multiple_select": {
      const correct = (correctAnswer as string[]).sort();
      const user = (userAnswer as string[]).sort();
      return (
        correct.length === user.length &&
        correct.every((v, i) => v === user[i])
      );
    }

    case "true_false":
      return userAnswer === correctAnswer;

    case "numeric_input": {
      const { value, tolerance } = correctAnswer as {
        value: number;
        tolerance: number;
      };
      const num = userAnswer as number;
      return Math.abs(num - value) <= tolerance;
    }

    case "text_input": {
      const accepted = Array.isArray(correctAnswer)
        ? (correctAnswer as string[])
        : [correctAnswer as string];
      const userStr = (userAnswer as string).trim().toLowerCase();
      return accepted.some((a) => a.trim().toLowerCase() === userStr);
    }

    case "fill_blank": {
      const correctBlanks = correctAnswer as string[];
      const userBlanks = userAnswer as string[];
      return correctBlanks.every(
        (c, i) =>
          c.trim().toLowerCase() === (userBlanks[i] ?? "").trim().toLowerCase()
      );
    }

    case "ordering": {
      const correctOrder = correctAnswer as string[];
      const userOrder = userAnswer as string[];
      return correctOrder.every((v, i) => v === userOrder[i]);
    }

    case "matching": {
      const correctMap = correctAnswer as Record<string, string>;
      const userMap = userAnswer as Record<string, string>;
      return Object.entries(correctMap).every(
        ([k, v]) => userMap[k] === v
      );
    }

    default:
      return false;
  }
}

const QUESTION_COMPONENT_MAP: Record<
  QuestionType,
  React.ComponentType<{
    question: Question;
    onAnswer: (answer: never) => void;
    answered: boolean;
    selectedAnswer: never;
    isCorrect: boolean | null;
  }>
> = {
  multiple_choice: MultipleChoice as never,
  multiple_select: MultipleSelect as never,
  true_false: TrueFalse as never,
  numeric_input: NumericInput as never,
  text_input: TextInput as never,
  fill_blank: FillBlank as never,
  ordering: Ordering as never,
  matching: Matching as never,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export function ExercisePlayer({ questions, onComplete }: ExercisePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>(
    {}
  );
  const startTime = useRef(Date.now());

  const question = questions[currentIndex];
  const answerState = answers[question?.id];
  const totalQuestions = questions.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleAnswer = useCallback(
    (value: unknown) => {
      if (answers[question.id]?.answered) return;
      setAnswers((prev) => ({
        ...prev,
        [question.id]: {
          value,
          answered: false,
          isCorrect: null,
        },
      }));
    },
    [question?.id, answers]
  );

  function handleCheck() {
    if (!answerState || answerState.value === undefined || answerState.value === null) return;
    const correct = checkAnswer(question, answerState.value);
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        ...prev[question.id],
        answered: true,
        isCorrect: correct,
      },
    }));
    if (correct) {
      triggerConfetti();
    }
  }

  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else {
      finishExercise();
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }

  function handleRevealHint() {
    const qId = question.id;
    const current = hintsRevealed[qId] ?? 0;
    const maxHints = question.hints?.length ?? 0;
    if (current < maxHints) {
      setHintsRevealed((prev) => ({ ...prev, [qId]: current + 1 }));
    }
  }

  function finishExercise() {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const answerResults = questions.map((q) => {
      const ans = answers[q.id];
      return {
        questionId: q.id,
        correct: ans?.isCorrect ?? false,
        userAnswer: ans?.value ?? null,
      };
    });
    const correctCount = answerResults.filter((a) => a.correct).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    const result: ExerciseResult = {
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      score,
      timeSeconds: elapsed,
      answers: answerResults,
    };

    if (score >= 80) {
      triggerConfetti();
      setTimeout(() => triggerConfetti(), 500);
    }

    setShowSummary(true);
    onComplete(result);
  }

  // Summary screen
  if (showSummary) {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const correctCount = questions.filter(
      (q) => answers[q.id]?.isCorrect
    ).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="mx-auto max-w-lg overflow-hidden">
          <div
            className={cn(
              "px-6 py-8 text-center text-white",
              score >= 80
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : score >= 50
                  ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                  : "bg-gradient-to-br from-red-500 to-rose-600"
            )}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-7xl font-black mb-2"
            >
              {score}%
            </motion.div>
            <p className="text-lg font-medium opacity-90">
              {score >= 80
                ? "Excelente trabalho!"
                : score >= 50
                  ? "Bom progresso!"
                  : "Continue praticando!"}
            </p>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}
                </div>
                <div className="text-xs text-muted-foreground">Corretas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totalQuestions - correctCount}
                </div>
                <div className="text-xs text-muted-foreground">Incorretas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {minutes > 0
                    ? `${minutes}m ${seconds.toString().padStart(2, "0")}s`
                    : `${seconds}s`}
                </div>
                <div className="text-xs text-muted-foreground">Tempo</div>
              </div>
            </div>
            <Progress value={score} className="h-3 mb-4" />
            <div className="flex gap-2 flex-wrap justify-center">
              {questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <Badge
                    variant={
                      answers[q.id]?.isCorrect ? "default" : "destructive"
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full p-0"
                  >
                    {i + 1}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!question) return null;

  const QuestionComponent = QUESTION_COMPONENT_MAP[question.type];
  const hasAnswer =
    answerState?.value !== undefined && answerState?.value !== null;
  const isAnswered = answerState?.answered ?? false;
  const hintCount = question.hints?.length ?? 0;
  const revealedHints = hintsRevealed[question.id] ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Questao{" "}
            <span className="font-bold text-foreground">
              {currentIndex + 1}
            </span>{" "}
            de{" "}
            <span className="font-bold text-foreground">{totalQuestions}</span>
          </span>
          {question.points && (
            <Badge variant="outline">{question.points} pontos</Badge>
          )}
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/10">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card
        className={cn(
          "overflow-hidden transition-shadow duration-500",
          isAnswered && answerState?.isCorrect && "shadow-[0_0_30px_rgba(34,197,94,0.2)]",
          isAnswered && !answerState?.isCorrect && "shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        )}
      >
        <CardContent className="p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Shake wrapper for incorrect */}
              <motion.div
                animate={
                  isAnswered && !answerState?.isCorrect
                    ? {
                        x: [0, -8, 8, -6, 6, -3, 3, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <QuestionComponent
                  question={question}
                  onAnswer={handleAnswer as (answer: never) => void}
                  answered={isAnswered}
                  selectedAnswer={answerState?.value as never}
                  isCorrect={answerState?.isCorrect ?? null}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Hints */}
          {hintCount > 0 && !isAnswered && (
            <div className="mt-6 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevealHint}
                disabled={revealedHints >= hintCount}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                Dica ({revealedHints}/{hintCount})
              </Button>
              <AnimatePresence>
                {question.hints?.slice(0, revealedHints).map((hint, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300"
                  >
                    <span className="font-semibold">Dica {i + 1}:</span> {hint}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Explanation */}
          {isAnswered && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4"
            >
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                Explicacao
              </p>
              <p
                className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: question.explanation }}
              />
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Anterior
        </Button>

        <div className="flex gap-3">
          {!isAnswered && (
            <Button
              onClick={handleCheck}
              disabled={!hasAnswer}
              className="min-w-[160px]"
            >
              Verificar resposta
            </Button>
          )}
          {isAnswered && (
            <Button onClick={handleNext} className="min-w-[160px]">
              {currentIndex < totalQuestions - 1
                ? "Proxima"
                : "Ver resultado"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
