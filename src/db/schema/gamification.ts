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

export const badgeCategoryEnum = pgEnum("badge_category", [
  "mastery",
  "streak",
  "xp",
  "special",
  "community",
]);

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  iconUrl: text("icon_url"),
  category: badgeCategoryEnum("category").notNull(),
  condition: jsonb("condition"),
  xpReward: integer("xp_reward").notNull().default(0),
});

export const studentBadges = pgTable("student_badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  badgeId: uuid("badge_id")
    .notNull()
    .references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const avatars = pgTable("avatars", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  requiredXp: integer("required_xp").notNull().default(0),
  requiredLevel: integer("required_level").notNull().default(1),
});

export const studentAvatars = pgTable("student_avatars", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(),
  avatarId: uuid("avatar_id")
    .notNull()
    .references(() => avatars.id),
  isActive: boolean("is_active").notNull().default(false),
});
