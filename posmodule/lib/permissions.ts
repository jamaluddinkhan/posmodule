import type { Permission, Role } from "@/types/role";

export function hasPermission(
  role: Role | null | undefined,
  module: string,
  action: keyof Omit<Permission, "module" | "subModule">
): boolean {
  return Boolean(
    role?.permissions.some(
      (permission) =>
        permission.module === module && permission[action]
    )
  );
}
