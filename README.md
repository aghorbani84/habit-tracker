# Habit Tracker

A daily habit tracker with streaks and a GitHub-style calendar heatmap.
Create habits, check in every day, watch your streaks grow, and see your
consistency at a glance. Everything is stored locally in your browser —
no account, no server, no data leaving your machine.

## Features

- **Create and delete habits** — each habit has a custom color, an icon,
  and a target number of days per week (1–7).
- **Daily check-ins** — one tap marks a habit done for today (tap again to
  undo). Click any day in the heatmap to toggle that habit for that date.
- **Streaks** — current streak and longest streak per habit. A streak
  survives a day that hasn't finished yet; it only breaks after a full
  missed day.
- **Calendar heatmap** — hand-rolled SVG, GitHub-style. Month navigation,
  per-habit focus (click a habit card or use the filter pills), and a
  Less → More intensity legend.
- **Weekly completion rate** — per-habit progress toward the weekly target,
  plus overall weekly and 30-day rates on the stats dashboard.
- **Stats dashboard** — active habits, done today, total check-ins, best
  streak, last-30-days and this-week completion rates.
- **Persistence** — habits and history are saved to `localStorage` and
  restored on reload. First run seeds five realistic habits (Read 20
  pages, Morning run, Practice guitar, Drink 2L of water, Meditate
  10 minutes) with a believable history so streaks and the heatmap are
  meaningful immediately.

## Tech used

- **React 19 + TypeScript + Vite**
- **State: `useReducer`** — every habit change (`ADD_HABIT`,
  `DELETE_HABIT`, `TOGGLE_DAY`) is an explicit reducer action in
  `src/state/habitsReducer.ts`.
- **Custom hook: `useLocalStorage`** (`src/hooks/useLocalStorage.ts`) —
  lazy-reads the stored value on first render and writes it back on
  every change, tolerating corrupt or unavailable storage.
- **Hand-rolled SVG heatmap** (`src/components/Heatmap.tsx`) — the
  week-column grid, intensity scale, and month layout are computed in
  `src/lib/dates.ts` (`buildMonthGrid`); no heatmap library is used.
- **Styling: hand-written vanilla CSS** (`src/index.css`) — no CSS
  framework, responsive layout, no build-time CSS tooling.
- **Data: localStorage only** — no API, no keys, no network calls.

## How to run

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

Other commands:

```bash
npm run build            # typecheck (tsc -b) + production build into dist/
npx tsc --noEmit         # typecheck only
node scripts/verify-streaks.ts   # streak + heatmap-grid checks (14 cases)
```

## Project structure

```
src/
  App.tsx                  # wiring: reducer + persistence + layout
  index.css                # all styling (vanilla CSS)
  main.tsx                 # React entry point
  lib/dates.ts             # date keys, streak math, heatmap grid builder
  hooks/useLocalStorage.ts # persistence hook
  state/habitsReducer.ts   # Habit type, reducer, seed data
  components/
    HabitCard.tsx          # habit row: streaks, weekly bar, check-in
    HabitForm.tsx          # create-habit form (icon / color / target)
    Heatmap.tsx            # hand-rolled SVG calendar heatmap
    StatsBar.tsx           # overall stats dashboard
scripts/
  verify-streaks.ts        # node checks for streak + grid logic
```

## How streaks work

Dates are stored as local `yyyy-mm-dd` strings (never UTC
`toISOString`, so a streak can't shift across timezones). The current
streak counts consecutive completed days ending today — or ending
yesterday when today isn't done yet. The longest streak is the longest
unbroken run anywhere in the habit's history. Both are pure functions
in `src/lib/dates.ts` and are covered by `scripts/verify-streaks.ts`.
