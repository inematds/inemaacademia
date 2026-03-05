export type MasteryLevel = "not_started" | "familiar" | "proficient" | "mastered";

export function getMasteryFromCorrectStreak(streak: number): { level: MasteryLevel; points: number } {
  if (streak >= 3) return { level: "mastered", points: 100 };
  if (streak >= 2) return { level: "proficient", points: 80 };
  if (streak >= 1) return { level: "familiar", points: 50 };
  return { level: "not_started", points: 0 };
}
