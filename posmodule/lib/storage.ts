const STORAGE_EVENT = "posadmin:storage-change";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : (JSON.parse(saved) as T);
  } catch {
    return fallback;
  }
}

export function readStorageSnapshot(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  } catch {
    // Storage can be unavailable in private browsing or quota-limited contexts.
  }
}

export function subscribeStorage(key: string, notify: () => void): () => void {
  const handleCustom = (event: Event) => {
    const changedKey = (event as CustomEvent<{ key?: string }>).detail?.key;
    if (!changedKey || changedKey === key) notify();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) notify();
  };

  window.addEventListener(STORAGE_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}
