import { useMemo } from "react";
import { buildMonthGrid, daysInMonth, todayKey } from "../lib/dates";

interface HeatmapProps {
  /** yyyy-mm-dd -> number of habits completed that day. */
  countsByDate: ReadonlyMap<string, number>;
  /** Max completions on any single day, for the intensity scale. */
  maxCount: number;
  year: number;
  month: number; // 0-based
  baseColor: string;
  onToggleDate?: (date: string) => void;
  interactiveHint?: string;
}

const CELL = 15;
const GAP = 3;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** 5-step intensity scale: empty -> base color at increasing opacity. */
function cellFill(count: number, max: number, base: string): string {
  if (count <= 0) return "#ebedf0";
  const [r, g, b] = hexToRgb(base);
  const intensity = Math.min(1, count / Math.max(1, max));
  const alpha = 0.25 + 0.75 * intensity;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

/** Hand-rolled GitHub-style SVG heatmap — no heatmap library. */
export function Heatmap({
  countsByDate,
  maxCount,
  year,
  month,
  baseColor,
  onToggleDate,
  interactiveHint,
}: HeatmapProps) {
  const weeks = useMemo(
    () => buildMonthGrid(year, month, countsByDate),
    [year, month, countsByDate],
  );

  const width = 26 + weeks.length * (CELL + GAP);
  const height = 26 + 7 * (CELL + GAP);
  const today = todayKey();

  return (
    <div className="heatmap-wrap">
      <svg
        className="heatmap"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Habit activity heatmap for ${MONTH_NAMES[month]} ${year}`}
      >
        {DAY_LABELS.map((label, i) =>
          i % 2 === 1 ? (
            <text key={label} x={0} y={26 + i * (CELL + GAP) + 11} className="heatmap-label">
              {label}
            </text>
          ) : null,
        )}
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            const x = 26 + wi * (CELL + GAP);
            const y = 26 + di * (CELL + GAP);
            const isToday = cell.key === today;
            return (
              <g key={cell.key}>
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={3}
                  fill={cell.inMonth ? cellFill(cell.count, maxCount, baseColor) : "transparent"}
                  stroke={isToday ? "#111827" : "none"}
                  strokeWidth={isToday ? 1.5 : 0}
                  className={cell.inMonth && onToggleDate ? "heatmap-cell-clickable" : undefined}
                  onClick={
                    cell.inMonth && onToggleDate
                      ? () => onToggleDate(cell.key)
                      : undefined
                  }
                >
                  <title>
                    {cell.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {": "}
                    {cell.count === 0
                      ? "no habits completed"
                      : `${cell.count} habit${cell.count > 1 ? "s" : ""} completed`}
                  </title>
                </rect>
              </g>
            );
          }),
        )}
      </svg>
      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="heatmap-legend-cell"
            style={{
              background:
                level === 0 ? "#ebedf0" : cellFill(level, 4, baseColor),
            }}
          />
        ))}
        <span>More</span>
        {interactiveHint && <span className="heatmap-hint">{interactiveHint}</span>}
      </div>
      <p className="heatmap-caption">
        {daysInMonth(year, month)} days in {MONTH_NAMES[month]} {year}
      </p>
    </div>
  );
}
