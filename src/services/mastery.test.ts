import { describe, expect, it } from "vitest";

import { getMasteryFromCorrectStreak } from "@/services/mastery";

describe("getMasteryFromCorrectStreak", () => {
  it("retorna not_started para streak 0", () => {
    expect(getMasteryFromCorrectStreak(0)).toEqual({ level: "not_started", points: 0 });
  });

  it("retorna familiar para streak 1", () => {
    expect(getMasteryFromCorrectStreak(1)).toEqual({ level: "familiar", points: 50 });
  });

  it("retorna proficient para streak 2", () => {
    expect(getMasteryFromCorrectStreak(2)).toEqual({ level: "proficient", points: 80 });
  });

  it("retorna mastered para streak 3+", () => {
    expect(getMasteryFromCorrectStreak(3)).toEqual({ level: "mastered", points: 100 });
  });
});
