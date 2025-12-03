/**
 * Calculates the next occurrence of 08:00 AM UTC.
 * @returns ISO string of the next reset time.
 */
export const getNextResetTime = (): string => {
  const now = new Date();
  const resetTime = new Date(now);

  // Set to today's 08:00:00 UTC
  resetTime.setUTCHours(8, 0, 0, 0);

  // If now is past 08:00 UTC, set to tomorrow
  if (now.getTime() >= resetTime.getTime()) {
    resetTime.setUTCDate(resetTime.getUTCDate() + 1);
  }

  return resetTime.toISOString();
};

/**
 * Checks if the reward has already been claimed today (after 08:00 UTC).
 * @param lastClaimDate ISO string of the last claim date.
 * @returns true if claimed today, false otherwise.
 */
export const isClaimedToday = (lastClaimDate: string): boolean => {
  if (!lastClaimDate) return false;

  const lastClaim = new Date(lastClaimDate);
  const now = new Date();

  // Calculate the most recent 08:00 UTC
  const resetTime = new Date(now);
  resetTime.setUTCHours(8, 0, 0, 0);

  // If now is before 08:00 UTC, the reset time was yesterday at 08:00 UTC
  if (now.getTime() < resetTime.getTime()) {
    resetTime.setUTCDate(resetTime.getUTCDate() - 1);
  }

  // If last claim was after the most recent reset time, it's claimed today
  return lastClaim.getTime() >= resetTime.getTime();
};

/**
 * Checks if the streak is broken (more than 48 hours since last claim relative to reset time).
 * Effectively checks if the user missed the previous day's window.
 * @param lastClaimDate ISO string of the last claim date.
 * @returns true if streak is broken, false otherwise.
 */
export const isStreakBroken = (lastClaimDate: string): boolean => {
  if (!lastClaimDate) return true;

  const lastClaim = new Date(lastClaimDate);
  const now = new Date();

  // Calculate the most recent 08:00 UTC
  const resetTime = new Date(now);
  resetTime.setUTCHours(8, 0, 0, 0);

  // If now is before 08:00 UTC, the reset time was yesterday at 08:00 UTC
  if (now.getTime() < resetTime.getTime()) {
    resetTime.setUTCDate(resetTime.getUTCDate() - 1);
  }

  // The threshold is 24 hours before the current reset time.
  // If the last claim was before this threshold, it means the user missed the entire previous period.
  const threshold = new Date(resetTime);
  threshold.setUTCDate(threshold.getUTCDate() - 1);

  return lastClaim.getTime() < threshold.getTime();
};
