
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import ModuleTabs from "@/components/layout/ModuleTabs";
import Dropdown from "@/components/ui/Dropdown";

type Restaurant = {
  id: string;
  code?: string;
  name: string;
  city?: string;
  status?: "active" | "inactive";
};

type Branch = {
  id: string;
  code: string;
  name: string;
  restaurantId: string;
  country?: string;
  state?: string;
  address: string;
  city: string;
  contact: string;
  status: "active" | "inactive";
};

const RESTAURANT_KEY = "posadmin_restaurants";
const BRANCH_KEY = "posadmin_branches";

const demoRestaurants: Restaurant[] = [
  { id: "rest-001", code: "RST-001", name: "The Taj Kitchen", city: "Navi Mumbai", status: "active" },
  { id: "rest-002", code: "RST-002", name: "Urban Tadka", city: "Mumbai", status: "active" },
  { id: "rest-003", code: "RST-003", name: "Spice Route", city: "Thane", status: "active" },
];

const demoBranches: Branch[] = [
  { id: "br-001", code: "BR-001", name: "Vashi Branch", restaurantId: "rest-001", address: "Sector 17, Vashi", city: "Navi Mumbai", contact: "9876543210", status: "active" },
  { id: "br-002", code: "BR-002", name: "Belapur Branch", restaurantId: "rest-001", address: "CBD Belapur", city: "Navi Mumbai", contact: "9876543211", status: "active" },
  { id: "br-003", code: "BR-003", name: "Andheri Branch", restaurantId: "rest-002", address: "Andheri West", city: "Mumbai", contact: "9876543212", status: "active" },
  { id: "br-004", code: "BR-004", name: "Thane Central", restaurantId: "rest-003", address: "Thane West", city: "Thane", contact: "9876543213", status: "inactive" },
];

const inputClass =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]";

