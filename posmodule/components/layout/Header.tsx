
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CURRENT_USER_KEY, logoutDemoUser } from "@/lib/auth";
import { useStorageValue } from "@/hooks/useStorage";
import type { CurrentUser } from "@/types/auth";
import { readStorage } from "@/lib/storage";
import Dropdown from "@/components/ui/Dropdown";
import { ChevronDown, LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Master Admin",
  "/brands": "Brands",
  "/brands/add": "Add Brand",
  "/menu": "Menu Management",
  "/menu/add": "Add Menu Item",
  "/menu/categories": "Menu Categories",
  "/menu/categories/add": "Add Menu Category",
  "/restaurants": "Restaurants",
  "/restaurants/add": "Add Restaurant",
  "/staff": "Staff",
  "/orders": "Orders",
  "/tables": "Tables & QR",
  "/website-settings": "Website Settings",
  "/settings": "Settings",
  "/settings/general": "General Settings",
  "/settings/payment": "Payment Settings",
  "/tables/qr": "Table QR Codes",
  "/theme": "Theme",
};

type Restaurant = {
  id: string;
  name: string;
  code?: string;
  status?: string;
  websiteUrl?: string;
};

type Branch = {
  id: string;
  name: string;
  code?: string;
  restaurantId: string;
  status?: string;
  websiteUrl?: string;
};

type HeaderProps = {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
};

