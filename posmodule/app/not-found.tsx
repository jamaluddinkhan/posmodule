import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-5 text-center">
      <p className="admin-eyebrow">404 · NOT FOUND</p>
      <h1 className="mt-3 text-3xl font-bold">This page isn&apos;t available</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">The link may be incorrect, or the page may have moved.</p>
      <Link href="/dashboard" className="mt-6 inline-flex min-h-10 items-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white">Go to dashboard</Link>
    </main>
  );
}
