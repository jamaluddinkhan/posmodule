
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import ModuleTabs from "@/components/layout/ModuleTabs";
import Dropdown from "@/components/ui/Dropdown";
import {
  isValidMobileNumber,
  normalizeMobileNumber,
} from "@/lib/validation";

type Restaurant = {
  id: string;
  name: string;
  code?: string;
  status?: "active" | "inactive";
};

type Branch = {
  id: string;
  code: string;
  name: string;
  restaurantId: string;
  address: string;
  city: string;
  contact: string;
  status: "active" | "inactive";
};

type FieldErrors = Partial<Record<"restaurantId" | "name" | "address" | "city" | "contact", string>>;

const BRANCH_KEY = "posadmin_branches";
const RESTAURANT_KEY = "posadmin_restaurants";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]";

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    try {
      const savedBranches = localStorage.getItem(BRANCH_KEY);
      const savedRestaurants = localStorage.getItem(RESTAURANT_KEY);

      const branchList: Branch[] = savedBranches
        ? JSON.parse(savedBranches)
        : [];
      const restaurantList: Restaurant[] = savedRestaurants
        ? JSON.parse(savedRestaurants)
        : [];

      const selected = branchList.find((item) => item.id === id);

      setRestaurants(restaurantList);

      if (!selected) {
        setError("Restaurant not found.");
        return;
      }

      setBranch(selected);
      setName(selected.name || "");
      setRestaurantId(selected.restaurantId || "");
      setAddress(selected.address || "");
      setCity(selected.city || "");
      setContact(selected.contact || "");
      setStatus(selected.status === "inactive" ? "inactive" : "active");
    } catch {
      setError("Could not load restaurant details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!branch) return;

    const nextErrors: FieldErrors = {};

    if (!name.trim()) nextErrors.name = "Please enter the restaurant name.";
    if (!restaurantId) nextErrors.restaurantId = "Please select a brand.";
    if (!address.trim()) nextErrors.address = "Please enter the restaurant address.";
    if (!city.trim()) nextErrors.city = "Please enter the city.";
    if (!contact.trim()) nextErrors.contact = "Please enter the contact number.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!isValidMobileNumber(contact)) {
      setFieldErrors({ contact: "Contact number must be exactly 10 digits." });
      return;
    }

    const selectedRestaurant = restaurants.find(
      (item) => item.id === restaurantId
    );

    if (!selectedRestaurant) {
      setFieldErrors({ restaurantId: "Please select a valid brand." });
      return;
    }

    if (selectedRestaurant.status === "inactive" && restaurantId !== branch.restaurantId) {
      setFieldErrors({ restaurantId: "You cannot assign a restaurant to an inactive brand." });
      return;
    }

    setSaving(true);

    try {
      const savedBranches = localStorage.getItem(BRANCH_KEY);
      const branchList: Branch[] = savedBranches
        ? JSON.parse(savedBranches)
        : [];

      const updatedBranches = branchList.map((item) =>
        item.id === branch.id
          ? {
              ...item,
              name: name.trim(),
              restaurantId,
              address: address.trim(),
              city: city.trim(),
              contact: contact.trim(),
              status,
            }
          : item
      );

      localStorage.setItem(BRANCH_KEY, JSON.stringify(updatedBranches));

      const savedRestaurants = localStorage.getItem(RESTAURANT_KEY);
      const restaurantList: Restaurant[] = savedRestaurants
        ? JSON.parse(savedRestaurants)
        : [];

      const updatedRestaurants = restaurantList.map((restaurant) => {
        const count = updatedBranches.filter(
          (item) => item.restaurantId === restaurant.id
        ).length;

        return { ...restaurant, branches: count };
      });

      localStorage.setItem(
        RESTAURANT_KEY,
        JSON.stringify(updatedRestaurants)
      );

      router.push("/restaurants");
    } catch {
      setError("Changes could not be saved. Please try again.");
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <ModuleTabs module="restaurants" />

      <main className="p-5 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">View / Edit Restaurant</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Update restaurant details and its parent brand.
          </p>
        </div>

        <section className="max-w-4xl rounded-xl border border-[var(--border)] bg-white p-5 md:p-8">
          {loading ? (
            <p className="py-6 text-sm text-[var(--muted)]">
              Loading restaurant details...
            </p>
          ) : !branch ? (
            <div>
              <p className="text-sm text-red-600">
                {error || "Restaurant not found."}
              </p>
              <Link
                href="/restaurants"
                className="mt-5 inline-block text-sm text-[var(--primary)]"
              >
                Back to Restaurants
              </Link>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium">
                  Restaurant Code
                  <input
                    className={`${inputClass} bg-gray-50 text-gray-500`}
                    value={branch.code}
                    readOnly
                  />
                </label>

                <label className="block text-sm font-medium">
                  Restaurant Name <span className="text-red-500">*</span>
                  <input
                    className={`${inputClass} ${fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFieldErrors((current) => ({ ...current, name: undefined }));
                    }}
                    maxLength={100}
                    required
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "restaurant-name-error" : undefined}
                  />
                  {fieldErrors.name && (
                    <span id="restaurant-name-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.name}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  Brand <span className="text-red-500">*</span>
                  <Dropdown
                    className={`${inputClass} ${fieldErrors.restaurantId ? "border-red-500 focus:border-red-500" : ""}`}
                    value={restaurantId}
                    onChange={(e) => {
                      setRestaurantId(e.target.value);
                      setFieldErrors((current) => ({ ...current, restaurantId: undefined }));
                    }}
                    required
                    error={Boolean(fieldErrors.restaurantId)}
                    aria-describedby={fieldErrors.restaurantId ? "restaurant-brand-error" : undefined}
                  >
                    <option value="">Select brand</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                        {restaurant.code ? ` (${restaurant.code})` : ""}
                      </option>
                    ))}
                  </Dropdown>
                  {fieldErrors.restaurantId && (
                    <span id="restaurant-brand-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.restaurantId}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  Address <span className="text-red-500">*</span>
                  <input
                    className={`${inputClass} ${fieldErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setFieldErrors((current) => ({ ...current, address: undefined }));
                    }}
                    maxLength={200}
                    required
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? "restaurant-address-error" : undefined}
                  />
                  {fieldErrors.address && (
                    <span id="restaurant-address-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.address}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  City <span className="text-red-500">*</span>
                  <input
                    className={`${inputClass} ${fieldErrors.city ? "border-red-500 focus:border-red-500" : ""}`}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setFieldErrors((current) => ({ ...current, city: undefined }));
                    }}
                    maxLength={80}
                    required
                    aria-invalid={Boolean(fieldErrors.city)}
                    aria-describedby={fieldErrors.city ? "restaurant-city-error" : undefined}
                  />
                  {fieldErrors.city && (
                    <span id="restaurant-city-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.city}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  Contact Number <span className="text-red-500">*</span>
                  <input
                    className={`${inputClass} ${fieldErrors.contact ? "border-red-500 focus:border-red-500" : ""}`}
                    type="tel"
                    value={contact}
                    onChange={(e) => {
                      setContact(normalizeMobileNumber(e.target.value));
                      setFieldErrors((current) => ({ ...current, contact: undefined }));
                    }}
                    inputMode="numeric"
                    maxLength={10}
                    required
                    aria-invalid={Boolean(fieldErrors.contact)}
                    aria-describedby={fieldErrors.contact ? "restaurant-contact-error" : undefined}
                  />
                  {fieldErrors.contact && (
                    <span id="restaurant-contact-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.contact}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  Status
                  <Dropdown
                    className={inputClass}
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "active" | "inactive")
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

              <div className="mt-8 flex justify-end gap-3 border-t border-[var(--border)] pt-5">
                <Link
                  href="/restaurants"
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
