import { Landmark, Moon, Sparkles, Sun } from "lucide-react";
import type { ThemeMode, ThemeStyle } from "../hooks/useTheme";

interface ThemeSwitcherProps {
  style: ThemeStyle;
  mode: ThemeMode;
  onStyleChange: (style: ThemeStyle) => void;
  onToggleMode: () => void;
}

/**
 * ThemeSwitcher — the two always-visible header controls from the shared
 * theme spec: a segmented Achaemenid | Modern style control (icon + text
 * label) and a light/dark mode toggle.
 */
export function ThemeSwitcher({
  style,
  mode,
  onStyleChange,
  onToggleMode,
}: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      <div className="style-segmented" role="group" aria-label="Visual style">
        <button
          type="button"
          className="segmented-button"
          aria-pressed={style === "achaemenid"}
          onClick={() => onStyleChange("achaemenid")}
        >
          <Landmark size={15} aria-hidden="true" />
          Achaemenid
        </button>
        <button
          type="button"
          className="segmented-button"
          aria-pressed={style === "modern"}
          onClick={() => onStyleChange("modern")}
        >
          <Sparkles size={15} aria-hidden="true" />
          Modern
        </button>
      </div>
      <button
        type="button"
        className="mode-toggle"
        aria-label="Toggle dark mode"
        aria-pressed={mode === "dark"}
        onClick={onToggleMode}
      >
        {mode === "dark" ? (
          <Sun size={17} aria-hidden="true" />
        ) : (
          <Moon size={17} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
