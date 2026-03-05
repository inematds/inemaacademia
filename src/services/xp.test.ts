import { describe, expect, it } from "vitest";

import { calculateLevel, calculateXpGain } from "@/services/xp";

describe("calculateXpGain", () => {
  it("retorna 25 XP para complete_video", () => {
    expect(calculateXpGain("complete_video")).toBe(25);
  });

  it("retorna 25 XP para complete_article", () => {
    expect(calculateXpGain("complete_article")).toBe(25);
  });

  it("retorna 10 XP para correct_answer", () => {
    expect(calculateXpGain("correct_answer")).toBe(10);
  });

  it("retorna 50 XP para perfect_exercise", () => {
    expect(calculateXpGain("perfect_exercise")).toBe(50);
  });

  it("retorna 100 XP para complete_unit_quiz", () => {
    expect(calculateXpGain("complete_unit_quiz")).toBe(100);
  });

  it("retorna 200 XP para complete_unit_test", () => {
    expect(calculateXpGain("complete_unit_test")).toBe(200);
  });

  it("retorna 150 XP para reach_mastery", () => {
    expect(calculateXpGain("reach_mastery")).toBe(150);
  });

  it("retorna 50 XP para daily_streak", () => {
    expect(calculateXpGain("daily_streak")).toBe(50);
  });

  it("retorna 0 para acao desconhecida", () => {
    expect(calculateXpGain("unknown_action")).toBe(0);
  });
});

describe("calculateLevel", () => {
  it("retorna nivel 1 para 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("retorna nivel 1 para XP negativo", () => {
    expect(calculateLevel(-100)).toBe(1);
  });

  it("retorna nivel 1 para XP abaixo do threshold do nivel 2", () => {
    // Level 2 threshold = 500 * 2^1.5 = 500 * 2.828... = 1414
    expect(calculateLevel(1000)).toBe(1);
  });

  it("retorna nivel 2 quando XP atinge threshold do nivel 2", () => {
    // Level 2 threshold = floor(500 * 2^1.5) = 1414
    expect(calculateLevel(1414)).toBe(2);
  });

  it("retorna nivel 3 quando XP atinge threshold do nivel 3", () => {
    // Level 3 threshold = floor(500 * 3^1.5) = floor(500 * 5.196) = 2598
    expect(calculateLevel(2598)).toBe(3);
  });

  it("retorna nivel correto para XP alto", () => {
    // Level 10 threshold = floor(500 * 10^1.5) = floor(500 * 31.622) = 15811
    expect(calculateLevel(15811)).toBe(10);
  });
});
