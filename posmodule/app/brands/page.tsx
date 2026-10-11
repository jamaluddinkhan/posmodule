
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import ModuleTabs from "@/components/layout/ModuleTabs";
import Dropdown from "@/components/ui/Dropdown";

type Restaurant = {
  id: string;
  code: string;
  name: string;
  city: string;
  branches: number;
  status: "active" | "inactive";
  registeredOn: string;
};

type Filters = {
  name: string;
  code: string;
  city: string;
  status: string;
};

const STORAGE_KEY = "posadmin_restaurants";

const demoRestaurants: Restaurant[] = [
  { id: "rest-001", code: "RST-001", name: "The Taj Kitchen", city: "Navi Mumbai", branches: 2, status: "active", registeredOn: "2026-01-05" },
  { id: "rest-002", code: "RST-002", name: "Urban Tadka", city: "Mumbai", branches: 3, status: "active", registeredOn: "2026-01-12" },
  { id: "rest-003", code: "RST-003", name: "Spice Route", city: "Thane", branches: 1, status: "inactive", registeredOn: "2026-02-02" },
  { id: "rest-004", code: "RST-004", name: "Cafe Meadow", city: "Navi Mumbai", branches: 2, status: "active", registeredOn: "2026-02-14" },
  { id: "rest-005", code: "RST-005", name: "Royal Biryani House", city: "Pune", branches: 4, status: "active", registeredOn: "2026-02-20" },
  { id: "rest-006", code: "RST-006", name: "Green Bowl", city: "Mumbai", branches: 1, status: "inactive", registeredOn: "2026-03-01" },
  { id: "rest-007", code: "RST-007", name: "Saffron Table", city: "Thane", branches: 2, status: "active", registeredOn: "2026-03-08" },
  { id: "rest-008", code: "RST-008", name: "Coastal Curry", city: "Panvel", branches: 1, status: "active", registeredOn: "2026-03-16" },
  { id: "rest-009", code: "RST-009", name: "Daily Dosa", city: "Mumbai", branches: 2, status: "active", registeredOn: "2026-03-25" },
  { id: "rest-010", code: "RST-010", name: "Olive Garden Cafe", city: "Pune", branches: 1, status: "inactive", registeredOn: "2026-04-04" },
  { id: "rest-011", code: "RST-011", name: "Bombay Grill", city: "Mumbai", branches: 3, status: "active", registeredOn: "2026-04-10" },
  { id: "rest-012", code: "RST-012", name: "Masala Junction", city: "Navi Mumbai", branches: 2, status: "active", registeredOn: "2026-04-18" },
];

const emptyFilters: Filters = {
  name: "",
  code: "",
  city: "",
  status: "",
};

const inputClass =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]";

function normalizeRestaurant(value: unknown, index: number): Restaurant {
  const item =
    value && typeof value === "object"
      ? (value as Partial<Restaurant>)
      : {};

  return {
    id: String(item.id || `rest-${String(index + 1).padStart(3, "0")}`),
    code: String(item.code || `RST-${String(index + 1).padStart(3, "0")}`),
    name: String(item.name || "Unnamed Restaurant"),
    city: String(item.city || ""),
    branches: Number.isFinite(Number(item.branches))
      ? Number(item.branches)
      : 0,
    status: item.status === "inactive" ? "inactive" : "active",
    registeredOn: String(
      item.registeredOn || new Date().toISOString().slice(0, 10)
    ),
  };
}