export default function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser] = useStorageValue<CurrentUser | null>(CURRENT_USER_KEY, null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const storedUserName = currentUser?.name || currentUser?.email?.split("@")[0] || "Jamaluddin Khan";
  const userName = storedUserName === "POS Admin" ? "Jamaluddin Khan" : storedUserName;
  const userRole =
    currentUser?.id === "demo-pos-admin" && currentUser.role === "POS Manager"
      ? "Master Admin"
      : currentUser?.role || "Master Admin";
  const userEmail = currentUser?.email || "Email unavailable";
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [emulationOpen, setEmulationOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"restaurantId" | "branchId", string>>>({});

  const availableBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          branch.restaurantId === restaurantId &&
          branch.status !== "inactive"
      ),
    [branches, restaurantId]
  );

  function openEmulation() {
    setRestaurants(readStorage("posadmin_restaurants", []));
    setBranches(readStorage("posadmin_branches", []));
    setRestaurantId("");
    setBranchId("");
    setError("");
    setFieldErrors({});
    setProfileOpen(false);
    setEmulationOpen(true);
  }

  function handleRestaurantChange(id: string) {
    setRestaurantId(id);
    setBranchId("");
    setError("");
    setFieldErrors((current) => ({ ...current, restaurantId: undefined, branchId: undefined }));
  }

  function handleOpenWebsite() {
    const restaurant = restaurants.find(
      (item) => item.id === restaurantId
    );
    const branch = branches.find((item) => item.id === branchId);
    setFieldErrors({});

    if (!restaurantId || !branchId) {
      setError("");
      setFieldErrors({
        restaurantId: !restaurantId ? "Please select a brand." : undefined,
        branchId: !branchId ? "Please select a restaurant." : undefined,
      });
      return;
    }

    if (!restaurant || !branch) {
      setError("");
      setFieldErrors({
        restaurantId: !restaurant ? "Please select a valid brand." : undefined,
        branchId: !branch ? "Please select a valid restaurant." : undefined,
      });
      return;
    }

    const websiteUrl = branch.websiteUrl || restaurant.websiteUrl;

    if (!websiteUrl) {
      setError(
        "Website URL is not configured yet. Website preview will work after the restaurant website is connected."
      );
      return;
    }

    try {
      const url = new URL(websiteUrl);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        setError("Please configure a valid website URL.");
        return;
      }

      window.open(url.toString(), "_blank", "noopener,noreferrer");
      setEmulationOpen(false);
    } catch {
      setError("Please configure a valid website URL.");
    }
  }

  function handleLogout() {
    logoutDemoUser();
    localStorage.removeItem("posadmin_demo_user");
    router.replace("/login");
  }

  return (
    <>
      <header className={`relative z-30 flex h-[68px] items-center justify-between border-b border-[var(--border)] bg-white px-3 transition-[margin] duration-200 sm:h-[76px] sm:px-5 lg:px-7 ${sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"}`}>
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H21M3 12H21M3 18H21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="hidden text-[10px] font-bold tracking-[0.18em] text-[var(--primary)] sm:block">
              ADMINISTRATION
            </p>
            <h1 className="truncate text-base font-bold text-[var(--primary)] sm:text-lg">
              {pageTitles[pathname] ?? (
                pathname.startsWith("/brands/")
                  ? "Brand Details"
                  : pathname.startsWith("/restaurants/")
                    ? "Restaurant Details"
                    : "POS Admin"
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={openEmulation}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M8 21H16M12 17V21"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">Emulate Website</span>
            <span className="sm:hidden">Emulate</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-label="User profile"
              className={`flex min-h-14 items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition-colors sm:min-w-[246px] sm:pr-3 ${profileOpen ? "border-[var(--border)] bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                {userInitials || "A"}
              </span>
              <span className="hidden min-w-0 flex-1 truncate text-sm leading-5 text-[var(--muted)] sm:block">
                {userEmail}
              </span>
              <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[240px] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-admin-menu sm:w-[246px]">
                <div className="px-5 py-4">
                  <p className="truncate text-base font-semibold text-[var(--foreground)]">{userName}</p>
                  <p className="mt-1 truncate text-sm text-[var(--muted)]">{userRole}</p>
                </div>
                <div className="border-t border-[var(--border)] p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                  Sign out
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {emulationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEmulationOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="emulation-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="emulation-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  Emulate Website
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a brand and restaurant to preview its website.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close emulation"
                onClick={() => setEmulationOpen(false)}
                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="emulate-brand"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Brand
                </label>
                <Dropdown
                  id="emulate-brand"
                  value={restaurantId}
                  onChange={(event) =>
                    handleRestaurantChange(event.target.value)
                  }
                  error={Boolean(fieldErrors.restaurantId)}
                  aria-describedby={fieldErrors.restaurantId ? "emulate-brand-error" : undefined}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-3 ${fieldErrors.restaurantId ? "border-red-500 focus:border-red-500" : ""}`}
                >
                  <option value="">Select brand</option>
                  {restaurants
                    .filter((item) => item.status !== "inactive")
                    .map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                        {restaurant.code ? ` (${restaurant.code})` : ""}
                      </option>
                    ))}
                </Dropdown>
                {fieldErrors.restaurantId && (
                  <p id="emulate-brand-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.restaurantId}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="emulate-restaurant"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Restaurant
                </label>
                <Dropdown
                  id="emulate-restaurant"
                  value={branchId}
                  onChange={(event) => {
                    setBranchId(event.target.value);
                    setError("");
                    setFieldErrors((current) => ({ ...current, branchId: undefined }));
                  }}
                  disabled={!restaurantId}
                  error={Boolean(fieldErrors.branchId)}
                  aria-describedby={fieldErrors.branchId ? "emulate-restaurant-error" : undefined}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-3 disabled:bg-gray-100 ${fieldErrors.branchId ? "border-red-500 focus:border-red-500" : ""}`}
                >
                  <option value="">Select restaurant</option>
                  {availableBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                      {branch.code ? ` (${branch.code})` : ""}
                    </option>
                  ))}
                </Dropdown>
                {fieldErrors.branchId && (
                  <p id="emulate-restaurant-error" role="alert" className="mt-1 text-xs text-red-600">
                    {fieldErrors.branchId}
                  </p>
                )}

                {restaurantId && availableBranches.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No active restaurants found for this brand.
                  </p>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEmulationOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOpenWebsite}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:opacity-90"
                >
                  Open Website
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
