import { useMemo } from "react";
import {
  addDays,
  calcCurrentStreak,
  calcLongestStreak,
  completionsInLast7Days,
  todayKey,
} from "../lib/dates";
import type { Habit } from "../state/habitsReducer";

interface HabitCardProps {
  habit: Habit;
  selected: boolean;
  onSelect: () => void;
  onToggleToday: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, selected, onSelect, onToggleToday, onDelete }: HabitCardProps) {
  const today = todayKey();
  const completed = useMemo(() => new Set(habit.completedDates), [habit.completedDates]);
  const doneToday = completed.has(today);
  const currentStreak = calcCurrentStreak(completed);
  const longestStreak = calcLongestStreak(completed);
  const thisWeek = completionsInLast7Days(completed);
  const weeklyPct = Math.min(100, Math.round((thisWeek / habit.targetPerWeek) * 100));

  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <article
      className={`habit-card${selected ? " habit-card-selected" : ""}`}
      style={{ borderLeftColor: habit.color }}
      onClick={onSelect}
      aria-label={`Habit: ${habit.name}`}
    >
      <div className="habit-card-top">
        <span className="habit-icon" style={{ background: `${habit.color}1a` }}>
          {habit.icon}
        </span>
        <div className="habit-title">
          <h3>{habit.name}</h3>
          <p>
            Target: {habit.targetPerWeek} day{habit.targetPerWeek > 1 ? "s" : ""} / week
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label={`Delete ${habit.name}`}
          title={`Delete ${habit.name}`}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${habit.name}" and its history?`)) onDelete();
          }}
        >
          ✕
        </button>
      </div>

      <div className="habit-streaks">
        <div className="streak streak-current">
          <span className="streak-number">🔥 {currentStreak}</span>
          <span className="streak-label">day streak</span>
        </div>
        <div className="streak">
          <span className="streak-number">🏆 {longestStreak}</span>
          <span className="streak-label">longest streak</span>
        </div>
        <div className="streak">
          <span className="streak-number">
            {thisWeek}/{habit.targetPerWeek}
          </span>
          <span className="streak-label">this week</span>
        </div>
      </div>

      <div className="progress-track" aria-label={`${weeklyPct}% of weekly target`}>
        <div
          className="progress-fill"
          style={{ width: `${weeklyPct}%`, background: habit.color }}
        />
      </div>

      <div className="habit-week-dots">
        {last7.map((date) => (
          <span
            key={date}
            className={`week-dot${completed.has(date) ? " week-dot-done" : ""}`}
            style={completed.has(date) ? { background: habit.color } : undefined}
            title={`${date}: ${completed.has(date) ? "done" : "not done"}`}
          />
        ))}
        <span className="week-dots-label">last 7 days</span>
      </div>

      <button
        type="button"
        className={`checkin-button${doneToday ? " checkin-button-done" : ""}`}
        style={doneToday ? { background: habit.color, borderColor: habit.color } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggleToday();
        }}
      >
        {doneToday ? "✓ Done today — tap to undo" : "Mark done today"}
      </button>
    </article>
  );
}
