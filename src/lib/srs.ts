import { addDays, addHours } from 'date-fns';

/**
 * Simplified Spaced Repetition logic.
 * Factors: level (0-5)
 * Returns the next review date based on performance.
 */
export function calculateNextReview(currentLevel: number, success: boolean): { nextReview: Date, nextLevel: number } {
  if (!success) {
    // If failed, reset to level 0 and review in 1 hour
    return {
      nextReview: addHours(new Date(), 1),
      nextLevel: 0
    };
  }

  // If success, increment level and set review interval
  const nextLevel = Math.min(currentLevel + 1, 6);
  
  // Review intervals (in days) based on level
  const intervals = [1, 2, 4, 7, 15, 30, 90]; // Days
  const daysToAdd = intervals[nextLevel] || 1;

  return {
    nextReview: addDays(new Date(), daysToAdd),
    nextLevel
  };
}
