const XP_TABLE: Record<string, number> = {
  complete_video: 25,
  complete_article: 25,
  correct_answer: 10,
  perfect_exercise: 50,
  complete_unit_quiz: 100,
  complete_unit_test: 200,
  reach_mastery: 150,
  daily_streak: 50,
};

export function calculateXpGain(action: string, _details?: object): number {
  return XP_TABLE[action] ?? 0;
}

/**
 * Calculate level from total XP.
 * Level N requires 500 * N^1.5 cumulative XP.
 * Returns the highest level where totalXp >= threshold.
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  while (true) {
    const nextLevelThreshold = Math.floor(500 * Math.pow(level + 1, 1.5));
    if (totalXp < nextLevelThreshold) break;
    level++;
  }
  return level;
}
