import { diasEntre, hojeBR } from "@/lib/dates";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  xpBonus: number;
}

/**
 * Update the student's streak based on their last active date.
 * - If lastActive was yesterday: increment streak
 * - If lastActive was today: no change (but a streak of 0 becomes 1)
 * - Otherwise: reset to 1
 * `today` is the student's date in Brasilia (AAAA-MM-DD).
 */
export function updateStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  longestStreak: number,
  today: string = hojeBR(),
): StreakResult {
  if (!lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      xpBonus: 0,
    };
  }

  const diffDays = diasEntre(lastActiveDate, today);

  if (diffDays <= 0) {
    // Same day: no change. Perfil antigo nascia com a data de hoje e
    // sequencia 0; a primeira atividade do dia conta como 1.
    const streak = Math.max(1, currentStreak);
    return {
      currentStreak: streak,
      longestStreak: Math.max(streak, longestStreak),
      xpBonus: 0,
    };
  }

  if (diffDays === 1) {
    // Yesterday: increment streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      xpBonus: 50,
    };
  }

  // More than 1 day gap: reset
  return {
    currentStreak: 1,
    longestStreak: Math.max(1, longestStreak),
    xpBonus: 0,
  };
}
