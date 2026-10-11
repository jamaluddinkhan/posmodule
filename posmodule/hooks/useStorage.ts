"use client";

import { useSyncExternalStore } from "react";
import {
  readStorage,
  readStorageSnapshot,
  subscribeStorage,
  writeStorage,
} from "@/lib/storage";

export function useStorageValue<T>(
  key: string,
  fallback: T
): [T, (next: T | ((current: T) => T)) => void] {
  const fallbackSnapshot = JSON.stringify(fallback);
  const snapshot = useSyncExternalStore(
    (notify) => subscribeStorage(key, notify),
    () => readStorageSnapshot(key, fallbackSnapshot),
    () => fallbackSnapshot
  );

  let value = fallback;
  try {
    value = JSON.parse(snapshot) as T;
  } catch {
    value = fallback;
  }

  function setValue(next: T | ((current: T) => T)) {
    const current = readStorage(key, fallback);
    writeStorage(key, typeof next === "function"
      ? (next as (current: T) => T)(current)
      : next);
  }

  return [value, setValue];
}
