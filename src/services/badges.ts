export interface StudentStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalMasteries: number;
  totalLogins: number;
  totalExercisesCompleted: number;
  totalCoursesCompleted: number;
  hasPerfectQuiz: boolean;
}

interface BadgeDefinition {
  slug: string;
  check: (stats: StudentStats) => boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak badges
  { slug: "streak-3", check: (s) => s.currentStreak >= 3 },
  { slug: "streak-7", check: (s) => s.currentStreak >= 7 },
  { slug: "streak-30", check: (s) => s.currentStreak >= 30 },
  { slug: "streak-100", check: (s) => s.currentStreak >= 100 },
  { slug: "streak-365", check: (s) => s.currentStreak >= 365 },

  // XP badges
  { slug: "xp-1000", check: (s) => s.totalXp >= 1000 },
  { slug: "xp-5000", check: (s) => s.totalXp >= 5000 },
  { slug: "xp-10000", check: (s) => s.totalXp >= 10000 },
  { slug: "xp-50000", check: (s) => s.totalXp >= 50000 },

  // Mastery badges
  { slug: "mastery-1", check: (s) => s.totalMasteries >= 1 },
  { slug: "mastery-10", check: (s) => s.totalMasteries >= 10 },
  { slug: "mastery-50", check: (s) => s.totalMasteries >= 50 },

  // Special badges
  { slug: "first-login", check: (s) => s.totalLogins >= 1 },
  { slug: "first-exercise", check: (s) => s.totalExercisesCompleted >= 1 },
  {
    slug: "first-course-complete",
    check: (s) => s.totalCoursesCompleted >= 1,
  },
  { slug: "perfect-quiz", check: (s) => s.hasPerfectQuiz },
];

/**
 * Check which badges a student has earned based on their stats.
 * Returns an array of badge slugs that the student qualifies for.
 */
export function checkBadgeConditions(stats: StudentStats): string[] {
  return BADGE_DEFINITIONS.filter((badge) => badge.check(stats)).map(
    (badge) => badge.slug,
  );
}
