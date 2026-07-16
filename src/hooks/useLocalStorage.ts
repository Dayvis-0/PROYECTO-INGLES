import { useState, useCallback } from "react";

/**
 * useLocalStorage — generic hook that syncs React state with localStorage.
 * Reads the stored value on mount and writes on every update.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // quota exceeded or storage unavailable — silently fail
        }
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
