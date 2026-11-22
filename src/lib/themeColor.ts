import { useEffect, useState } from "react";

/**
 * useCssVar — reads one CSS custom property off `<html>` and re-reads it
 * whenever the theme attributes change, so SVG/canvas colors derived from
 * tokens follow the active theme combo without a reload.
 */
export function useCssVar(name: string, fallback: string): string {
  const read = () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  };

  const [value, setValue] = useState<string>(read);

  useEffect(() => {
    const update = () => setValue(read());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-style", "data-mode"],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return value;
}
