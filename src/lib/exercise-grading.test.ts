import { describe, expect, it } from "vitest";
import { correctIndexOf, isGradable, optionsOf } from "@/lib/exercise-grading";

describe("gabarito das questoes", () => {
  it("multipla escolha com gabarito em texto", () => {
    const q = { type: "multiple_choice", options: ["Movimento", "Luz", "Som"], correct_answer: "Luz" };
    expect(correctIndexOf(q)).toBe(1);
    expect(isGradable(q)).toBe(true);
  });
  it("multipla escolha com gabarito em indice", () => {
    expect(correctIndexOf({ type: "multiple_choice", options: ["a", "b"], correct_answer: 0 })).toBe(0);
  });
  it("verdadeiro ou falso", () => {
    const q = { type: "true_false", options: null, correct_answer: "false" };
    expect(optionsOf(q)).toEqual(["Verdadeiro", "Falso"]);
    expect(correctIndexOf(q)).toBe(1);
    expect(correctIndexOf({ ...q, correct_answer: true })).toBe(0);
  });
  it("gabarito que nao esta nas opcoes nao aparece", () => {
    expect(isGradable({ type: "multiple_choice", options: ["a", "b"], correct_answer: "c" })).toBe(false);
    expect(isGradable({ type: "open", options: ["a", "b"], correct_answer: "a" })).toBe(false);
  });
});
