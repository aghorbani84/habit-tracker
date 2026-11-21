/** Date helpers. All dates are local-time `yyyy-mm-dd` strings so that
 *  streaks never shift across timezones (no `toISOString` UTC bug). */

export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  return toKey(date);
}

/** Days in a month (month is 0-based). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Current streak: consecutive completed days ending today, or ending
 * yesterday when today is not done yet (a streak is not broken by a
 * day that has not finished).
 */
export function calcCurrentStreak(
  completed: ReadonlySet<string>,
  today: string = todayKey(),
): number {
  let cursor = completed.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (completed.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive completed days in the whole history. */
export function calcLongestStreak(completed: ReadonlySet<string>): number {
  if (completed.size === 0) return 0;
  const sorted = [...completed].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

/** Number of completions inside the 7-day window ending on `today`. */
export function completionsInLast7Days(
  completed: ReadonlySet<string>,
  today: string = todayKey(),
): number {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    if (completed.has(addDays(today, -i))) count += 1;
  }
  return count;
}

export interface HeatmapCell {
  key: string; // yyyy-mm-dd
  date: Date;
  inMonth: boolean;
  count: number; // habits completed that day (0 when none)
}

/**
 * GitHub-style grid for one calendar month: columns are weeks
 * (Sunday-first), rows are weekdays. Leading/trailing cells pad the
 * grid so every week is a full 7-day column.
 */
export function buildMonthGrid(
  year: number,
  month: number, // 0-based
  countsByDate: ReadonlyMap<string, number>,
): HeatmapCell[][] {
  const first = new Date(year, month, 1);
  const totalDays = daysInMonth(year, month);
  const cells: HeatmapCell[] = [];

  // Pad days before the 1st so the grid starts on a Sunday.
  for (let i = 0; i < first.getDay(); i++) {
    const date = new Date(year, month, 1 - first.getDay() + i);
    cells.push({ key: toKey(date), date, inMonth: false, count: 0 });
  }
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const key = toKey(date);
    cells.push({ key, date, inMonth: true, count: countsByDate.get(key) ?? 0 });
  }
  // Pad to a whole number of weeks.
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const date = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ key: toKey(date), date, inMonth: false, count: 0 });
  }

  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
