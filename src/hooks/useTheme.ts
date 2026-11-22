import { useEffect, useState } from "react";

export type ThemeStyle = "achaemenid" | "modern";
export type ThemeMode = "light" | "dark";

export const STYLE_KEY = "showcase-style";
export const MODE_KEY = "showcase-mode";

function readStyle(): ThemeStyle {
  try {
    const raw = window.localStorage.getItem(STYLE_KEY);
    if (raw === "achaemenid" || raw === "modern") return raw;
  } catch {
    // Storage unavailable: fall through to the default.
  }
  return "modern";
}

function readMode(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(MODE_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    // Storage unavailable: fall through to the media query.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * useTheme — owns the showcase theme. The `<html>` element carries
 * `data-style` + `data-mode`; the CSS token sheet in index.css maps those
 * attributes to the four combinations. Persisted under `showcase-style`
 * and `showcase-mode`. The pre-paint script in index.html applies the
 * same values before first paint, so this hook only keeps them in sync.
 */
export function useTheme() {
  const [style, setStyle] = useState<ThemeStyle>(readStyle);
  const [mode, setMode] = useState<ThemeMode>(readMode);

  useEffect(() => {
    document.documentElement.dataset.style = style;
    try {
      window.localStorage.setItem(STYLE_KEY, style);
    } catch {
      // Storage unavailable: the in-memory value still applies.
    }
  }, [style]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
      // Storage unavailable: the in-memory value still applies.
    }
  }, [mode]);

  return {
    style,
    mode,
    setStyle,
    setMode,
    toggleMode: () => setMode((m) => (m === "dark" ? "light" : "dark")),
  };
}
