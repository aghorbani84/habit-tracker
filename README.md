# Habit Tracker

**Build daily habits, keep your streaks, and see your consistency on a calendar heatmap.**

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f)](https://aghorbani84.github.io/habit-tracker/)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
[![GitHub stars](https://img.shields.io/github/stars/aghorbani84/habit-tracker?style=flat)](https://github.com/aghorbani84/habit-tracker/stargazers)

**Live demo:** https://aghorbani84.github.io/habit-tracker/

## Overview

Habit Tracker is a single-page React app for daily check-ins. Create habits, mark them done, and watch
your streaks and a GitHub-style heatmap fill in. Everything is stored in your browser's `localStorage`:
no account, no server, no network calls.

## Features

- **Habits** with a name, icon, color, and a weekly target of 1–7 days; create and delete them at any time.
- **Daily check-ins**: one tap marks today done (tap again to undo); click any heatmap day to toggle that date.
- **Streaks**: current and longest streak per habit. Today doesn't break a streak until the day is over.
- **Calendar heatmap**: hand-rolled SVG with month navigation, per-habit focus, and an intensity legend.
- **Stats**: active habits, done today, total check-ins, best streak, weekly and 30-day completion rates.
- **Themes**: Achaemenid and Modern styles, each in light and dark, switchable from the header.
- **Local persistence** with sample habits seeded on first run, so the heatmap is meaningful immediately.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8 |
| State | `useReducer` (`ADD_HABIT`, `DELETE_HABIT`, `TOGGLE_DAY`, `RESET_ALL`) |
| Styling | Hand-written CSS, no framework |
| Icons | lucide-react |
| Lint | oxlint |
| Deploy | GitHub Actions → GitHub Pages |

## Getting started

Requires Node.js 20 or newer and npm.

```bash
git clone https://github.com/aghorbani84/habit-tracker.git
cd habit-tracker
npm install
npm run dev        # http://localhost:5173/habit-tracker/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |
| `node scripts/verify-streaks.ts` | Run the streak and heatmap-grid checks (needs a Node version that runs TypeScript files directly) |

## Project structure

```
src/
  App.tsx                 app shell: reducer, persistence, layout
  components/             HabitCard, HabitForm, Heatmap, StatsBar, ThemeSwitcher
  hooks/                  useLocalStorage, useTheme
  lib/                    dates.ts (streak math, heatmap grid), stats.ts
  state/habitsReducer.ts  Habit type, reducer, seed data
scripts/verify-streaks.ts streak and grid checks
.github/workflows/        GitHub Pages deploy
```

Dates are stored as local `yyyy-mm-dd` keys rather than UTC strings, so streaks don't shift across time zones.

## Author

Built by [Abolfazl Ghorbani](https://github.com/aghorbani84).
