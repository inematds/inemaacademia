import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { questions } from "./exercises";

export const assessmentTypeEnum = pgEnum("assessment_type", [
  "lesson_quiz",
  "unit_quiz",
  "unit_test",
  "course_challenge",
]);

export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  type: assessmentTypeEnum("type").notNull(),
  relatedId: uuid("related_id").notNull(),
  timeLimitMinutes: integer("time_limit_minutes"),
  passingScore: integer("passing_score").notNull().default(70),
  maxAttempts: integer("max_attempts").notNull().default(3),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(true),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id),
  order: integer("order").notNull().default(0),
});

export const assessmentAttempts = pgTable("assessment_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
});
