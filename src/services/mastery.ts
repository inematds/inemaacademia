export type MasteryLevel = "not_started" | "familiar" | "proficient" | "mastered";

export function getMasteryFromCorrectStreak(streak: number): { level: MasteryLevel; points: number } {
  if (streak >= 3) return { level: "mastered", points: 100 };
  if (streak >= 2) return { level: "proficient", points: 80 };
  if (streak >= 1) return { level: "familiar", points: 50 };
  return { level: "not_started", points: 0 };
}

const MASTERY_POINTS: Record<MasteryLevel, number> = {
  not_started: 0,
  familiar: 50,
  proficient: 80,
  mastered: 100,
};
const MASTERY_RANK: MasteryLevel[] = ["not_started", "familiar", "proficient", "mastered"];

/** Mantem o maior nivel ja alcancado (um erro nao apaga o dominio). */
export function keepHighestMastery(
  computed: { level: MasteryLevel; points: number },
  previous: string,
): { level: MasteryLevel; points: number } {
  const prev = (MASTERY_RANK as string[]).includes(previous) ? (previous as MasteryLevel) : "not_started";
  return MASTERY_RANK.indexOf(prev) > MASTERY_RANK.indexOf(computed.level)
    ? { level: prev, points: MASTERY_POINTS[prev] }
    : computed;
}
