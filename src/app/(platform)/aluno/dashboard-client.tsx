"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Flame,
  GraduationCap,
  Star,
  Trophy,
  Zap,
  ArrowRight,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasteryBar } from "@/components/progress/mastery-bar";
import type { MasteryLevel } from "@/services/mastery";

interface StudentDashboardClientProps {
  profile: {
    fullName: string;
    avatarUrl: string | null;
  };
  stats: {
    totalXp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    completedLessons: number;
    totalTimeSeconds: number;
    totalMasteries: number;
  };
  coursesInProgress: Array<{
    courseId: string;
    courseName: string;
    courseSlug: string;
    completedLessons: number;
    totalLessons: number;
    masteryPercentage: number;
  }>;
  recentSkills: Array<{
    lessonName: string;
    masteryLevel: string;
    lastPracticedAt: string | null;
  }>;
  recommendedCourses: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
  nextLessons: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
  }>;
  recentBadges: Array<{
    name: string;
    slug: string;
    iconUrl: string | null;
    earnedAt: string;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

export function StudentDashboardClient({
  profile,
  stats,
  coursesInProgress,
  recentSkills,
  recommendedCourses,
  nextLessons,
  recentBadges,
}: StudentDashboardClientProps) {
  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Ola, {profile.fullName}!
        </h1>
        <p className="text-muted-foreground">
          Continue estudando e alcance seus objetivos.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatCard
          icon={<Zap className="h-5 w-5 text-purple-500" />}
          label="XP Total"
          value={stats.totalXp.toLocaleString("pt-BR")}
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-yellow-500" />}
          label="Nivel"
          value={stats.level.toString()}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Sequencia"
          value={`${stats.currentStreak} dias`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label="Tempo Total"
          value={formatTime(stats.totalTimeSeconds)}
        />
      </motion.div>

      {/* Additional stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-green-500" />}
          label="Aulas Concluidas"
          value={stats.completedLessons.toString()}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-emerald-500" />}
          label="Habilidades Dominadas"
          value={stats.totalMasteries.toString()}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          label="Maior Sequencia"
          value={`${stats.longestStreak} dias`}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Courses in progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Cursos em Andamento
              </CardTitle>
              <CardDescription>
                Seu progresso nos cursos ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesInProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Voce ainda nao comecou nenhum curso.{" "}
                  <Link href="/explorar" className="text-primary underline">
                    Explorar cursos
                  </Link>
                </p>
              ) : (
                <div className="space-y-4">
                  {coursesInProgress.map((course) => {
                    const pct =
                      course.totalLessons > 0
                        ? Math.round(
                            (course.completedLessons / course.totalLessons) *
                              100,
                          )
                        : 0;

                    return (
                      <div key={course.courseId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{course.courseName}</span>
                          <span className="text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {pct}% concluido
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent skills */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Habilidades Recentes
              </CardTitle>
              <CardDescription>
                Ultimas habilidades praticadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma habilidade praticada ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentSkills.map((skill, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-medium truncate">
                        {skill.lessonName}
                      </p>
                      <MasteryBar
                        level={skill.masteryLevel as MasteryLevel}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Continue studying / Next lessons */}
      {nextLessons.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Continuar Estudando
              </CardTitle>
              <CardDescription>
                Retome de onde parou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {nextLessons.map((lesson) => (
                  <Button
                    key={lesson.id}
                    variant="outline"
                    className="h-auto justify-start gap-3 p-3 text-left"
                    asChild
                  >
                    <Link href={`/aluno/aula/${lesson.slug}`}>
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {lesson.name}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {lesson.type === "video"
                            ? "Video"
                            : lesson.type === "article"
                              ? "Artigo"
                              : lesson.type === "exercise"
                                ? "Exercicio"
                                : "Quiz"}
                        </p>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recommended courses */}
        {recommendedCourses.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Cursos Recomendados</CardTitle>
                <CardDescription>
                  Novos cursos para voce comecar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {course.name}
                        </p>
                        {course.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/explorar/${course.slug}`}>
                          Comecar
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent badges */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Conquistas Recentes
              </CardTitle>
              <CardDescription>
                <Link href="/aluno/badges" className="text-primary underline">
                  Ver todas
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentBadges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma conquista ainda. Continue estudando!
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {recentBadges.map((badge, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border p-2"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {badge.name}
                        </p>
                        <Badge variant="secondary" className="text-[10px]">
                          Conquistado
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="py-3">
      <CardContent className="flex items-center gap-3 px-4 py-0">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
