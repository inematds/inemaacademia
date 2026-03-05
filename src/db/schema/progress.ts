import {
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const lessonStatusEnum = pgEnum("lesson_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const masteryLevelEnum = pgEnum("mastery_level", [
  "not_started",
  "familiar",
  "proficient",
  "mastered",
]);

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  lessonId: uuid("lesson_id").notNull(),
  status: lessonStatusEnum("status").notNull().default("not_started"),
  completedAt: timestamp("completed_at"),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
});

export const skillMastery = pgTable("skill_mastery", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  lessonId: uuid("lesson_id").notNull(),
  masteryLevel: masteryLevelEnum("mastery_level").notNull().default("not_started"),
  masteryPoints: integer("mastery_points").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  lastPracticedAt: timestamp("last_practiced_at"),
});

export const courseProgress = pgTable("course_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  courseId: uuid("course_id").notNull(),
  totalLessons: integer("total_lessons").notNull().default(0),
  completedLessons: integer("completed_lessons").notNull().default(0),
  masteryPercentage: decimal("mastery_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studentStats = pgTable("student_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  totalXp: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  level: integer("level").notNull().default(1),
});
