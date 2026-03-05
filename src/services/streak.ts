export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  xpBonus: number;
}

/**
 * Update the student's streak based on their last active date.
 * - If lastActive was yesterday: increment streak
 * - If lastActive was today: no change
 * - Otherwise: reset to 1
 */
export function updateStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  longestStreak: number,
): StreakResult {
  if (!lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      xpBonus: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = new Date(lastActiveDate + "T00:00:00");
  lastActive.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastActive.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day: no change
    return {
      currentStreak,
      longestStreak,
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
