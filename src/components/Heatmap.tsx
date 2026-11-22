import { useMemo } from "react";
import { buildMonthGrid, daysInMonth, todayKey } from "../lib/dates";
import { useCssVar } from "../lib/themeColor";

interface HeatmapProps {
  /** yyyy-mm-dd -> number of habits completed that day. */
  countsByDate: ReadonlyMap<string, number>;
  /** Max completions on any single day, for the intensity scale. */
  maxCount: number;
  year: number;
  month: number; // 0-based
  /** Base color for filled cells — a hex habit color, or "theme" to
   *  follow the active theme's `--accent` token. */
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

/** 5-step intensity scale: empty -> base color at increasing opacity.
 *  The empty cell reads the `--heat-empty` token so it follows the theme;
 *  filled cells tint the resolved base color. */
function cellFill(count: number, max: number, base: string): string {
  if (count <= 0) return "var(--heat-empty)";
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

  // The heatmap's base color follows the active theme: when the caller
  // passes "theme", resolve the semantic `--accent` token (re-read live
  // via MutationObserver whenever data-style / data-mode changes, so a
  // theme switch recolors every cell with no reload). A selected habit
  // still tints the heatmap with its own color.
  const themeAccent = useCssVar("--accent", "#4F46E5");
  const resolvedBase = baseColor === "theme" ? themeAccent : baseColor;

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
                  style={{
                    fill: cell.inMonth
                      ? cellFill(cell.count, maxCount, resolvedBase)
                      : "transparent",
                    stroke: isToday ? "var(--text)" : "none",
                  }}
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
                level === 0 ? "var(--heat-empty)" : cellFill(level, 4, resolvedBase),
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
