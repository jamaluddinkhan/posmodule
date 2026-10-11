export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-[var(--muted)]" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--primary)]" />
      {label}
    </div>
  );
}
