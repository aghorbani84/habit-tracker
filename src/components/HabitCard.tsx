import { useMemo } from "react";
import { habitStats } from "../lib/stats";
import { todayKey } from "../lib/dates";
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
  // All per-habit numbers come from the stats module (pure functions
  // over the check-in log): streaks, 30-day %, weekly rate, 30-day strip.
  const stats = habitStats(habit, today);
  const { currentStreak, bestStreak: longestStreak, completion30d, checkIns } = stats;
  const { thisWeek, weeklyPct } = { thisWeek: stats.thisWeek, weeklyPct: stats.weeklyRate };

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
        <div className="streak">
          <span className="streak-number">{completion30d}%</span>
          <span className="streak-label">last 30 days</span>
        </div>
        <div className="streak">
          <span className="streak-number">{checkIns}</span>
          <span className="streak-label">check-ins</span>
        </div>
      </div>

      <div className="progress-track" aria-label={`${weeklyPct}% of weekly target`}>
        <div
          className="progress-fill"
          style={{ width: `${weeklyPct}%`, background: habit.color }}
        />
      </div>

      <div className="habit-mini-heat" aria-label={`Last 30 days: ${completion30d}% complete`}>
        {stats.last30.map((done, i) => (
          <span
            key={i}
            className={`mini-heat-cell${done ? " mini-heat-cell-done" : ""}`}
            style={done ? { background: habit.color } : undefined}
            title={`${done ? "done" : "not done"} — ${30 - i} day${30 - i === 1 ? "" : "s"} ago`}
          />
        ))}
        <span className="mini-heat-label">last 30 days · {completion30d}%</span>
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
