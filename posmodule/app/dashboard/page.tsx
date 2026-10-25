
"use client";

import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import SearchFilter from "@/components/common/SearchFilter";
import DataTable, { type DataColumn } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { STORAGE_KEYS } from "@/lib/constants";
import { useStorageValue } from "@/hooks/useStorage";

type OverviewRestaurant = {
  id: string;
  name: string;
  adminEmail?: string;
  email?: string;
  restaurants?: number;
  branches?: number;
  status: string;
};

type OverviewStaff = { id: string; staffType?: string; status?: string };

const demoBrands: OverviewRestaurant[] = [
  { id: "rest-001", name: "Jamal Kitchen", adminEmail: "jamal@restaurant.com", restaurants: 3, status: "active" },
  { id: "rest-002", name: "Prashant Restaurant", adminEmail: "prashant@restaurant.com", restaurants: 5, status: "active" },
  { id: "rest-003", name: "Jamal Foods", adminEmail: "jamalfoods@restaurant.com", restaurants: 2, status: "active" },
  { id: "rest-004", name: "Prashant Foods", adminEmail: "prashantfoods@restaurant.com", restaurants: 4, status: "inactive" },
];

const demoRestaurants = Array.from({ length: 14 }, (_, index) => ({ id: `demo-restaurant-${index + 1}` }));
const demoStaff: OverviewStaff[] = Array.from({ length: 12 }, (_, index) => ({
  id: `demo-pos-admin-${index + 1}`,
  staffType: "POS Staff",
  status: "Active",
}));

export default function DashboardPage() {
  const [brands] = useStorageValue<OverviewRestaurant[]>(STORAGE_KEYS.restaurants, demoBrands);
  const [restaurants] = useStorageValue<{ id: string }[]>(STORAGE_KEYS.branches, demoRestaurants);
  const [staff] = useStorageValue<OverviewStaff[]>(STORAGE_KEYS.staff, demoStaff);
  const [query, setQuery] = useState("");
  const rows = brands.filter((brand) =>
    `${brand.name} ${brand.adminEmail || brand.email || ""}`.toLowerCase().includes(query.toLowerCase())
  );
  const columns: DataColumn<OverviewRestaurant>[] = [
    { key: "name", label: "Brand", render: (brand) => <span className="font-semibold text-[var(--foreground)]">{brand.name}</span> },
    { key: "email", label: "POS admin email", render: (brand) => <span className="text-[var(--muted)]">{brand.adminEmail || brand.email || "Not assigned"}</span> },
    { key: "restaurants", label: "Restaurants", render: (brand) => <span className="inline-flex min-w-9 justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold">{brand.restaurants ?? brand.branches ?? 0}</span> },
    { key: "status", label: "Status", render: (brand) => <StatusBadge status={brand.status} /> },
  ];
  const stats = [
    { label: "Total POS Admins", value: staff.filter((member) => member.staffType === "POS Staff" && member.status?.toLowerCase() !== "inactive").length, note: "Registered POS admins" },
    { label: "Total Brands", value: brands.length, note: "Created in this workspace" },
    { label: "Total Restaurants", value: restaurants.length, note: "Across all brands" },
    { label: "Active Brands", value: brands.filter((brand) => brand.status.toLowerCase() === "active").length, note: "Currently active" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-7">
        <PageHeader eyebrow="OVERVIEW" title="Dashboard" description="Overview of POS admins, brands and restaurants." />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-6"
            >
              <p className="text-sm text-[var(--muted)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--primary)]">{stat.value}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-admin-card">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div><h2 className="text-base font-semibold">Brand overview</h2><p className="mt-1 text-sm text-[var(--muted)]">Brands and assigned POS admin accounts.</p></div>
            <SearchFilter value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder="Search brand or email" />
          </div>
          <DataTable rows={rows} columns={columns} emptyMessage="No matching brands." />
        </section>
      </div>
    </AdminLayout>
  );
}
