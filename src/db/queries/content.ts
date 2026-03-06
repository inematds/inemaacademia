import { eq, and, asc, count } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  subjects,
  courses,
  units,
  lessons,
  lessonContent,
} from "@/db/schema/content";
import { lessonProgress, courseProgress } from "@/db/schema/progress";
import { profiles } from "@/db/schema/auth";
import { studentStats } from "@/db/schema/progress";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(id: string) {
  return UUID_RE.test(id);
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export async function getSubjects() {
  return db
    .select()
    .from(subjects)
    .where(eq(subjects.isActive, true))
    .orderBy(asc(subjects.order));
}

export async function getSubjectBySlug(slug: string) {
  const result = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.slug, slug), eq(subjects.isActive, true)))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubjectById(id: string) {
  if (!isValidUuid(id)) return null;
  const result = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllSubjects() {
  return db.select().from(subjects).orderBy(asc(subjects.order));
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export async function getCoursesBySubject(subjectId: string) {
  return db
    .select()
    .from(courses)
    .where(and(eq(courses.subjectId, subjectId), eq(courses.isActive, true)))
    .orderBy(asc(courses.order));
}

export async function getCourseBySlug(slug: string) {
  const result = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.isActive, true)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCourseById(id: string) {
  if (!isValidUuid(id)) return null;
  const result = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllCourses() {
  return db
    .select({
      id: courses.id,
      subjectId: courses.subjectId,
      name: courses.name,
      slug: courses.slug,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
      order: courses.order,
      isActive: courses.isActive,
      createdAt: courses.createdAt,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
    })
    .from(courses)
    .leftJoin(subjects, eq(courses.subjectId, subjects.id))
    .orderBy(asc(courses.order));
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

export async function getUnitsByCourse(courseId: string) {
  return db
    .select()
    .from(units)
    .where(and(eq(units.courseId, courseId), eq(units.isActive, true)))
    .orderBy(asc(units.order));
}

export async function getUnitById(id: string) {
  if (!isValidUuid(id)) return null;
  const result = await db
    .select()
    .from(units)
    .where(eq(units.id, id))
    .limit(1);
  return result[0] ?? null;
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function getLessonsByUnit(unitId: string) {
  return db
    .select()
    .from(lessons)
    .where(and(eq(lessons.unitId, unitId), eq(lessons.isActive, true)))
    .orderBy(asc(lessons.order));
}

export async function getLessonById(id: string) {
  if (!isValidUuid(id)) return null;
  const result = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getLessonContent(lessonId: string) {
  if (!isValidUuid(lessonId)) return null;
  const result = await db
    .select()
    .from(lessonContent)
    .where(eq(lessonContent.lessonId, lessonId))
    .limit(1);
  return result[0] ?? null;
}

export const getLessonWithContent = cache(async function getLessonWithContent(lessonId: string) {
  const lesson = await getLessonById(lessonId);
  if (!lesson) return null;

  // Run independent queries in parallel
  const [content, unit] = await Promise.all([
    getLessonContent(lessonId),
    getUnitById(lesson.unitId),
  ]);

  // Run next level in parallel
  const [course, siblingLessons] = await Promise.all([
    unit ? getCourseById(unit.courseId) : null,
    unit ? getLessonsByUnit(unit.id) : [],
  ]);

  const subject = course ? await getSubjectById(course.subjectId) : null;

  const currentIndex = siblingLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

  return {
    lesson,
    content,
    unit,
    course,
    subject,
    siblingLessons,
    prevLesson,
    nextLesson,
  };
});

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function getLessonProgressForUser(
  userId: string,
  lessonId: string,
) {
  const result = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.studentId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getLessonProgressForUnit(
  userId: string,
  unitId: string,
) {
  const unitLessons = await getLessonsByUnit(unitId);
  const lessonIds = unitLessons.map((l) => l.id);

  if (lessonIds.length === 0) return [];

  const progress = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.studentId, userId));

  return progress.filter((p) => lessonIds.includes(p.lessonId));
}

export async function getCourseProgressForUser(
  userId: string,
  courseId: string,
) {
  const result = await db
    .select()
    .from(courseProgress)
    .where(
      and(
        eq(courseProgress.studentId, userId),
        eq(courseProgress.courseId, courseId),
      ),
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getSubjectProgressForUser(
  userId: string,
  subjectId: string,
) {
  const subjectCourses = await getCoursesBySubject(subjectId);
  if (subjectCourses.length === 0) return 0;

  let totalCompleted = 0;
  let totalLessons = 0;

  for (const course of subjectCourses) {
    const progress = await getCourseProgressForUser(userId, course.id);
    if (progress) {
      totalCompleted += progress.completedLessons;
      totalLessons += progress.totalLessons;
    }
  }

  if (totalLessons === 0) return 0;
  return Math.round((totalCompleted / totalLessons) * 100);
}

// ---------------------------------------------------------------------------
// Stats (for admin dashboard)
// ---------------------------------------------------------------------------

export async function getTotalStudents() {
  const result = await db
    .select({ count: count() })
    .from(profiles)
    .where(eq(profiles.role, "aluno"));
  return result[0]?.count ?? 0;
}

export async function getTotalTeachers() {
  const result = await db
    .select({ count: count() })
    .from(profiles)
    .where(eq(profiles.role, "professor"));
  return result[0]?.count ?? 0;
}

export async function getTotalCourses() {
  const result = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.isActive, true));
  return result[0]?.count ?? 0;
}

export async function getTotalLessons() {
  const result = await db
    .select({ count: count() })
    .from(lessons)
    .where(eq(lessons.isActive, true));
  return result[0]?.count ?? 0;
}

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export const getUserProfile = cache(async function getUserProfile(userId: string) {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return result[0] ?? null;
});

export const getUserStats = cache(async function getUserStats(userId: string) {
  const result = await db
    .select()
    .from(studentStats)
    .where(eq(studentStats.studentId, userId))
    .limit(1);
  return result[0] ?? null;
});

// ---------------------------------------------------------------------------
// Course detail with units and lessons
// ---------------------------------------------------------------------------

export async function getCourseWithUnitsAndLessons(courseId: string) {
  const course = await getCourseById(courseId);
  if (!course) return null;

  const courseUnits = await getUnitsByCourse(courseId);

  const unitsWithLessons = await Promise.all(
    courseUnits.map(async (unit) => {
      const unitLessons = await getLessonsByUnit(unit.id);
      return { ...unit, lessons: unitLessons };
    }),
  );

  return { ...course, units: unitsWithLessons };
}
