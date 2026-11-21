/**
 * Verification script for the streak + heatmap-grid logic.
 * Run: `node scripts/verify-streaks.ts` (Node 24 strips types natively).
 * Imports the real functions from src/lib/dates.ts — no duplicated logic.
 */
import {
  buildMonthGrid,
  calcCurrentStreak,
  calcLongestStreak,
  completionsInLast7Days,
} from "../src/lib/dates.ts";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown): void {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${actual}, expected ${expected}`);
}

const S = (dates: string[]) => new Set(dates);

// --- Current streak ---
// 5 consecutive days ending today.
check(
  "current streak, 5 days ending today",
  calcCurrentStreak(S(["2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21"]), "2026-11-21"),
  5,
);
// Today missing, yesterday done: streak survives (day not over).
check(
  "current streak, today missing, 3 days to yesterday",
  calcCurrentStreak(S(["2026-11-18", "2026-11-19", "2026-11-20"]), "2026-11-21"),
  3,
);
// Gap yesterday: streak is 0 even with older history.
check(
  "current streak, broken yesterday",
  calcCurrentStreak(S(["2026-11-18", "2026-11-19"]), "2026-11-21"),
  0,
);
// Empty history.
check("current streak, empty", calcCurrentStreak(S([]), "2026-11-21"), 0);
// Single day, today.
check("current streak, only today", calcCurrentStreak(S(["2026-11-21"]), "2026-11-21"), 1);

// --- Longest streak ---
check(
  "longest streak, best run is 4 of 3 runs",
  calcLongestStreak(
    S(["2026-11-01", "2026-11-02", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-10"]),
  ),
  4,
);
check("longest streak, empty", calcLongestStreak(S([])), 0);
check(
  "longest streak, month boundary run (Oct 30 – Nov 2)",
  calcLongestStreak(S(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"])),
  4,
);

// --- Last-7-days count ---
check(
  "last 7 days count",
  completionsInLast7Days(S(["2026-11-15", "2026-11-17", "2026-11-20", "2026-11-21", "2026-11-10"]), "2026-11-21"),
  4,
);

// --- Heatmap grid ---
const now = new Date();
const weeks = buildMonthGrid(now.getFullYear(), now.getMonth(), new Map());
const inMonth = weeks.flat().filter((c) => c.inMonth).length;
const expectedDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
check("heatmap cells in current month", inMonth, expectedDays);
check("heatmap grid is whole weeks", weeks.flat().length % 7, 0);
check("heatmap first cell is a Sunday", weeks[0][0].date.getDay(), 0);

// November 2026: 30 days, starts on a Sunday -> exactly 5 weeks, no padding.
const nov = buildMonthGrid(2026, 10, new Map());
check("Nov 2026 weeks", nov.length, 5);
check("Nov 2026 in-month cells", nov.flat().filter((c) => c.inMonth).length, 30);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll streak + heatmap checks passed.");
