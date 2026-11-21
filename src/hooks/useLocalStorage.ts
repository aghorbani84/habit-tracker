import { useEffect, useState } from "react";

/**
 * useLocalStorage — persists a state value to localStorage under `key`.
 * Reads lazily on first render (so the stored value is the initial state),
 * writes on every change, and tolerates corrupt or missing storage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // Corrupt storage: fall through to the initial value.
    }
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full / unavailable: keep the in-memory value.
    }
  }, [key, value]);

  return [value, setValue];
}