export default function RestaurantsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    restaurantId: "",
    city: "",
    status: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openAction, setOpenAction] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedRestaurants = localStorage.getItem(RESTAURANT_KEY);
      const parsedRestaurants: unknown = savedRestaurants
        ? JSON.parse(savedRestaurants)
        : null;

      const restaurantList: Restaurant[] = Array.isArray(parsedRestaurants)
        ? parsedRestaurants
            .filter((item) => item && typeof item.id === "string")
            .map((item) => ({
              ...item,
              name: String(item.name || "Unnamed Restaurant"),
            }))
        : demoRestaurants;

      if (savedRestaurants === null || !Array.isArray(parsedRestaurants)) {
        localStorage.setItem(RESTAURANT_KEY, JSON.stringify(demoRestaurants));
      }

      const savedBranches = localStorage.getItem(BRANCH_KEY);
      const parsedBranches: unknown = savedBranches
        ? JSON.parse(savedBranches)
        : null;

      const branchList: Branch[] = Array.isArray(parsedBranches)
        ? parsedBranches
            .filter(
              (item) =>
                item &&
                typeof item === "object" &&
                typeof item.id === "string"
            )
            .map((item: Partial<Branch>) => ({
              id: String(item.id),
              code: String(item.code || "BR-000"),
              name: String(item.name || "Unnamed Branch"),
              restaurantId: String(item.restaurantId || ""),
              country: String(item.country || ""),
              state: String(item.state || ""),
              address: String(item.address || ""),
              city: String(item.city || ""),
              contact: String(item.contact || ""),
              status: item.status === "inactive" ? "inactive" : "active",
            }))
        : demoBranches;

      if (savedBranches === null || !Array.isArray(parsedBranches)) {
        localStorage.setItem(BRANCH_KEY, JSON.stringify(demoBranches));
      }

      setRestaurants(restaurantList);
      setBranches(branchList);
    } catch {
      setRestaurants(demoRestaurants);
      setBranches(demoBranches);
    } finally {
      setLoaded(true);
    }
  }, []);

  function saveBranches(updated: Branch[]) {
    setBranches(updated);

    try {
      localStorage.setItem(BRANCH_KEY, JSON.stringify(updated));
    } catch {
      // Keep the current list visible if browser storage is unavailable.
    }
  }

  const cities = [...new Set(branches.map((branch) => branch.city).filter(Boolean))].sort();

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return branches.filter((branch) => {
      const restaurant = restaurants.find(
        (item) => item.id === branch.restaurantId
      );
      const branchName = branch.name.toLowerCase();
      const branchCode = branch.code.toLowerCase();
      const restaurantName = (restaurant?.name || "").toLowerCase();
      const city = branch.city.toLowerCase();
      const state = (branch.state || "").toLowerCase();
      const country = (branch.country || "").toLowerCase();

      return (
        branchName.includes(appliedFilters.name.trim().toLowerCase()) &&
        (!appliedFilters.restaurantId ||
          branch.restaurantId === appliedFilters.restaurantId) &&
        (!appliedFilters.city || branch.city === appliedFilters.city) &&
        (!appliedFilters.status || branch.status === appliedFilters.status) &&
        (!query ||
          [branchName, branchCode, restaurantName, city, state, country].some((value) =>
            value.includes(query)
          ))
      );
    });
  }, [branches, restaurants, appliedFilters, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = filteredBranches.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, filteredBranches.length);
  const pageRows = filteredBranches.slice(start - 1, end);

  function resetFilters() {
    const empty = { name: "", restaurantId: "", city: "", status: "" };
    setFilters(empty);
    setAppliedFilters(empty);
    setSearch("");
    setPage(1);
  }

  function toggleStatus(branch: Branch) {
    saveBranches(
      branches.map((item) =>
        item.id === branch.id
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
      <ModuleTabs module="restaurants" />

      <main className="space-y-6 p-5 md:p-8">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">View Restaurants</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Manage restaurant locations and their parent brands.
              </p>
            </div>

            <Link
              href="/restaurants/add"
              className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-medium !text-white hover:opacity-90"
            >
              + Add Restaurant
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-xs text-[var(--muted)]">
              Restaurant Name
              <input
                className={`${inputClass} mt-2`}
                placeholder="Search restaurant"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
            </label>

            <label className="block text-xs text-[var(--muted)]">
              Brand
              <Dropdown
                className={`${inputClass} mt-2`}
                value={filters.restaurantId}
                onChange={(e) =>
                  setFilters({ ...filters, restaurantId: e.target.value })
                }
              >
                <option value="">All brands</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </Dropdown>
            </label>

            <label className="block text-xs text-[var(--muted)]">
              City
              <Dropdown
                className={`${inputClass} mt-2`}
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value })
                }
              >
                <option value="">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Dropdown>
            </label>

            <label className="block text-xs text-[var(--muted)]">
              Status
              <Dropdown
                className={`${inputClass} mt-2`}
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              onClick={() => {
                setAppliedFilters({ ...filters });
                setPage(1);
              }}
              className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white"
            >
              Search
            </button>
          </div>

          <div className="flex justify-end pt-5">
            <input
              className={`${inputClass} max-w-xs`}
              placeholder="Search restaurants..."
              aria-label="Search restaurants"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </section>

        <section className="overflow-visible rounded-xl border border-[var(--border)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-[var(--primary)] text-white">
                <tr>
                  <th className="px-5 py-4 font-medium">Restaurant Name</th>
                  <th className="px-5 py-4 font-medium">Restaurant Code</th>
                  <th className="px-5 py-4 font-medium">Brand</th>
                  <th className="px-5 py-4 font-medium">City</th>
                  <th className="px-5 py-4 font-medium">Contact</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {loaded &&
                  pageRows.map((branch) => {
                    const restaurant = restaurants.find(
                      (item) => item.id === branch.restaurantId
                    );

                    return (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium">{branch.name}</td>
                        <td className="px-5 py-4 text-[var(--muted)]">{branch.code}</td>
                        <td className="px-5 py-4">
                          <div>{restaurant?.name || "Brand not found"}</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            {restaurant?.code || ""}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>{branch.city || "—"}</div>
                          {(branch.state || branch.country) && (
                            <div className="mt-1 text-xs text-[var(--muted)]">
                              {[branch.state, branch.country].filter(Boolean).join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">{branch.contact || "—"}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md px-3 py-1.5 text-xs font-medium ${
                              branch.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {branch.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="relative px-5 py-4 text-right">
                          <button
                            type="button"
                            aria-label={`Actions for ${branch.name}`}
                            aria-expanded={openAction === branch.id}
                            onClick={() =>
                              setOpenAction(
                                openAction === branch.id ? null : branch.id
                              )
                            }
                            className="rounded-lg px-3 py-1.5 text-lg hover:bg-gray-100"
                          >
                            •••
                          </button>

                          {openAction === branch.id && (
                            <div className="absolute right-6 top-12 z-20 w-36 rounded-lg border border-[var(--border)] bg-white p-1 text-left shadow-lg">
                              <Link
                                href={`/restaurants/${branch.id}/edit`}
                                onClick={() => setOpenAction(null)}
                                className="block rounded-md px-3 py-2 hover:bg-gray-50"
                              >
                                View / Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => toggleStatus(branch)}
                                className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50"
                              >
                                {branch.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                {loaded && pageRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-[var(--muted)]"
                    >
                      No restaurants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4">
            <p className="text-sm text-[var(--muted)]">
              Showing {start} to {end} of {filteredBranches.length} results
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
