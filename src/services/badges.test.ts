import { describe, expect, it } from "vitest";

import { checkBadgeConditions, StudentStats } from "@/services/badges";

function makeStats(overrides: Partial<StudentStats> = {}): StudentStats {
  return {
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalMasteries: 0,
    totalLogins: 0,
    totalExercisesCompleted: 0,
    totalCoursesCompleted: 0,
    hasPerfectQuiz: false,
    ...overrides,
  };
}

describe("checkBadgeConditions", () => {
  it("retorna array vazio para stats zeradas", () => {
    expect(checkBadgeConditions(makeStats())).toEqual([]);
  });

  // Streak badges
  it("retorna streak-3 para streak de 3", () => {
    const badges = checkBadgeConditions(makeStats({ currentStreak: 3 }));
    expect(badges).toContain("streak-3");
    expect(badges).not.toContain("streak-7");
  });

  it("retorna streak-3 e streak-7 para streak de 7", () => {
    const badges = checkBadgeConditions(makeStats({ currentStreak: 7 }));
    expect(badges).toContain("streak-3");
    expect(badges).toContain("streak-7");
  });

  it("retorna todos os badges de streak para streak de 365", () => {
    const badges = checkBadgeConditions(makeStats({ currentStreak: 365 }));
    expect(badges).toContain("streak-3");
    expect(badges).toContain("streak-7");
    expect(badges).toContain("streak-30");
    expect(badges).toContain("streak-100");
    expect(badges).toContain("streak-365");
  });

  // XP badges
  it("retorna xp-1000 para 1000 XP", () => {
    const badges = checkBadgeConditions(makeStats({ totalXp: 1000 }));
    expect(badges).toContain("xp-1000");
    expect(badges).not.toContain("xp-5000");
  });

  it("retorna xp-1000 e xp-5000 para 5000 XP", () => {
    const badges = checkBadgeConditions(makeStats({ totalXp: 5000 }));
    expect(badges).toContain("xp-1000");
    expect(badges).toContain("xp-5000");
  });

  it("retorna todos os badges de XP para 50000 XP", () => {
    const badges = checkBadgeConditions(makeStats({ totalXp: 50000 }));
    expect(badges).toContain("xp-1000");
    expect(badges).toContain("xp-5000");
    expect(badges).toContain("xp-10000");
    expect(badges).toContain("xp-50000");
  });

  // Mastery badges
  it("retorna mastery-1 para 1 mastery", () => {
    const badges = checkBadgeConditions(makeStats({ totalMasteries: 1 }));
    expect(badges).toContain("mastery-1");
    expect(badges).not.toContain("mastery-10");
  });

  it("retorna mastery-1 e mastery-10 para 10 masteries", () => {
    const badges = checkBadgeConditions(makeStats({ totalMasteries: 10 }));
    expect(badges).toContain("mastery-1");
    expect(badges).toContain("mastery-10");
  });

  it("retorna todos os badges de mastery para 50 masteries", () => {
    const badges = checkBadgeConditions(makeStats({ totalMasteries: 50 }));
    expect(badges).toContain("mastery-1");
    expect(badges).toContain("mastery-10");
    expect(badges).toContain("mastery-50");
  });

  // Special badges
  it("retorna first-login para 1 login", () => {
    const badges = checkBadgeConditions(makeStats({ totalLogins: 1 }));
    expect(badges).toContain("first-login");
  });

  it("retorna first-exercise para 1 exercicio", () => {
    const badges = checkBadgeConditions(
      makeStats({ totalExercisesCompleted: 1 }),
    );
    expect(badges).toContain("first-exercise");
  });

  it("retorna first-course-complete para 1 curso completo", () => {
    const badges = checkBadgeConditions(
      makeStats({ totalCoursesCompleted: 1 }),
    );
    expect(badges).toContain("first-course-complete");
  });

  it("retorna perfect-quiz quando tem quiz perfeito", () => {
    const badges = checkBadgeConditions(makeStats({ hasPerfectQuiz: true }));
    expect(badges).toContain("perfect-quiz");
  });

  // Combined
  it("retorna multiplos badges para stats combinadas", () => {
    const badges = checkBadgeConditions(
      makeStats({
        totalXp: 5000,
        currentStreak: 7,
        totalMasteries: 10,
        totalLogins: 1,
        totalExercisesCompleted: 5,
        hasPerfectQuiz: true,
      }),
    );
    expect(badges).toContain("streak-3");
    expect(badges).toContain("streak-7");
    expect(badges).toContain("xp-1000");
    expect(badges).toContain("xp-5000");
    expect(badges).toContain("mastery-1");
    expect(badges).toContain("mastery-10");
    expect(badges).toContain("first-login");
    expect(badges).toContain("first-exercise");
    expect(badges).toContain("perfect-quiz");
    expect(badges).not.toContain("first-course-complete");
  });
});
