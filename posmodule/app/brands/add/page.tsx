
"use client";

import { useState } from "react";
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

export default function AddBrandPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNameError("");

    const restaurantName = name.trim();

    if (!restaurantName) {
      setNameError("Please enter the brand name.");
      return;
    }

    setSaving(true);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const restaurants: Restaurant[] = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(restaurants)) {
        throw new Error("Invalid brand data");
      }

      const nextNumber =
        restaurants.reduce((max, restaurant) => {
          const match = String(restaurant.code || "").match(/^RST-(\d+)$/);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0) + 1;

      const newRestaurant: Restaurant = {
        id: `rest-${Date.now()}`,
        code: `RST-${String(nextNumber).padStart(3, "0")}`,
        name: restaurantName,
        city: "",
        branches: 0,
        status,
        registeredOn: new Date().toISOString().slice(0, 10),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...restaurants, newRestaurant])
      );

      router.push("/brands");
    } catch {
      setError("Brand could not be saved. Please try again.");
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <ModuleTabs module="brands" />

      <main className="p-5 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Add Brand</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Create a brand for your business.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="max-w-4xl rounded-xl border border-[var(--border)] bg-white p-5 md:p-8"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Brand Name <span className="text-red-500">*</span>
              <input
                className={`${inputClass} ${nameError ? "border-red-500 focus:border-red-500" : ""}`}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                }}
                placeholder="Enter brand name"
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
            </label>

            <label className="block text-sm font-medium">
              Status
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
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[var(--border)] pt-5">
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
              {saving ? "Saving..." : "Create Brand"}
            </button>
          </div>
        </form>
      </main>
    </AdminLayout>
  );
}
