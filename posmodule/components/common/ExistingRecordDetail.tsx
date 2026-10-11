"use client";

import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { STORAGE_KEYS } from "@/lib/constants";
import { useStorageValue } from "@/hooks/useStorage";

type ExistingRecord = { id: string; name?: string; status?: string; [key: string]: string | number | boolean | undefined };

export default function ExistingRecordDetail({
  module,
  id,
}: {
  module: "brands" | "restaurants";
  id: string;
}) {
  const key = module === "brands" ? STORAGE_KEYS.restaurants : STORAGE_KEYS.branches;
  const title = module === "brands" ? "Brand" : "Restaurant";
  const [records] = useStorageValue<ExistingRecord[]>(key, []);
  const record = records.find((item) => item.id === id);

  return (
    <AdminLayout>
      {record ? <div className="space-y-6">
        <PageHeader eyebrow={title.toUpperCase()} title={record.name || title} description={`${title} profile and operational details.`} action={<Link href={`/${module}/${id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white">Edit {title.toLowerCase()}</Link>} />
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-7">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(record).filter(([field]) => field !== "id").map(([field, value]) => {
              const label = module === "brands" && field === "branches"
                ? "Restaurants"
                : module === "restaurants" && field === "restaurantId"
                  ? "Brand ID"
                  : field.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim();

              return <div key={field} className="min-w-0 border-b border-[var(--border)] pb-4"><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-2 break-words text-sm font-medium">{field === "status" ? <StatusBadge status={String(value)} /> : String(value ?? "-")}</dd></div>;
            })}
          </dl>
        </section>
      </div> : <EmptyState title={`${title} not found`} description="Open the list to choose an available record." action={<Link href={`/${module}`} className="text-sm font-semibold text-[var(--primary)]">Back to {module}</Link>} />}
    </AdminLayout>
  );
}
