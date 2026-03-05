import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateXpGain, calculateLevel } from "@/services/xp";
import { updateStreak } from "@/services/streak";
import { checkBadgeConditions, type StudentStats } from "@/services/badges";
import { progressLimiter } from "@/lib/rate-limit";

const completeLessonSchema = z.object({
  lessonId: z.string().uuid(),
  timeSpentSeconds: z.number().int().min(0).optional().default(0),
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
    const parsed = completeLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { lessonId, timeSpentSeconds } = parsed.data;
    const studentId = user.id;

    // Check if lesson exists
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, type, unit_id")
      .eq("id", lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json(
        { error: "Aula nao encontrada." },
        { status: 404 },
      );
    }

    // Upsert lesson progress
    const { data: existingProgress } = await supabase
      .from("lesson_progress")
      .select("id, status")
      .eq("student_id", studentId)
      .eq("lesson_id", lessonId)
      .single();

    const alreadyCompleted = existingProgress?.status === "completed";

    if (existingProgress) {
      await supabase
        .from("lesson_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
        })
        .eq("id", existingProgress.id);
    } else {
      await supabase.from("lesson_progress").insert({
        student_id: studentId,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpentSeconds,
      });
    }

    // Calculate XP gain
    let xpGained = 0;
    if (!alreadyCompleted) {
      const action =
        lesson.type === "video"
          ? "complete_video"
          : lesson.type === "article"
            ? "complete_article"
            : "correct_answer";
      xpGained = calculateXpGain(action);
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

    // Calculate new totals
    const newTotalXp = stats.total_xp + xpGained;
    const oldLevel = stats.level;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > oldLevel;

    // Update student stats
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

    // Update course progress
    const { data: unit } = await supabase
      .from("units")
      .select("course_id")
      .eq("id", lesson.unit_id)
      .single();

    if (unit) {
      const { data: courseLessons } = await supabase
        .from("lessons")
        .select("id, units!inner(course_id)")
        .eq("units.course_id", unit.course_id);

      const totalLessons = courseLessons?.length ?? 0;

      if (totalLessons > 0) {
        const lessonIds = courseLessons!.map((l) => l.id);

        const { count: completedCount } = await supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("student_id", studentId)
          .eq("status", "completed")
          .in("lesson_id", lessonIds);

        const completedLessons = completedCount ?? 0;
        const masteryPercentage = ((completedLessons / totalLessons) * 100).toFixed(2);

        const { data: existingCourseProgress } = await supabase
          .from("course_progress")
          .select("id")
          .eq("student_id", studentId)
          .eq("course_id", unit.course_id)
          .single();

        if (existingCourseProgress) {
          await supabase
            .from("course_progress")
            .update({
              total_lessons: totalLessons,
              completed_lessons: completedLessons,
              mastery_percentage: masteryPercentage,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingCourseProgress.id);
        } else {
          await supabase.from("course_progress").insert({
            student_id: studentId,
            course_id: unit.course_id,
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
            mastery_percentage: masteryPercentage,
          });
        }
      }
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

    // Get already earned badge slugs
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

        // Award badge XP
        if (badge.xp_reward > 0) {
          await supabase
            .from("student_stats")
            .update({
              total_xp: newTotalXp + badge.xp_reward,
            })
            .eq("student_id", studentId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      xpGained,
      totalXp: newTotalXp,
      level: newLevel,
      leveledUp,
      streak: streakResult.currentStreak,
      newBadges,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
