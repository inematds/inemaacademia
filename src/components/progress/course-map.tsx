"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Play,
  CheckCircle2,
  Crown,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LessonStatus = "locked" | "not_started" | "in_progress" | "completed" | "mastered";

interface MapLesson {
  id: string;
  name: string;
  type: "video" | "article" | "exercise" | "quiz";
  status: LessonStatus;
  masteryLevel: string;
  order: number;
}

interface MapUnit {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  lessons: MapLesson[];
}

interface CourseMapProps {
  units: MapUnit[];
  onLessonClick?: (lessonId: string) => void;
  className?: string;
}

const statusConfig: Record<
  LessonStatus,
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; ringColor: string }
> = {
  locked: {
    icon: Lock,
    color: "text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    ringColor: "ring-gray-300 dark:ring-gray-600",
  },
  not_started: {
    icon: Play,
    color: "text-gray-500",
    bgColor: "bg-white dark:bg-gray-900",
    ringColor: "ring-gray-300 dark:ring-gray-600",
  },
  in_progress: {
    icon: Play,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    ringColor: "ring-blue-400",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    ringColor: "ring-green-400",
  },
  mastered: {
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    ringColor: "ring-yellow-400",
  },
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  article: FileText,
  exercise: BookOpen,
  quiz: HelpCircle,
};

function getLessonStatus(lesson: MapLesson): LessonStatus {
  if (lesson.masteryLevel === "mastered") return "mastered";
  if (lesson.status === "completed") return "completed";
  if (lesson.status === "in_progress") return "in_progress";
  if (lesson.status === "not_started") return "not_started";
  return "locked";
}

export function CourseMap({ units, onLessonClick, className }: CourseMapProps) {
  return (
    <div className={cn("w-full", className)}>
      {units.map((unit, unitIndex) => (
        <div key={unit.id} className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: unitIndex * 0.1 }}
            className="mb-4"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {unit.name}
            </h3>
            {unit.description && (
              <p className="text-sm text-muted-foreground">{unit.description}</p>
            )}
          </motion.div>

          <div className="relative flex flex-col items-center gap-2">
            {unit.lessons.map((lesson, lessonIndex) => {
              const status = getLessonStatus(lesson);
              const config = statusConfig[status];
              const Icon = config.icon;
              const TypeIcon = typeIcons[lesson.type] ?? BookOpen;
              const isClickable = status !== "locked";
              const isLast = lessonIndex === unit.lessons.length - 1;

              // Zigzag pattern: alternate left and right
              const isLeft = lessonIndex % 2 === 0;

              return (
                <div key={lesson.id} className="relative w-full">
                  {/* Connecting line */}
                  {!isLast && (
                    <svg
                      className="absolute left-1/2 top-14 z-0 h-12 w-20 -translate-x-1/2"
                      viewBox="0 0 80 48"
                      fill="none"
                    >
                      <path
                        d={
                          isLeft
                            ? "M 40 0 C 40 16, 60 32, 40 48"
                            : "M 40 0 C 40 16, 20 32, 40 48"
                        }
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={status === "locked" ? "4 4" : "none"}
                        className={
                          status === "locked" || status === "not_started"
                            ? "text-gray-300 dark:text-gray-600"
                            : "text-primary/40"
                        }
                      />
                    </svg>
                  )}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: unitIndex * 0.1 + lessonIndex * 0.08,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    className={cn(
                      "relative z-10 mx-auto flex w-full max-w-sm items-center gap-3 rounded-xl p-3 ring-2 transition-all",
                      config.bgColor,
                      config.ringColor,
                      isClickable
                        ? "cursor-pointer hover:shadow-md hover:ring-primary/50"
                        : "cursor-not-allowed opacity-60",
                      isLeft ? "md:mr-auto md:ml-8" : "md:ml-auto md:mr-8",
                    )}
                    onClick={() => isClickable && onLessonClick?.(lesson.id)}
                    whileHover={isClickable ? { scale: 1.02 } : undefined}
                    whileTap={isClickable ? { scale: 0.98 } : undefined}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-2",
                        config.bgColor,
                        config.ringColor,
                      )}
                    >
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {lesson.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">
                          {lesson.type === "video"
                            ? "Video"
                            : lesson.type === "article"
                              ? "Artigo"
                              : lesson.type === "exercise"
                                ? "Exercicio"
                                : "Quiz"}
                        </span>
                      </div>
                    </div>

                    {status === "mastered" && (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <Crown className="h-5 w-5 text-yellow-500" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
