/**
 * stats.ts — reducer-derived streak math (Round 2 method).
 *
 * Pure functions over the check-in log: every number the UI shows
 * (per-habit cards, proof strip, datasheet title) is computed here
 * from the reducer state — no invented numbers, unit-testable, and
 * recomputed on every state change because App derives them in render.
 */
import {
  addDays,
  calcCurrentStreak,
  calcLongestStreak,
  completionsInLast7Days,
  todayKey,
} from "./dates";
import type { Habit } from "../state/habitsReducer";

export interface HabitStats {
  /** Consecutive completed days ending today (or yesterday). */
  currentStreak: number;
  /** Longest run of consecutive completed days, ever. */
  bestStreak: number;
  /** Completion % over the last 30 days (0–100). */
  completion30d: number;
  /** Total check-ins in the habit's whole history. */
  checkIns: number;
  /** Completions in the 7-day window ending today. */
  thisWeek: number;
  /** thisWeek as % of the weekly target, capped at 100. */
  weeklyRate: number;
  /** Last 30 days (oldest → newest) as done / not-done flags, for the
   *  per-card mini heat strip. */
  last30: boolean[];
}

export function habitStats(habit: Habit, today: string = todayKey()): HabitStats {
  const completed = new Set(habit.completedDates);
  const currentStreak = calcCurrentStreak(completed, today);
  const bestStreak = calcLongestStreak(completed);
  const thisWeek = completionsInLast7Days(completed, today);
  const weeklyRate = Math.min(
    100,
    Math.round((thisWeek / Math.max(1, habit.targetPerWeek)) * 100),
  );
  let done30 = 0;
  const last30: boolean[] = [];
  for (let i = 29; i >= 0; i--) {
    const done = completed.has(addDays(today, -i));
    last30.push(done);
    if (done) done30 += 1;
  }
  return {
    currentStreak,
    bestStreak,
    completion30d: Math.round((done30 / 30) * 100),
    checkIns: habit.completedDates.length,
    thisWeek,
    weeklyRate,
    last30,
  };
}

export interface OverallStats {
  totalHabits: number;
  doneToday: number;
  totalCheckIns: number;
  bestStreak: number;
  /** Check-ins in the last 7 days as % of habit-days available. */
  weeklyRate: number;
  /** Check-ins in the last 30 days as % of habit-days available. */
  completion30d: number;
}

function countInWindow(habits: Habit[], days: number, today: string): number {
  let count = 0;
  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    for (const h of habits) {
      if (h.completedDates.includes(date)) count += 1;
    }
  }
  return count;
}

export function overallStats(habits: Habit[], today: string = todayKey()): OverallStats {
  const totalCheckIns = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const bestStreak = habits.reduce(
    (best, h) => Math.max(best, calcLongestStreak(new Set(h.completedDates))),
    0,
  );
  const doneToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const denom = (days: number) => Math.max(1, habits.length * days);
  return {
    totalHabits: habits.length,
    doneToday,
    totalCheckIns,
    bestStreak,
    weeklyRate:
      habits.length === 0
        ? 0
        : Math.round((countInWindow(habits, 7, today) / denom(7)) * 100),
    completion30d:
      habits.length === 0
        ? 0
        : Math.round((countInWindow(habits, 30, today) / denom(30)) * 100),
  };
}

/** The proof strip: one honest audit line from reducer state. */
export function formatProofStrip(s: OverallStats): string {
  if (s.totalHabits === 0) return "0 habits yet — add your first habit";
  return `${s.totalHabits} habit${s.totalHabits > 1 ? "s" : ""} · ${s.totalCheckIns} check-ins · best streak ${s.bestStreak} day${s.bestStreak === 1 ? "" : "s"} · ${s.weeklyRate}% this week`;
}

/** Datasheet title: name + version + the live numbers that prove it. */
export function formatDatasheetTitle(s: OverallStats): string {
  return `Habit Tracker v2 — ${s.totalHabits} habit${s.totalHabits === 1 ? "" : "s"} · ${s.totalCheckIns} check-ins · best streak ${s.bestStreak}`;
}
