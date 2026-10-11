
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import Dropdown from "@/components/ui/Dropdown";
import {
  isValidEmail,
  isValidMobileNumber,
  normalizeMobileNumber,
} from "@/lib/validation";

type Role = {
  id: string;
  name: string;
  staffType: "POS Staff" | "User Staff";
};

type Branch = {
  id: string;
  name: string;
  code?: string;
  status?: string;
};

type Staff = {
  id: string;
  code: string;
  name: string;
  staffType: "POS Staff" | "User Staff";
  role: string;
  branchId: string;
  email: string;
  contact: string;
  status: "active" | "inactive";
};

type FieldErrors = Partial<Record<"name" | "role" | "branchId" | "email" | "contact", string>>;

export default function AddPOSStaffPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [branchId, setBranchId] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    try {
      const savedRoles = localStorage.getItem("posadmin_roles");
      const savedBranches = localStorage.getItem("posadmin_branches");

      const parsedRoles: unknown = savedRoles
        ? JSON.parse(savedRoles)
        : [];
      const parsedBranches: unknown = savedBranches
        ? JSON.parse(savedBranches)
        : [];

      setRoles(
        Array.isArray(parsedRoles)
          ? parsedRoles.filter(
              (item): item is Role =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                item.staffType === "POS Staff"
            )
          : []
      );

      setBranches(
        Array.isArray(parsedBranches)
          ? parsedBranches.filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                (!item.status ||
                  String(item.status).toLowerCase() === "active")
            )
          : []
      );
    } catch (err) {
      console.error("Unable to load form data:", err);
      setError("Unable to load roles or restaurants. Refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedContact = contact.trim();

    const nextErrors: FieldErrors = {};

    if (!trimmedName) nextErrors.name = "Please enter the staff name.";
    if (!role) nextErrors.role = "Please select a POS Staff role.";
    if (!branchId) nextErrors.branchId = "Please select a restaurant.";
    if (!normalizedEmail) nextErrors.email = "Please enter the email address.";
    if (!trimmedContact) nextErrors.contact = "Please enter the contact number.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldErrors({ email: "Enter a valid email address." });
      return;
    }

    if (!isValidMobileNumber(trimmedContact)) {
      setFieldErrors({ contact: "Contact number must be exactly 10 digits." });
      return;
    }

    if (!roles.some((item) => item.name === role)) {
      setFieldErrors({ role: "Please select a valid POS Staff role." });
      return;
    }

    if (!branches.some((item) => item.id === branchId)) {
      setFieldErrors({ branchId: "Please select a valid active restaurant." });
      return;
    }

    setSaving(true);

    try {
      const savedStaff = localStorage.getItem("posadmin_staff");
      const parsedStaff: unknown = savedStaff ? JSON.parse(savedStaff) : [];

      if (!Array.isArray(parsedStaff)) {
        setError("Staff data is invalid. Refresh and try again.");
        return;
      }

      const currentStaff = parsedStaff as Staff[];

      if (
        currentStaff.some(
          (person) =>
            person.email?.trim().toLowerCase() === normalizedEmail
        )
      ) {
        setFieldErrors({ email: "This email is already assigned to a staff member." });
        return;
      }

      const nextNumber =
        currentStaff.reduce((max, person) => {
          const match = person.code?.match(/^STF-(\d+)$/);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0) + 1;

      const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        code: `STF-${String(nextNumber).padStart(3, "0")}`,
        name: trimmedName,
        staffType: "POS Staff",
        role,
        branchId,
        email: normalizedEmail,
        contact: trimmedContact,
        status,
      };

      localStorage.setItem(
        "posadmin_staff",
        JSON.stringify([...currentStaff, newStaff])
      );

      router.push("/staff");
    } catch (err) {
      console.error("Unable to save staff:", err);
      setError("Unable to save staff. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.push("/staff")}
            className="mb-3 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Staff
          </button>

          <h1 className="text-2xl font-semibold text-gray-900">
            Add POS Staff
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a POS staff member and assign a role and restaurant.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          noValidate
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Staff Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="staff-name" className="mb-2 block text-sm font-medium">
                Staff Name *
              </label>
              <input
                id="staff-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFieldErrors((current) => ({ ...current, name: undefined }));
                }}
                placeholder="Enter full name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "staff-name-error" : undefined}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 ${fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {fieldErrors.name && (
                <p id="staff-name-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-role" className="mb-2 block text-sm font-medium">
                POS Staff Role *
              </label>
              <Dropdown
                id="staff-role"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setFieldErrors((current) => ({ ...current, role: undefined }));
                }}
                required
                disabled={loading || roles.length === 0}
                error={Boolean(fieldErrors.role)}
                aria-describedby={fieldErrors.role ? "staff-role-error" : undefined}
                className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 disabled:bg-gray-100 ${fieldErrors.role ? "border-red-500 focus:border-red-500" : ""}`}
              >
                <option value="">
                  {loading ? "Loading roles..." : "Select role"}
                </option>
                {roles.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Dropdown>
              {fieldErrors.role && (
                <p id="staff-role-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.role}
                </p>
              )}
              {roles.length === 0 && !loading && (
                <button
                  type="button"
                  onClick={() => router.push("/roles")}
                  className="mt-2 text-sm text-[var(--primary)] hover:underline"
                >
                  Create a POS Staff role
                </button>
              )}
            </div>

            <div>
              <label htmlFor="staff-branch" className="mb-2 block text-sm font-medium">
                Restaurant *
              </label>
              <Dropdown
                id="staff-branch"
                value={branchId}
                onChange={(event) => {
                  setBranchId(event.target.value);
                  setFieldErrors((current) => ({ ...current, branchId: undefined }));
                }}
                required
                disabled={loading || branches.length === 0}
                error={Boolean(fieldErrors.branchId)}
                aria-describedby={fieldErrors.branchId ? "staff-branch-error" : undefined}
                className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 disabled:bg-gray-100 ${fieldErrors.branchId ? "border-red-500 focus:border-red-500" : ""}`}
              >
                <option value="">Select restaurant</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}{branch.code ? ` (${branch.code})` : ""}
                  </option>
                ))}
              </Dropdown>
              {fieldErrors.branchId && (
                <p id="staff-branch-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.branchId}
                </p>
              )}
              {branches.length === 0 && !loading && (
                <button
                  type="button"
                  onClick={() => router.push("/restaurants")}
                  className="mt-2 text-sm text-[var(--primary)] hover:underline"
                >
                  Manage restaurants
                </button>
              )}
            </div>

            <div>
              <label htmlFor="staff-email" className="mb-2 block text-sm font-medium">
                Email *
              </label>
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
                placeholder="name@example.com"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "staff-email-error" : undefined}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 ${fieldErrors.email ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {fieldErrors.email && (
                <p id="staff-email-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-contact" className="mb-2 block text-sm font-medium">
                Contact Number *
              </label>
              <input
                id="staff-contact"
                type="tel"
                value={contact}
                onChange={(event) => {
                  setContact(normalizeMobileNumber(event.target.value));
                  setFieldErrors((current) => ({ ...current, contact: undefined }));
                }}
                placeholder="Enter contact number"
                inputMode="numeric"
                maxLength={10}
                required
                aria-invalid={Boolean(fieldErrors.contact)}
                aria-describedby={fieldErrors.contact ? "staff-contact-error" : undefined}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 ${fieldErrors.contact ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {fieldErrors.contact && (
                <p id="staff-contact-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.contact}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="staff-status" className="mb-2 block text-sm font-medium">
                Status *
              </label>
              <Dropdown
                id="staff-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "active" | "inactive")
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Dropdown>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/staff")}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || saving || roles.length === 0 || branches.length === 0}
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save POS Staff"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
