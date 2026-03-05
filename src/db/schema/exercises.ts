import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

import { lessons } from "./content";

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "multiple_select",
  "true_false",
  "numeric_input",
  "text_input",
  "fill_blank",
  "ordering",
  "matching",
]);

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id),
  title: text("title").notNull(),
  instructions: text("instructions"),
  order: integer("order").notNull().default(0),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  type: questionTypeEnum("type").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"),
  correctAnswer: jsonb("correct_answer"),
  explanation: text("explanation"),
  hints: jsonb("hints"),
  points: integer("points").notNull().default(10),
  order: integer("order").notNull().default(0),
});

export const studentAnswers = pgTable("student_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  answer: jsonb("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptNumber: integer("attempt_number").notNull().default(1),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
