import type { ReactNode } from "react";
import Link from "next/link";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5m0 0 7 7m-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backLabel}
          </Link>
        )}
        {eyebrow && <p className="admin-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="admin-page-title">{title}</h1>
        {description && <p className="admin-page-description">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}
