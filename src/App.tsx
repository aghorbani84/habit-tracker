import { useEffect, useMemo, useReducer, useState } from "react";
import { Faravahar } from "./components/Faravahar";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { Heatmap } from "./components/Heatmap";
import { StatsBar } from "./components/StatsBar";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import { addDays, calcLongestStreak, todayKey } from "./lib/dates";
import { habitsReducer, seedHabits, type Habit } from "./state/habitsReducer";

const STORAGE_KEY = "habit-tracker:habits-v1";
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

export default function App() {
  // Theme: Achaemenid × Modern, each light × dark. Applied to <html>
  // as data-style / data-mode; the CSS token sheet does the rest.
  const { style, mode, setStyle, toggleMode } = useTheme();

  // Persistence: the custom useLocalStorage hook owns the stored value.
  const [persisted, setPersisted] = useLocalStorage<Habit[]>(STORAGE_KEY, seedHabits);
  // State transitions: all habit changes go through the reducer.
  const [habits, dispatch] = useReducer(habitsReducer, persisted);

  // Keep storage in sync whenever the reducer produces new state.
  useEffect(() => {
    setPersisted(habits);
  }, [habits, setPersisted]);

  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const today = todayKey();
  const selectedHabit =
    selectedHabitId === "all"
      ? undefined
      : habits.find((h) => h.id === selectedHabitId);

  const doneToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalCheckIns = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const bestStreak = habits.reduce(
    (best, h) => Math.max(best, calcLongestStreak(new Set(h.completedDates))),
    0,
  );
  const completionRate30d =
    habits.length === 0
      ? 0
      : Math.round((countInWindow(habits, 30, today) / (habits.length * 30)) * 100);
  const weeklyRate =
    habits.length === 0
      ? 0
      : Math.round((countInWindow(habits, 7, today) / (habits.length * 7)) * 100);

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    const source = selectedHabit ? [selectedHabit] : habits;
    for (const h of source) {
      for (const date of h.completedDates) {
        map.set(date, (map.get(date) ?? 0) + 1);
      }
    }
    return map;
  }, [habits, selectedHabit]);

  const maxCount = selectedHabit ? 1 : Math.max(1, habits.length);
  // "theme" makes the heatmap follow the active theme accent (indigo in
  // Modern, gold in Achaemenid); a selected habit tints it its own color.
  const heatmapColor = selectedHabit ? selectedHabit.color : "theme";

  const shiftMonth = (delta: number) => {
    const date = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  const goToCurrentMonth = () => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-block">
          <p className="app-eyebrow">Daily rituals</p>
          <h1>
            Habit Tracker
            {style === "achaemenid" && <Faravahar />}
          </h1>
          <p className="app-subtitle">
            Small steps, every day. Build streaks you can see.
          </p>
        </div>
        <div className="header-controls">
          <ThemeSwitcher
            style={style}
            mode={mode}
            onStyleChange={setStyle}
            onToggleMode={toggleMode}
          />
          <p className="app-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      <StatsBar
        totalHabits={habits.length}
        doneToday={doneToday}
        totalCheckIns={totalCheckIns}
        bestStreak={bestStreak}
        completionRate30d={completionRate30d}
        weeklyRate={weeklyRate}
      />

      <main className="layout">
        <section className="habits-column">
          <div className="section-heading">
            <h2>Your habits</h2>
            <span className="section-count">
              {doneToday} of {habits.length} done today
            </span>
          </div>

          {habits.length === 0 ? (
            <p className="empty-state">
              No habits yet. Add your first habit below to start your first
              streak.
            </p>
          ) : (
            <div className="habit-list">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  selected={selectedHabitId === habit.id}
                  onSelect={() =>
                    setSelectedHabitId((current) =>
                      current === habit.id ? "all" : habit.id,
                    )
                  }
                  onToggleToday={() =>
                    dispatch({ type: "TOGGLE_DAY", id: habit.id, date: today })
                  }
                  onDelete={() => {
                    dispatch({ type: "DELETE_HABIT", id: habit.id });
                    setSelectedHabitId((current) =>
                      current === habit.id ? "all" : current,
                    );
                  }}
                />
              ))}
            </div>
          )}

          <HabitForm
            onAdd={(habit) => dispatch({ type: "ADD_HABIT", habit })}
          />
        </section>

        <section className="heatmap-column">
          <div className="section-heading">
            <h2>Activity heatmap</h2>
            <div className="month-nav">
              <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
                ‹
              </button>
              <span>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)}>
                ›
              </button>
              <button type="button" className="today-button" onClick={goToCurrentMonth}>
                Today
              </button>
            </div>
          </div>

          <div className="heatmap-filter">
            <button
              type="button"
              className={selectedHabitId === "all" ? "filter-active" : ""}
              onClick={() => setSelectedHabitId("all")}
            >
              All habits
            </button>
            {habits.map((h) => (
              <button
                key={h.id}
                type="button"
                className={selectedHabitId === h.id ? "filter-active" : ""}
                style={
                  selectedHabitId === h.id
                    ? { borderColor: h.color, color: h.color }
                    : undefined
                }
                onClick={() => setSelectedHabitId(h.id)}
              >
                {h.icon} {h.name}
              </button>
            ))}
          </div>

          <Heatmap
            countsByDate={countsByDate}
            maxCount={maxCount}
            year={viewYear}
            month={viewMonth}
            baseColor={heatmapColor}
            onToggleDate={
              selectedHabit
                ? (date) => dispatch({ type: "TOGGLE_DAY", id: selectedHabit.id, date })
                : undefined
            }
            interactiveHint={
              selectedHabit
                ? `Click a day to toggle "${selectedHabit.name}".`
                : "Select a habit above to toggle days."
            }
          />

          <p className="heatmap-note">
            Click a habit card to focus the heatmap on it. Darker squares mean
            more habits completed that day.
          </p>
        </section>
      </main>

      <footer className="app-footer">
        Your data never leaves this browser — habits are stored in localStorage.
      </footer>
    </div>
  );
}
