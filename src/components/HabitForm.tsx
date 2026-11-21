import { useState } from "react";
import { HABIT_COLORS, HABIT_ICONS } from "../state/habitsReducer";

interface HabitFormProps {
  onAdd: (habit: {
    name: string;
    icon: string;
    color: string;
    targetPerWeek: number;
  }) => void;
}

export function HabitForm({ onAdd }: HabitFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(HABIT_ICONS[0]);
  const [color, setColor] = useState<string>(HABIT_COLORS[0]);
  const [targetPerWeek, setTargetPerWeek] = useState(5);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Give the habit a name (at least 2 characters).");
      return;
    }
    onAdd({ name: trimmed, icon, color, targetPerWeek });
    setName("");
    setIcon(HABIT_ICONS[0]);
    setColor(HABIT_COLORS[0]);
    setTargetPerWeek(5);
    setError("");
  };

  return (
    <form className="habit-form" onSubmit={submit}>
      <h2>Add a new habit</h2>
      <label className="field">
        <span>Habit name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read 20 pages"
          maxLength={60}
        />
      </label>

      <fieldset className="field">
        <legend>Icon</legend>
        <div className="picker-row">
          {HABIT_ICONS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`picker-button${icon === candidate ? " picker-button-active" : ""}`}
              aria-pressed={icon === candidate}
              onClick={() => setIcon(candidate)}
            >
              {candidate}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Color</legend>
        <div className="picker-row">
          {HABIT_COLORS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`color-swatch${color === candidate ? " color-swatch-active" : ""}`}
              style={{ background: candidate }}
              aria-label={`Color ${candidate}`}
              aria-pressed={color === candidate}
              onClick={() => setColor(candidate)}
            />
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Target: {targetPerWeek} day{targetPerWeek > 1 ? "s" : ""} per week</span>
        <input
          type="range"
          min={1}
          max={7}
          value={targetPerWeek}
          onChange={(e) => setTargetPerWeek(Number(e.target.value))}
        />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="primary-button">Add habit</button>
    </form>
  );
}
