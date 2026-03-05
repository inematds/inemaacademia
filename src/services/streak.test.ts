import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { updateStreak } from "@/services/streak";

describe("updateStreak", () => {
  beforeEach(() => {
    // Fix "today" to 2026-03-05
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-05T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inicia streak em 1 quando lastActiveDate e null", () => {
    const result = updateStreak(null, 0, 0);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      xpBonus: 0,
    });
  });

  it("mantem streak quando lastActiveDate e hoje", () => {
    const result = updateStreak("2026-03-05", 5, 10);
    expect(result).toEqual({
      currentStreak: 5,
      longestStreak: 10,
      xpBonus: 0,
    });
  });

  it("incrementa streak quando lastActiveDate foi ontem", () => {
    const result = updateStreak("2026-03-04", 5, 10);
    expect(result).toEqual({
      currentStreak: 6,
      longestStreak: 10,
      xpBonus: 50,
    });
  });

  it("atualiza longestStreak quando novo streak e maior", () => {
    const result = updateStreak("2026-03-04", 10, 10);
    expect(result).toEqual({
      currentStreak: 11,
      longestStreak: 11,
      xpBonus: 50,
    });
  });

  it("reseta streak para 1 quando gap maior que 1 dia", () => {
    const result = updateStreak("2026-03-02", 5, 10);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 10,
      xpBonus: 0,
    });
  });

  it("preserva longestStreak no reset", () => {
    const result = updateStreak("2026-01-01", 3, 20);
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 20,
      xpBonus: 0,
    });
  });
});