export default function BrandsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openAction, setOpenAction] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved === null) {
        setRestaurants(demoRestaurants);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRestaurants));
      } else {
        const parsed: unknown = JSON.parse(saved);
        const normalized = Array.isArray(parsed)
          ? parsed.map(normalizeRestaurant)
          : demoRestaurants;

        setRestaurants(normalized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch {
      setRestaurants(demoRestaurants);
    } finally {
      setLoaded(true);
    }
  }, []);

  function saveRestaurants(updated: Restaurant[]) {
    setRestaurants(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Keep the current list visible if browser storage is unavailable.
    }
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearch("");
    setPage(1);
  }

  function applyFilters() {
    setAppliedFilters({
      name: filters.name.trim().toLowerCase(),
      code: filters.code.trim().toLowerCase(),
      city: filters.city,
      status: filters.status,
    });
    setPage(1);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const name = (restaurant.name || "").toLowerCase();
      const code = (restaurant.code || "").toLowerCase();
      const city = (restaurant.city || "").toLowerCase();
      const status = restaurant.status || "active";

      return (
        name.includes(appliedFilters.name) &&
        code.includes(appliedFilters.code) &&
        (!appliedFilters.city || restaurant.city === appliedFilters.city) &&
        (!appliedFilters.status || status === appliedFilters.status) &&
        (!query || [name, code, city, status].some((value) => value.includes(query)))
      );
    });
  }, [restaurants, appliedFilters, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filtered.length);
  const pageRows = filtered.slice(start - 1, end);
  const cities = [
    ...new Set(restaurants.map((restaurant) => restaurant.city).filter(Boolean)),
  ].sort();

  function toggleStatus(restaurant: Restaurant) {
    saveRestaurants(
      restaurants.map((item) =>
        item.id === restaurant.id
          ? {
              ...item,
              status: item.status === "active" ? "inactive" : "active",
            }
          : item
      )
    );

    setOpenAction(null);
  }

  return (
    <AdminLayout>
      <ModuleTabs module="brands" />

      <main className="space-y-6 p-5 md:p-8">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 md:p-7">
          <h2 className="mb-6 text-2xl font-semibold">View Brands</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">
                Brand Name
              </span>
              <input
                className={inputClass}
                placeholder="Search name"
                value={filters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">
                Brand Code
              </span>
              <input
                className={inputClass}
                placeholder="Enter code"
                value={filters.code}
                onChange={(e) => updateFilter("code", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">
                Status
              </span>
              <Dropdown
                className={inputClass}
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Dropdown>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">
                City
              </span>
              <Dropdown
                className={inputClass}
                value={filters.city}
                onChange={(e) => updateFilter("city", e.target.value)}
              >
                <option value="">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Dropdown>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-b border-[var(--border)] pb-6">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Search
            </button>
          </div>

          <div className="flex justify-end pt-5">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search brands..."
              aria-label="Search brands"
              className={`${inputClass} max-w-xs`}
            />
          </div>
        </section>

        <section className="overflow-visible rounded-xl border border-[var(--border)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--primary)] text-white">
                <tr>
                  <th className="px-5 py-4 font-medium">Brand Name</th>
                  <th className="px-5 py-4 font-medium">Brand Code</th>
                  <th className="px-5 py-4 font-medium">City</th>
                  <th className="px-5 py-4 font-medium">Restaurants</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {loaded &&
                  pageRows.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium">{restaurant.name}</td>
                      <td className="px-5 py-4 text-[var(--muted)]">{restaurant.code}</td>
                      <td className="px-5 py-4">{restaurant.city || "—"}</td>
                      <td className="px-5 py-4">{restaurant.branches}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md px-3 py-1.5 text-xs font-medium ${
                            restaurant.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {restaurant.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="relative px-5 py-4 text-right">
                        <button
                          type="button"
                          aria-label={`Actions for ${restaurant.name}`}
                          aria-expanded={openAction === restaurant.id}
                          onClick={() =>
                            setOpenAction(
                              openAction === restaurant.id ? null : restaurant.id
                            )
                          }
                          className="rounded-lg px-3 py-1.5 text-lg hover:bg-gray-100"
                        >
                          •••
                        </button>

                        {openAction === restaurant.id && (
                          <div className="absolute right-6 top-12 z-20 w-36 rounded-lg border border-[var(--border)] bg-white p-1 text-left shadow-lg">
                            <Link
                              href={`/brands/${restaurant.id}/edit`}
                              onClick={() => setOpenAction(null)}
                              className="block rounded-md px-3 py-2 hover:bg-gray-50"
                            >
                              View / Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleStatus(restaurant)}
                              className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50"
                            >
                              {restaurant.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                {loaded && pageRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[var(--muted)]"
                    >
                      No brands match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4">
            <p className="text-sm text-[var(--muted)]">
              Showing {start} to {end} of {filtered.length} results
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
              >
                «
              </button>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
              >
                ‹
              </button>

              <span className="px-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
              >
                ›
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
              >
                »
              </button>

              <Dropdown
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
                className="h-10 rounded-lg border border-[var(--border)] bg-white px-2 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </Dropdown>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}
