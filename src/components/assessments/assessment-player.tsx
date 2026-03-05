"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { triggerConfetti } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Question, QuestionType } from "@/types/exercises";
import { MultipleChoice } from "@/components/exercises/multiple-choice";
import { MultipleSelect } from "@/components/exercises/multiple-select";
import { TrueFalse } from "@/components/exercises/true-false";
import { NumericInput } from "@/components/exercises/numeric-input";
import { TextInput } from "@/components/exercises/text-input";
import { FillBlank } from "@/components/exercises/fill-blank";
import { Ordering } from "@/components/exercises/ordering";
import { Matching } from "@/components/exercises/matching";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LayoutGrid,
  X,
  Eye,
} from "lucide-react";

// --- Types ---

export interface AssessmentConfig {
  id: string;
  title: string;
  type: "lesson_quiz" | "unit_quiz" | "unit_test" | "course_challenge";
  timeLimitMinutes: number | null;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
}

export interface AssessmentResult {
  assessmentId: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  timeSeconds: number;
  passed: boolean;
  answers: {
    questionId: string;
    correct: boolean;
    userAnswer: unknown;
  }[];
}

interface AssessmentPlayerProps {
  config: AssessmentConfig;
  questions: Question[];
  onComplete: (result: AssessmentResult) => void;
  onExit?: () => void;
  attemptNumber?: number;
}

type AnswerState = {
  value: unknown;
  submitted: boolean;
  isCorrect: boolean | null;
};

type QuestionStatus = "unanswered" | "answered" | "marked";

// --- Helpers ---

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
      return Math.abs((userAnswer as number) - value) <= tolerance;
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
          c.trim().toLowerCase() ===
          (userBlanks[i] ?? "").trim().toLowerCase()
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
      return Object.entries(correctMap).every(([k, v]) => userMap[k] === v);
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Component ---

