"use client";

import { useMemo } from "react";
import { CURRENT_USER_KEY } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { STORAGE_KEYS } from "@/lib/constants";
import { useStorageValue } from "@/hooks/useStorage";
import type { CurrentUser } from "@/types/auth";
import type { Role } from "@/types/role";

export function usePermissions() {
  const [user] = useStorageValue<CurrentUser | null>(CURRENT_USER_KEY, null);
  const [roles] = useStorageValue<Role[]>(STORAGE_KEYS.roles, []);
  const role = useMemo(
    () => roles.find((item) => item.name === user?.role && item.staffType === user?.staffType),
    [roles, user]
  );

  return {
    role,
    can: (module: string, action: "view" | "add" | "edit" | "delete" | "export") =>
      hasPermission(role, module, action),
  };
}
