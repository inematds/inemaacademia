import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMasteryFromCorrectStreak } from "@/services/mastery";
import { calculateXpGain, calculateLevel } from "@/services/xp";
import { updateStreak } from "@/services/streak";
import { checkBadgeConditions, type StudentStats } from "@/services/badges";
import { progressLimiter } from "@/lib/rate-limit";

const recordAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.unknown(),
  isCorrect: z.boolean(),
  timeSpent: z.number().int().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Nao autorizado." },
        { status: 401 },
      );
    }

    const rateResult = progressLimiter.check(user.id);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Muitas requisicoes. Tente novamente em breve." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateResult.retryAfterMs ?? 0) / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const parsed = recordAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { questionId, answer, isCorrect, timeSpent } = parsed.data;
    const studentId = user.id;

    // Get question and its exercise/lesson
    const { data: question } = await supabase
      .from("questions")
      .select("id, exercise_id, points")
      .eq("id", questionId)
      .single();

    if (!question) {
      return NextResponse.json(
        { error: "Questao nao encontrada." },
        { status: 404 },
      );
    }

    const { data: exercise } = await supabase
      .from("exercises")
      .select("id, lesson_id")
      .eq("id", question.exercise_id)
      .single();

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercicio nao encontrado." },
        { status: 404 },
      );
    }

    // Get current attempt count
    const { count: attemptCount } = await supabase
      .from("student_answers")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("question_id", questionId);

    const attemptNumber = (attemptCount ?? 0) + 1;

    // Record the answer
    await supabase.from("student_answers").insert({
      student_id: studentId,
      question_id: questionId,
      answer,
      is_correct: isCorrect,
      attempt_number: attemptNumber,
      time_spent_seconds: timeSpent,
    });

    // Calculate XP
    let xpGained = 0;
    if (isCorrect) {
      xpGained = calculateXpGain("correct_answer");
    }

    // Update mastery based on recent correct streak for this lesson
    const { data: recentAnswers } = await supabase
      .from("student_answers")
      .select("is_correct, questions!inner(exercise_id, exercises!inner(lesson_id))")
      .eq("student_id", studentId)
      .eq("questions.exercises.lesson_id", exercise.lesson_id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Count consecutive correct answers from most recent
    let correctStreak = 0;
    if (recentAnswers) {
      for (const a of recentAnswers) {
        if (a.is_correct) {
          correctStreak++;
        } else {
          break;
        }
      }
    }

    const mastery = getMasteryFromCorrectStreak(correctStreak);
    const previousMasteryLevel = await getCurrentMasteryLevel(
      supabase,
      studentId,
      exercise.lesson_id,
    );

    // Upsert skill mastery
    const { data: existingMastery } = await supabase
      .from("skill_mastery")
      .select("id, mastery_level")
      .eq("student_id", studentId)
      .eq("lesson_id", exercise.lesson_id)
      .single();

    if (existingMastery) {
      await supabase
        .from("skill_mastery")
        .update({
          mastery_level: mastery.level,
          mastery_points: mastery.points,
          attempts: attemptNumber,
          last_practiced_at: new Date().toISOString(),
        })
        .eq("id", existingMastery.id);
    } else {
      await supabase.from("skill_mastery").insert({
        student_id: studentId,
        lesson_id: exercise.lesson_id,
        mastery_level: mastery.level,
        mastery_points: mastery.points,
        attempts: attemptNumber,
        last_practiced_at: new Date().toISOString(),
      });
    }

    // Award mastery XP if level increased to mastered
    if (mastery.level === "mastered" && previousMasteryLevel !== "mastered") {
      xpGained += calculateXpGain("reach_mastery");
    }

    // Get or create student stats
    let { data: stats } = await supabase
      .from("student_stats")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (!stats) {
      const { data: newStats } = await supabase
        .from("student_stats")
        .insert({
          student_id: studentId,
          total_xp: 0,
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null,
          level: 1,
        })
        .select()
        .single();
      stats = newStats;
    }

    if (!stats) {
      return NextResponse.json(
        { error: "Erro ao criar estatisticas." },
        { status: 500 },
      );
    }

    // Update streak
    const streakResult = updateStreak(
      stats.last_active_date,
      stats.current_streak,
      stats.longest_streak,
    );
    xpGained += streakResult.xpBonus;

    const newTotalXp = stats.total_xp + xpGained;
    const oldLevel = stats.level;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > oldLevel;

    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("student_stats")
      .update({
        total_xp: newTotalXp,
        current_streak: streakResult.currentStreak,
        longest_streak: streakResult.longestStreak,
        last_active_date: today,
        level: newLevel,
      })
      .eq("student_id", studentId);

    // Update lesson progress to in_progress if not yet started
    const { data: lessonProg } = await supabase
      .from("lesson_progress")
      .select("id, status")
      .eq("student_id", studentId)
      .eq("lesson_id", exercise.lesson_id)
      .single();

    if (!lessonProg) {
      await supabase.from("lesson_progress").insert({
        student_id: studentId,
        lesson_id: exercise.lesson_id,
        status: "in_progress",
        time_spent_seconds: timeSpent,
      });
    } else if (lessonProg.status === "not_started") {
      await supabase
        .from("lesson_progress")
        .update({ status: "in_progress" })
        .eq("id", lessonProg.id);
    }

    // Check badges
    const { count: totalMasteries } = await supabase
      .from("skill_mastery")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("mastery_level", "mastered");

    const { count: totalExercisesCompleted } = await supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "completed");

    const { count: totalCoursesCompleted } = await supabase
      .from("course_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .gte("mastery_percentage", "100");

    const badgeStats: StudentStats = {
      totalXp: newTotalXp,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      totalMasteries: totalMasteries ?? 0,
      totalLogins: 1,
      totalExercisesCompleted: totalExercisesCompleted ?? 0,
      totalCoursesCompleted: totalCoursesCompleted ?? 0,
      hasPerfectQuiz: false,
    };

    const earnedSlugs = checkBadgeConditions(badgeStats);

    const { data: alreadyEarned } = await supabase
      .from("student_badges")
      .select("badges(slug)")
      .eq("student_id", studentId);

    const alreadyEarnedSlugs = new Set(
      (alreadyEarned ?? []).map((sb) => {
        const b = sb.badges as unknown as { slug: string } | null;
        return b?.slug;
      }),
    );

    const newBadgeSlugs = earnedSlugs.filter(
      (slug) => !alreadyEarnedSlugs.has(slug),
    );

    const newBadges: Array<{ slug: string; name: string }> = [];

    for (const slug of newBadgeSlugs) {
      const { data: badge } = await supabase
        .from("badges")
        .select("id, name, xp_reward")
        .eq("slug", slug)
        .single();

      if (badge) {
        await supabase.from("student_badges").insert({
          student_id: studentId,
          badge_id: badge.id,
        });
        newBadges.push({ slug, name: badge.name });
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      xpGained,
      totalXp: newTotalXp,
      level: newLevel,
      leveledUp,
      mastery: {
        level: mastery.level,
        points: mastery.points,
        previousLevel: previousMasteryLevel,
      },
      streak: streakResult.currentStreak,
      newBadges,
    });
  } catch (error) {
    console.error("Error recording answer:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}

async function getCurrentMasteryLevel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  lessonId: string,
): Promise<string> {
  const { data } = await supabase
    .from("skill_mastery")
    .select("mastery_level")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .single();

  return data?.mastery_level ?? "not_started";
}
