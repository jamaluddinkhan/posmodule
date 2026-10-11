"use client";

import { CURRENT_USER_KEY, isDemoLoggedIn } from "@/lib/auth";
import { useStorageValue } from "@/hooks/useStorage";
import type { CurrentUser } from "@/types/auth";

export function useAuth() {
  const [user] = useStorageValue<CurrentUser | null>(CURRENT_USER_KEY, null);

  return { user, isAuthenticated: Boolean(user) && isDemoLoggedIn() };
}
