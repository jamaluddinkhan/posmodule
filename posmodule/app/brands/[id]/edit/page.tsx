
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const STORAGE_KEY = "posadmin_restaurants";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]";

export default function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const restaurants: Restaurant[] = saved ? JSON.parse(saved) : [];
      const selected = restaurants.find((item) => item.id === id);

      if (!selected) {
        setError("Brand not found.");
        return;
      }

      setRestaurant(selected);
      setName(selected.name || "");
      setCity(selected.city || "");
      setStatus(selected.status === "inactive" ? "inactive" : "active");
    } catch {
      setError("Could not load brand details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restaurant) return;

    if (!name.trim()) {
      setError("");
      setNameError("Please enter the brand name.");
      return;
    }

    setSaving(true);
    setError("");
    setNameError("");

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const restaurants: Restaurant[] = saved ? JSON.parse(saved) : [];

      const updated = restaurants.map((item) =>
        item.id === restaurant.id
          ? {
              ...item,
              name: name.trim(),
              city: city.trim(),
              status,
            }
          : item
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      router.push("/brands");
    } catch {
      setError("Changes could not be saved. Please try again.");
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <ModuleTabs module="brands" />

      <main className="p-5 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">View / Edit Brand</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            View brand details or update its information.
          </p>
        </div>

        <section className="max-w-4xl rounded-xl border border-[var(--border)] bg-white p-5 md:p-8">
          {loading ? (
            <p className="py-8 text-sm text-[var(--muted)]">
              Loading restaurant details...
            </p>
          ) : !restaurant ? (
            <div>
              <p className="text-sm text-red-600">
                {error || "Brand not found."}
              </p>
              <Link
                href="/brands"
                className="mt-5 inline-block text-sm text-[var(--primary)]"
              >
                Back to Brands
              </Link>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit}>
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">
                    Brand Code
                  </label>
                  <input
                    className={`${inputClass} bg-gray-50 text-gray-500`}
                    value={restaurant.code}
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`${inputClass} ${nameError ? "border-red-500 focus:border-red-500" : ""}`}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setNameError("");
                    }}
                    maxLength={100}
                    required
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? "brand-name-error" : undefined}
                  />
                  {nameError && (
                    <span id="brand-name-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {nameError}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    City
                  </label>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    maxLength={80}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Dropdown
                    className={inputClass}
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as "active" | "inactive")
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Dropdown>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Restaurants
                  </label>
                  <input
                    className={`${inputClass} bg-gray-50 text-gray-500`}
                    value={restaurant.branches}
                    readOnly
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Restaurant count is managed through Restaurants.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Registration Date
                  </label>
                  <input
                    className={`${inputClass} bg-gray-50 text-gray-500`}
                    value={restaurant.registeredOn || "—"}
                    readOnly
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
                <Link
                  href="/brands"
                  className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}
