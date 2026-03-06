import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentDashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Painel do Aluno | INEMA Academia",
};

export default async function AlunoDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentId = user.id;

  // Fetch student stats
  const { data: stats } = await supabase
    .from("student_stats")
    .select("*")
    .eq("student_id", studentId)
    .single();

  // Fetch courses in progress
  const { data: courseProgressList } = await supabase
    .from("course_progress")
    .select("*, courses(id, name, slug, description, thumbnail_url)")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });

  // Fetch recent skill mastery
  const { data: recentSkills } = await supabase
    .from("skill_mastery")
    .select("*, lessons(id, name, slug, type)")
    .eq("student_id", studentId)
    .order("last_practiced_at", { ascending: false })
    .limit(6);

  // Fetch completed lesson count
  const { count: completedLessonsCount } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("status", "completed");

  // Fetch total time spent
  const { data: timeData } = await supabase
    .from("lesson_progress")
    .select("time_spent_seconds")
    .eq("student_id", studentId);

  const totalTimeSeconds = (timeData ?? []).reduce(
    (sum, row) => sum + (row.time_spent_seconds ?? 0),
    0,
  );

  // Fetch total mastery count
  const { count: masteryCount } = await supabase
    .from("skill_mastery")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("mastery_level", "mastered");

  // Fetch available courses for recommendations (not yet started)
  const enrolledCourseIds = (courseProgressList ?? [])
    .map((cp) => {
      const c = cp.courses as { id: string } | null;
      return c?.id;
    })
    .filter(Boolean) as string[];

  let recommendedCourses: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    subjectSlug: string;
  }> = [];

  if (enrolledCourseIds.length > 0) {
    const { data: notStarted } = await supabase
      .from("courses")
      .select("id, name, slug, description, subjects(slug)")
      .eq("is_active", true)
      .not("id", "in", `(${enrolledCourseIds.join(",")})`)
      .limit(3);
    recommendedCourses = (notStarted ?? []).map((c) => ({
      ...c,
      subjectSlug: (c.subjects as unknown as { slug: string } | null)?.slug ?? "",
    }));
  } else {
    const { data: allCourses } = await supabase
      .from("courses")
      .select("id, name, slug, description, subjects(slug)")
      .eq("is_active", true)
      .limit(3);
    recommendedCourses = (allCourses ?? []).map((c) => ({
      ...c,
      subjectSlug: (c.subjects as unknown as { slug: string } | null)?.slug ?? "",
    }));
  }

  // Find next lessons to continue (in_progress or first not_started in each course)
  const { data: inProgressLessons } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons(id, name, slug, type, unit_id)")
    .eq("student_id", studentId)
    .eq("status", "in_progress")
    .limit(3);

  const nextLessons = (inProgressLessons ?? []).map((lp) => {
    const l = lp.lessons as unknown as {
      id: string;
      name: string;
      slug: string;
      type: string;
      unit_id: string;
    } | null;
    return l;
  }).filter(Boolean);

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", studentId)
    .single();

  // Fetch enrolled courses (selected by student)
  const { data: enrollmentRows } = await supabase
    .from("student_enrollments")
    .select("course_id, enrolled_at, courses(id, name, slug, description, subject_id, subjects(name, slug, icon, color))")
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: true });

  const enrollments = (enrollmentRows ?? []).map((e) => {
    const c = e.courses as unknown as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      subject_id: string;
      subjects: { name: string; slug: string; icon: string | null; color: string | null } | null;
    } | null;
    return {
      courseId: c?.id ?? "",
      courseName: c?.name ?? "",
      courseSlug: c?.slug ?? "",
      courseDescription: c?.description ?? null,
      subjectSlug: c?.subjects?.slug ?? "",
      subjectName: c?.subjects?.name ?? "",
      subjectIcon: c?.subjects?.icon ?? null,
      subjectColor: c?.subjects?.color ?? null,
    };
  });

  // Fetch recent badges
  const { data: recentBadges } = await supabase
    .from("student_badges")
    .select("earned_at, badges(name, slug, icon_url, category)")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false })
    .limit(4);

  return (
    <StudentDashboardClient
      enrolledCourses={enrollments.map((e) => ({
        courseId: e.courseId,
        courseName: e.courseName,
        courseSlug: e.courseSlug,
        courseDescription: e.courseDescription,
        subjectSlug: e.subjectSlug ?? "",
        subjectName: e.subjectName ?? "",
        subjectIcon: e.subjectIcon,
        subjectColor: e.subjectColor,
      }))}
      profile={{
        fullName: profile?.full_name ?? "Estudante",
        avatarUrl: profile?.avatar_url ?? null,
      }}
      stats={{
        totalXp: stats?.total_xp ?? 0,
        level: stats?.level ?? 1,
        currentStreak: stats?.current_streak ?? 0,
        longestStreak: stats?.longest_streak ?? 0,
        completedLessons: completedLessonsCount ?? 0,
        totalTimeSeconds,
        totalMasteries: masteryCount ?? 0,
      }}
      coursesInProgress={(courseProgressList ?? []).map((cp) => {
        const c = cp.courses as {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          thumbnail_url: string | null;
        } | null;
        return {
          courseId: c?.id ?? "",
          courseName: c?.name ?? "",
          courseSlug: c?.slug ?? "",
          completedLessons: cp.completed_lessons ?? 0,
          totalLessons: cp.total_lessons ?? 0,
          masteryPercentage: cp.mastery_percentage
            ? parseFloat(cp.mastery_percentage)
            : 0,
        };
      })}
      recentSkills={(recentSkills ?? []).map((sm) => {
        const l = sm.lessons as {
          id: string;
          name: string;
          slug: string;
          type: string;
        } | null;
        return {
          lessonName: l?.name ?? "",
          masteryLevel: sm.mastery_level,
          lastPracticedAt: sm.last_practiced_at,
        };
      })}
      recommendedCourses={recommendedCourses.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        subjectSlug: c.subjectSlug,
      }))}
      nextLessons={nextLessons.map((l) => ({
        id: l!.id,
        name: l!.name,
        slug: l!.slug,
        type: l!.type,
      }))}
      recentBadges={(recentBadges ?? []).map((sb) => {
        const b = sb.badges as unknown as {
          name: string;
          slug: string;
          icon_url: string | null;
          category: string;
        } | null;
        return {
          name: b?.name ?? "",
          slug: b?.slug ?? "",
          iconUrl: b?.icon_url ?? null,
          earnedAt: sb.earned_at,
        };
      })}
    />
  );
}
