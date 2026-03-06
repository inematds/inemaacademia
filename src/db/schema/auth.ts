import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["aluno", "professor", "admin"]);

export const gradeLevelEnum = pgEnum("grade_level", [
  "6-fund", "7-fund", "8-fund", "9-fund",
  "1-em", "2-em", "3-em",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role").notNull().default("aluno"),
  gradeLevel: gradeLevelEnum("grade_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
