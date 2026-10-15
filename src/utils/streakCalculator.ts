import { TODAY, addDays } from './dateUtils';

export interface StreakResult {
  current: number;  // consecutive days ending today or yesterday
  best: number;     // longest streak ever
  total: number;    // total days completed
}

/**
 * Calculates streaks from a list of dates where a habit was completed.
 * Dates must be in YYYY-MM-DD format. Duplicates are ignored.
 * A streak counts if the last done date is today or yesterday (grace day).
 */
export function calculateStreak(doneDates: string[]): StreakResult {
  if (doneDates.length === 0) return { current: 0, best: 0, total: 0 };

  const unique = [...new Set(doneDates)].sort(); // ascending, deduplicated
  const total = unique.length;
  const datesSet = new Set(unique);
  const today = TODAY();
  const yesterday = addDays(today, -1);

  // Current streak: walk backwards from today (or yesterday as grace day)
  const anchor = datesSet.has(today) ? today : datesSet.has(yesterday) ? yesterday : null;
  let current = 0;
  if (anchor) {
    let d = anchor;
    while (datesSet.has(d)) {
      current++;
      d = addDays(d, -1);
    }
  }

  // Best streak: longest consecutive run in ascending date list
  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === addDays(unique[i - 1], 1)) {
      run++;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  return { current, best: Math.max(best, current), total };
}

export function formatStreakLabel(streak: number): string {
  if (streak === 0) return '—';
  if (streak === 1) return '1 día';
  return `${streak} días`;
}
