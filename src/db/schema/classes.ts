import {
  boolean,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const assignmentContentTypeEnum = pgEnum("assignment_content_type", [
  "lesson",
  "exercise",
  "quiz",
  "unit_test",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "in_progress",
  "completed",
  "late",
]);

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  schoolName: text("school_name"),
  gradeLevel: text("grade_level"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classStudents = pgTable("class_students", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id),
  studentId: uuid("student_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id")
    .notNull()
    .references(() => classes.id),
  teacherId: uuid("teacher_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contentType: assignmentContentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id),
  studentId: uuid("student_id").notNull(),
  status: submissionStatusEnum("status").notNull().default("pending"),
  score: decimal("score", { precision: 5, scale: 2 }),
  completedAt: timestamp("completed_at"),
});
