import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const lessonTypeEnum = pgEnum("lesson_type", [
  "video",
  "article",
  "exercise",
  "quiz",
]);

export const contentTypeEnum = pgEnum("lesson_content_type", [
  "video",
  "article",
  "exercise",
]);

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id").notNull().references(() => units.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  type: lessonTypeEnum("type").notNull().default("video"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonContent = pgTable("lesson_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id),
  contentType: contentTypeEnum("content_type").notNull(),
  videoUrl: text("video_url"),
  articleBody: text("article_body"),
  exerciseData: jsonb("exercise_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