export function AssessmentPlayer({
  config,
  questions: rawQuestions,
  onComplete,
  onExit,
  attemptNumber = 1,
}: AssessmentPlayerProps) {
  const [questions] = useState(() =>
    config.shuffleQuestions ? shuffleArray(rawQuestions) : rawQuestions
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set()
  );
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  const answerState = answers[question?.id];
  const hasTimeLimit = config.timeLimitMinutes !== null && config.timeLimitMinutes > 0;
  const timeLimitSeconds = hasTimeLimit ? config.timeLimitMinutes! * 60 : 0;
  const remainingSeconds = hasTimeLimit
    ? Math.max(0, timeLimitSeconds - elapsedSeconds)
    : 0;

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-submit on time up
  useEffect(() => {
    if (hasTimeLimit && remainingSeconds <= 0 && !showResults) {
      finishAssessment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, hasTimeLimit, showResults]);

  const handleAnswer = useCallback(
    (value: unknown) => {
      if (!question) return;
      setAnswers((prev) => ({
        ...prev,
        [question.id]: {
          value,
          submitted: false,
          isCorrect: null,
        },
      }));
    },
    [question]
  );

  function getQuestionStatus(qId: string): QuestionStatus {
    if (markedForReview.has(qId)) return "marked";
    const ans = answers[qId];
    if (ans && ans.value !== undefined && ans.value !== null) return "answered";
    return "unanswered";
  }

  function toggleMarkForReview() {
    if (!question) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  }

  function goToQuestion(index: number) {
    setCurrentIndex(index);
    setShowSidePanel(false);
  }

  function handleNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function finishAssessment() {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);

    const answerResults = questions.map((q) => {
      const ans = answers[q.id];
      const userAnswer = ans?.value ?? null;
      const correct =
        userAnswer !== null && userAnswer !== undefined
          ? checkAnswer(q, userAnswer)
          : false;
      return { questionId: q.id, correct, userAnswer };
    });

    const correctCount = answerResults.filter((a) => a.correct).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Also store isCorrect in answers for review
    const updatedAnswers: Record<string, AnswerState> = {};
    questions.forEach((q) => {
      const ans = answers[q.id];
      const userAnswer = ans?.value ?? null;
      const correct =
        userAnswer !== null && userAnswer !== undefined
          ? checkAnswer(q, userAnswer)
          : false;
      updatedAnswers[q.id] = {
        value: userAnswer,
        submitted: true,
        isCorrect: correct,
      };
    });
    setAnswers(updatedAnswers);

    const assessmentResult: AssessmentResult = {
      assessmentId: config.id,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      score,
      timeSeconds: elapsed,
      passed: score >= config.passingScore,
      answers: answerResults,
    };

    setResult(assessmentResult);
    setShowResults(true);

    if (score >= config.passingScore) {
      triggerConfetti();
      setTimeout(() => triggerConfetti(), 500);
    }

    onComplete(assessmentResult);
  }

  const answeredCount = questions.filter((q) => {
    const ans = answers[q.id];
    return ans && ans.value !== undefined && ans.value !== null;
  }).length;
  const markedCount = markedForReview.size;

  // --- Review Mode ---
  if (showReview && result) {
    const reviewQuestion = questions[reviewIndex];
    const reviewAnswerState = answers[reviewQuestion.id];
    const QuestionComponent = QUESTION_COMPONENT_MAP[reviewQuestion.type];

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Review Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Revisao detalhada</h2>
            <Badge variant="outline">
              {reviewIndex + 1} de {totalQuestions}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReview(false)}
          >
            <X className="h-4 w-4 mr-1" />
            Voltar ao resultado
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-2xl py-8 px-4 space-y-6">
            {/* Correct/Wrong indicator */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium",
                reviewAnswerState?.isCorrect
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
              )}
            >
              {reviewAnswerState?.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Resposta correta
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  Resposta incorreta
                </>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                <QuestionComponent
                  question={reviewQuestion}
                  onAnswer={() => {}}
                  answered={true}
                  selectedAnswer={reviewAnswerState?.value as never}
                  isCorrect={reviewAnswerState?.isCorrect ?? null}
                />
              </CardContent>
            </Card>

            {reviewQuestion.explanation && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Explicacao
                </p>
                <p
                  className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: reviewQuestion.explanation,
                  }}
                />
              </div>
            )}

            {/* Review navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setReviewIndex((i) => i - 1)}
                disabled={reviewIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setReviewIndex((i) => i + 1)}
                disabled={reviewIndex === totalQuestions - 1}
              >
                Proxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // --- Results Screen ---
  if (showResults && result) {
    const minutes = Math.floor(result.timeSeconds / 60);
    const seconds = result.timeSeconds % 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-lg py-8 px-4"
      >
        <Card className="overflow-hidden">
          <div
            className={cn(
              "px-6 py-8 text-center text-white",
              result.passed
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : result.score >= 50
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
              {result.score}%
            </motion.div>
            <p className="text-lg font-medium opacity-90">
              {result.passed
                ? "Aprovado! Excelente trabalho!"
                : result.score >= 50
                  ? "Quase la! Continue praticando."
                  : "Nao atingiu a nota minima. Tente novamente."}
            </p>
            <p className="text-sm opacity-70 mt-1">
              Nota minima: {config.passingScore}%
            </p>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.correctCount}
                </div>
                <div className="text-xs text-muted-foreground">Corretas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.incorrectCount}
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

            <Progress value={result.score} className="h-3" />

            {/* Question map */}
            <div className="flex gap-2 flex-wrap justify-center">
              {questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <Badge
                    variant={
                      answers[q.id]?.isCorrect ? "default" : "destructive"
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full p-0 cursor-pointer"
                    onClick={() => {
                      setReviewIndex(i);
                      setShowReview(true);
                    }}
                  >
                    {i + 1}
                  </Badge>
                </motion.div>
              ))}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Tentativa {attemptNumber}
              {config.maxAttempts > 0 && ` de ${config.maxAttempts}`}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setReviewIndex(0);
                  setShowReview(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Revisar respostas
              </Button>
              {onExit && (
                <Button onClick={onExit}>
                  Continuar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // --- Assessment Player ---
  if (!question) return null;

  const QuestionComponent = QUESTION_COMPONENT_MAP[question.type];
  const hasAnswer =
    answerState?.value !== undefined && answerState?.value !== null;
  const isMarked = markedForReview.has(question.id);
  const timerDanger = hasTimeLimit && remainingSeconds < 60;
  const timerWarning = hasTimeLimit && remainingSeconds < 300 && !timerDanger;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
            {config.title}
          </h2>
          <Badge variant="outline" className="hidden sm:flex">
            Tentativa {attemptNumber}
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Timer */}
          {hasTimeLimit && (
            <div
              className={cn(
                "flex items-center gap-1.5 font-mono text-sm font-medium px-3 py-1.5 rounded-lg",
                timerDanger
                  ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse"
                  : timerWarning
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    : "bg-muted text-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
              {formatTime(remainingSeconds)}
            </div>
          )}

          {!hasTimeLimit && (
            <div className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground px-3 py-1.5 rounded-lg bg-muted">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedSeconds)}
            </div>
          )}

          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{answeredCount}</span>
            /{totalQuestions}
          </div>

          {/* Side panel toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSidePanel(!showSidePanel)}
            className="relative"
          >
            <LayoutGrid className="h-4 w-4" />
            {markedCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-[10px] font-bold text-white flex items-center justify-center">
                {markedCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-2xl py-8 px-4 space-y-6">
            {/* Question header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Questao{" "}
                  <span className="font-bold text-foreground">
                    {currentIndex + 1}
                  </span>{" "}
                  de{" "}
                  <span className="font-bold text-foreground">
                    {totalQuestions}
                  </span>
                </span>
                {question.points && (
                  <Badge variant="outline">{question.points} pontos</Badge>
                )}
              </div>
              <Button
                variant={isMarked ? "default" : "ghost"}
                size="sm"
                onClick={toggleMarkForReview}
                className={cn(
                  isMarked
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "text-muted-foreground hover:text-yellow-600"
                )}
              >
                <Flag className="h-4 w-4 mr-1" />
                {isMarked ? "Marcada" : "Marcar"}
              </Button>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{
                  width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            {/* Question card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <QuestionComponent
                      question={question}
                      onAnswer={handleAnswer as (answer: never) => void}
                      answered={false}
                      selectedAnswer={answerState?.value as never}
                      isCorrect={null}
                    />
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex gap-3">
                {currentIndex < totalQuestions - 1 ? (
                  <Button onClick={handleNext} disabled={!hasAnswer}>
                    Proxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>Finalizar avaliacao</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Finalizar avaliacao?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {answeredCount < totalQuestions ? (
                            <span className="flex items-center gap-2 text-yellow-600">
                              <AlertTriangle className="h-4 w-4" />
                              Voce respondeu {answeredCount} de {totalQuestions}{" "}
                              questoes. Questoes nao respondidas serao
                              consideradas incorretas.
                            </span>
                          ) : (
                            `Todas as ${totalQuestions} questoes foram respondidas. Deseja enviar suas respostas?`
                          )}
                          {markedCount > 0 && (
                            <span className="flex items-center gap-2 mt-2 text-yellow-600">
                              <Flag className="h-4 w-4" />
                              {markedCount} questao(oes) marcada(s) para
                              revisao.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={finishAssessment}>
                          Finalizar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Side panel - Question map */}
        <AnimatePresence>
          {showSidePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l bg-muted/30 overflow-hidden shrink-0"
            >
              <div className="w-[280px] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Mapa de questoes</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidePanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    Respondida
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    Pendente
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    Marcada
                  </div>
                </div>

                {/* Question grid */}
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => {
                    const status = getQuestionStatus(q.id);
                    const isCurrent = i === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(i)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                          isCurrent && "ring-2 ring-primary ring-offset-2",
                          status === "answered" &&
                            "bg-primary text-primary-foreground",
                          status === "unanswered" &&
                            "bg-muted text-muted-foreground hover:bg-muted/80",
                          status === "marked" &&
                            "bg-yellow-500 text-white"
                        )}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Respondidas</span>
                    <span className="font-medium">
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marcadas</span>
                    <span className="font-medium text-yellow-600">
                      {markedCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pendentes</span>
                    <span className="font-medium">
                      {totalQuestions - answeredCount}
                    </span>
                  </div>
                </div>

                {/* Finish button in side panel */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" size="sm">
                      Finalizar avaliacao
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Finalizar avaliacao?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {answeredCount < totalQuestions
                          ? `Voce respondeu ${answeredCount} de ${totalQuestions} questoes. Questoes nao respondidas serao consideradas incorretas.`
                          : `Todas as ${totalQuestions} questoes foram respondidas. Deseja enviar suas respostas?`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction onClick={finishAssessment}>
                        Finalizar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
