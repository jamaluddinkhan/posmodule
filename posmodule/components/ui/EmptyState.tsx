import type { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty-state flex flex-col items-center gap-2">
      <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="max-w-md text-sm">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
