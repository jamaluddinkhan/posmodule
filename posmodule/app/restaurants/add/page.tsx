
"use client";

import { useEffect, useState } from "react";
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
  code?: string;
  name: string;
  status?: "active" | "inactive";
};

type Branch = {
  id: string;
  code: string;
  name: string;
  restaurantId: string;
  country: string;
  state: string;
  address: string;
  city: string;
  contact: string;
  status: "active" | "inactive";
};

type FieldErrors = Partial<Record<"restaurantId" | "name" | "country" | "state" | "address" | "city" | "contact", string>>;

const RESTAURANT_KEY = "posadmin_restaurants";
const BRANCH_KEY = "posadmin_branches";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--primary)]";
const textareaClass =
  "mt-2 min-h-28 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--primary)]";

const locationOptions = [
  {
    country: "India",
    states: [
      { name: "Maharashtra", cities: ["Mumbai", "Navi Mumbai", "Thane", "Pune", "Panvel", "Nagpur", "Nashik"] },
      { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
      { name: "Delhi", cities: ["New Delhi", "Delhi"] },
      { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangaluru"] },
      { name: "Telangana", cities: ["Hyderabad", "Warangal"] },
      { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"] },
      { name: "West Bengal", cities: ["Kolkata", "Howrah"] },
      { name: "Rajasthan", cities: ["Jaipur", "Udaipur", "Jodhpur"] },
      { name: "Uttar Pradesh", cities: ["Lucknow", "Noida", "Kanpur", "Varanasi"] },
    ],
  },
  {
    country: "United Arab Emirates",
    states: [
      { name: "Dubai", cities: ["Dubai"] },
      { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain"] },
      { name: "Sharjah", cities: ["Sharjah"] },
    ],
  },
  {
    country: "United States",
    states: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Albany"] },
      { name: "Texas", cities: ["Houston", "Austin", "Dallas"] },
    ],
  },
] as const;

function getStateOptions(country: string) {
  return locationOptions.find((item) => item.country === country)?.states ?? [];
}

function getCityOptions(country: string, state: string) {
  return getStateOptions(country).find((item) => item.name === state)?.cities ?? [];
}

export default function AddRestaurantPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
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
      const saved = localStorage.getItem(RESTAURANT_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      const list: Restaurant[] = Array.isArray(parsed)
        ? parsed.filter(
            (item): item is Restaurant =>
              Boolean(
                item &&
                  typeof item.id === "string" &&
                  typeof item.name === "string"
              )
          )
        : [];

      setRestaurants(list);
    } catch {
      setError("Could not load brands. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const branchName = name.trim();
    const branchCountry = country.trim();
    const branchState = region.trim();
    const branchAddress = address.trim();
    const branchCity = city.trim();
    const branchContact = contact.trim();

    const nextErrors: FieldErrors = {};

    if (!restaurantId) nextErrors.restaurantId = "Please select a brand.";
    if (!branchName) nextErrors.name = "Please enter the restaurant name.";
    if (!branchCountry) nextErrors.country = "Please select the country.";
    if (!branchState) nextErrors.state = "Please select the state.";
    if (!branchCity) nextErrors.city = "Please enter the city.";
    if (!branchAddress) nextErrors.address = "Please enter the proper address.";
    if (!branchContact) nextErrors.contact = "Please enter the contact number.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!isValidMobileNumber(branchContact)) {
      setFieldErrors({ contact: "Contact number must be exactly 10 digits." });
      return;
    }

    const selectedRestaurant = restaurants.find(
      (restaurant) => restaurant.id === restaurantId
    );

    if (!selectedRestaurant) {
      setFieldErrors({ restaurantId: "Please select a valid brand." });
      return;
    }

    if (selectedRestaurant.status === "inactive") {
      setFieldErrors({ restaurantId: "This brand is inactive. Select an active brand." });
      return;
    }

    setSaving(true);

    try {
      const savedBranches = localStorage.getItem(BRANCH_KEY);
      const parsedBranches: unknown = savedBranches
        ? JSON.parse(savedBranches)
        : [];

      if (!Array.isArray(parsedBranches)) {
        throw new Error("Invalid restaurant data");
      }

      const existingBranches = parsedBranches as Branch[];

      const nextNumber =
        existingBranches.reduce((max, branch) => {
          const match = String(branch.code || "").match(/^BR-(\d+)$/);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0) + 1;

      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        code: `BR-${String(nextNumber).padStart(3, "0")}`,
        name: branchName,
        restaurantId: selectedRestaurant.id,
        country: branchCountry,
        state: branchState,
        address: branchAddress,
        city: branchCity,
        contact: branchContact,
        status,
      };

      localStorage.setItem(
        BRANCH_KEY,
        JSON.stringify([...existingBranches, newBranch])
      );

      // Update the displayed restaurant count for its parent brand.
      const savedRestaurants = localStorage.getItem(RESTAURANT_KEY);
      const currentRestaurants: Restaurant[] = savedRestaurants
        ? JSON.parse(savedRestaurants)
        : [];

      const updatedRestaurants = currentRestaurants.map((restaurant) => {
        if (restaurant.id !== selectedRestaurant.id) return restaurant;

        const branchCount = existingBranches.filter(
          (branch) => branch.restaurantId === selectedRestaurant.id
        ).length;

        return {
          ...restaurant,
          branches: branchCount + 1,
        };
      });

      localStorage.setItem(
        RESTAURANT_KEY,
        JSON.stringify(updatedRestaurants)
      );

      router.push("/restaurants");
    } catch {
      setError("Restaurant could not be saved. Please try again.");
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <ModuleTabs module="restaurants" />

      <main className="p-5 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Add Restaurant</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Create a restaurant and link it to a brand.
          </p>
        </div>

        <section className="max-w-4xl rounded-xl border border-[var(--border)] bg-white p-5 md:p-8">
          {loading ? (
            <p className="py-6 text-sm text-[var(--muted)]">
              Loading brands...
            </p>
          ) : (
            <form noValidate onSubmit={handleSubmit}>
              {restaurants.length === 0 && (
                <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Create a brand first before adding a restaurant.
                  <Link
                    href="/brands/add"
                    className="ml-1 font-semibold underline"
                  >
                    Add Brand
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium">
                  Brand <span className="text-red-500">*</span>
                  <Dropdown
                    className={`${inputClass} ${fieldErrors.restaurantId ? "border-red-500 focus:border-red-500" : ""}`}
                    value={restaurantId}
                    onChange={(event) => {
                      setRestaurantId(event.target.value);
                      setFieldErrors((current) => ({ ...current, restaurantId: undefined }));
                    }}
                    required
                    error={Boolean(fieldErrors.restaurantId)}
                    aria-describedby={fieldErrors.restaurantId ? "restaurant-brand-error" : undefined}
                  >
                    <option value="">Select brand</option>
                    {restaurants
                      .filter((restaurant) => restaurant.status !== "inactive")
                      .map((restaurant) => (
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
                  Restaurant Name <span className="text-red-500">*</span>
                  <input
                    className={`${inputClass} ${fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}`}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setFieldErrors((current) => ({ ...current, name: undefined }));
                    }}
                    placeholder="e.g. Vashi Restaurant"
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
                  Country <span className="text-red-500">*</span>
                  <Dropdown
                    className={`${inputClass} ${fieldErrors.country ? "border-red-500 focus:border-red-500" : ""}`}
                    value={country}
                    onChange={(event) => {
                      setCountry(event.target.value);
                      setRegion("");
                      setCity("");
                      setFieldErrors((current) => ({ ...current, country: undefined, state: undefined, city: undefined }));
                    }}
                    required
                    error={Boolean(fieldErrors.country)}
                    aria-describedby={fieldErrors.country ? "restaurant-country-error" : undefined}
                  >
                    <option value="">Select country</option>
                    {locationOptions.map((item) => (
                      <option key={item.country} value={item.country}>
                        {item.country}
                      </option>
                    ))}
                  </Dropdown>
                  {fieldErrors.country && (
                    <span id="restaurant-country-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.country}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  State <span className="text-red-500">*</span>
                  <Dropdown
                    className={`${inputClass} ${fieldErrors.state ? "border-red-500 focus:border-red-500" : ""}`}
                    value={region}
                    onChange={(event) => {
                      setRegion(event.target.value);
                      setCity("");
                      setFieldErrors((current) => ({ ...current, state: undefined, city: undefined }));
                    }}
                    disabled={!country}
                    required
                    error={Boolean(fieldErrors.state)}
                    aria-describedby={fieldErrors.state ? "restaurant-state-error" : undefined}
                  >
                    <option value="">Select state</option>
                    {getStateOptions(country).map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </Dropdown>
                  {fieldErrors.state && (
                    <span id="restaurant-state-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.state}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium">
                  City <span className="text-red-500">*</span>
                  <Dropdown
                    className={`${inputClass} ${fieldErrors.city ? "border-red-500 focus:border-red-500" : ""}`}
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      setFieldErrors((current) => ({ ...current, city: undefined }));
                    }}
                    disabled={!region}
                    required
                    error={Boolean(fieldErrors.city)}
                    aria-describedby={fieldErrors.city ? "restaurant-city-error" : undefined}
                  >
                    <option value="">Select city</option>
                    {getCityOptions(country, region).map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </Dropdown>
                  {fieldErrors.city && (
                    <span id="restaurant-city-error" role="alert" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.city}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium md:col-span-2">
                  Proper Address <span className="text-red-500">*</span>
                  <textarea
                    className={`${textareaClass} ${fieldErrors.address ? "border-red-500 focus:border-red-500" : ""}`}
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      setFieldErrors((current) => ({ ...current, address: undefined }));
                    }}
                    placeholder="Shop number, building, street, landmark, area"
                    maxLength={300}
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
                  Contact Number <span className="text-red-500">*</span>
                  <input
                    className={`${inputClass} ${fieldErrors.contact ? "border-red-500 focus:border-red-500" : ""}`}
                    value={contact}
                    onChange={(event) => {
                      setContact(normalizeMobileNumber(event.target.value));
                      setFieldErrors((current) => ({ ...current, contact: undefined }));
                    }}
                    placeholder="Enter contact number"
                    type="tel"
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

              <div className="mt-8 flex justify-end gap-3 border-t border-[var(--border)] pt-5">
                <Link
                  href="/restaurants"
                  className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm hover:bg-gray-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || restaurants.length === 0}
                  className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create Restaurant"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}
