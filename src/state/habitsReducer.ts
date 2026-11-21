import { todayKey } from "../lib/dates";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  /** Target completions per week (1–7). */
  targetPerWeek: number;
  /** Dates completed, as local `yyyy-mm-dd` strings. */
  completedDates: string[];
  createdAt: string;
}

export type HabitAction =
  | { type: "ADD_HABIT"; habit: Omit<Habit, "id" | "completedDates" | "createdAt"> }
  | { type: "DELETE_HABIT"; id: string }
  | { type: "TOGGLE_DAY"; id: string; date: string }
  | { type: "RESET_ALL" };

export function habitsReducer(state: Habit[], action: HabitAction): Habit[] {
  switch (action.type) {
    case "ADD_HABIT": {
      const habit: Habit = {
        ...action.habit,
        id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        completedDates: [],
        createdAt: todayKey(),
      };
      return [...state, habit];
    }
    case "DELETE_HABIT":
      return state.filter((h) => h.id !== action.id);
    case "TOGGLE_DAY":
      return state.map((h) => {
        if (h.id !== action.id) return h;
        const done = h.completedDates.includes(action.date);
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter((d) => d !== action.date)
            : [...h.completedDates, action.date].sort(),
        };
      });
    case "RESET_ALL":
      return [];
    default:
      return state;
  }
}

export const HABIT_COLORS = [
  "#16a34a",
  "#2563eb",
  "#db2777",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
] as const;

export const HABIT_ICONS = [
  "📖",
  "🏃",
  "🎸",
  "💧",
  "🧘",
  "💪",
  "✍️",
  "🎨",
  "💤",
  "🥗",
  "🧠",
  "🚭",
] as const;

/** Realistic starter habits, seeded with a believable history so the
 *  streaks and heatmap are meaningful on first load. Dates are generated
 *  relative to today so the seed never goes stale. */
export function seedHabits(): Habit[] {
  const today = new Date();
  const key = (daysAgo: number): string => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  };
  // Runs of consecutive days-ago, e.g. range(0, 6) = today .. 6 days ago.
  const range = (from: number, to: number): string[] => {
    const out: string[] = [];
    for (let i = from; i <= to; i++) out.push(key(i));
    return out;
  };
  const base = (id: string, name: string, icon: string, color: string, targetPerWeek: number) => ({
    id,
    name,
    icon,
    color,
    targetPerWeek,
    createdAt: key(30),
  });

  return [
    {
      ...base("seed-read", "Read 20 pages", "📖", "#2563eb", 5),
      completedDates: [...range(0, 4), ...range(6, 9), ...range(11, 13), key(15), key(17), key(19), key(21)],
    },
    {
      ...base("seed-run", "Morning run", "🏃", "#16a34a", 3),
      completedDates: [...range(0, 2), key(4), ...range(6, 7), key(9), key(11), key(14), key(16), key(18)],
    },
    {
      ...base("seed-guitar", "Practice guitar", "🎸", "#db2777", 4),
      completedDates: [key(0), key(1), key(3), key(5), ...range(7, 8), key(10), key(12), key(15), key(20)],
    },
    {
      ...base("seed-water", "Drink 2L of water", "💧", "#0891b2", 7),
      completedDates: [...range(0, 11), key(13), key(14), key(16), key(18), key(20)],
    },
    {
      ...base("seed-meditate", "Meditate 10 minutes", "🧘", "#7c3aed", 7),
      completedDates: [...range(0, 2), key(4), key(5), key(7), key(9), key(11), key(13), key(15)],
    },
  ];
}
