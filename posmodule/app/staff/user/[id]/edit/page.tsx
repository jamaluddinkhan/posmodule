
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import Dropdown from "@/components/ui/Dropdown";
import {
  isValidEmail,
  isValidMobileNumber,
  normalizeMobileNumber,
} from "@/lib/validation";

type Staff = {
  id: string;
  code?: string;
  name: string;
  staffType: string;
  role: string;
  branchId?: string;
  email: string;
  contact?: string;
  status: string;
};

type Branch = {
  id: string;
  name?: string;
  branchName?: string;
  status?: string;
};

type Role = {
  id: string;
  name: string;
  staffType: string;
};

type FieldErrors = Partial<Record<"name" | "email" | "contact" | "role" | "branchId", string>>;

export default function EditUserStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: staffId } = use(params);

  const [staff, setStaff] = useState<Staff | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    role: "",
    branchId: "",
    status: "Active",
  });

  useEffect(() => {
    try {
      const allStaff: Staff[] = JSON.parse(
        localStorage.getItem("posadmin_staff") || "[]"
      );

      const current = allStaff.find(
        (item) => item.id === staffId && item.staffType === "User Staff"
      );

      if (current) {
        setStaff(current);
        setForm({
          name: current.name || "",
          email: current.email || "",
          contact: current.contact || "",
          role: current.role || "",
          branchId: current.branchId || "",
          status:
            current.status?.trim().toLowerCase() === "inactive"
              ? "Inactive"
              : "Active",
        });
      }

      const savedBranches: Branch[] = JSON.parse(
        localStorage.getItem("posadmin_branches") || "[]"
      );

      setBranches(
        savedBranches.filter(
          (branch) =>
            !branch.status ||
            branch.status.trim().toLowerCase() === "active"
        )
      );

      const savedRoles: Role[] = JSON.parse(
        localStorage.getItem("posadmin_roles") || "[]"
      );

      setRoles(
        savedRoles.filter((role) => role.staffType === "User Staff")
      );
    } catch (err) {
      console.error("Unable to load staff details:", err);
      setError("Unable to load staff details.");
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  function updateField(field: string, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!staff) {
      setError("Staff record not found.");
      return;
    }

    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) nextErrors.name = "Please enter the full name.";
    if (!form.email.trim()) nextErrors.email = "Please enter the email address.";
    if (!form.contact.trim()) nextErrors.contact = "Please enter the contact number.";
    if (!form.role) nextErrors.role = "Please select a role.";
    if (!form.branchId) nextErrors.branchId = "Please select a restaurant.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!isValidEmail(form.email)) {
      setFieldErrors({ email: "Please enter a valid email address." });
      return;
    }

    if (!isValidMobileNumber(form.contact)) {
      setFieldErrors({ contact: "Contact number must be exactly 10 digits." });
      return;
    }

    const allStaff: Staff[] = JSON.parse(
      localStorage.getItem("posadmin_staff") || "[]"
    );

    const duplicateEmail = allStaff.some(
      (item) =>
        item.id !== staffId &&
        item.email.trim().toLowerCase() === form.email.trim().toLowerCase()
    );

    if (duplicateEmail) {
      setFieldErrors({ email: "This email is already assigned to another staff member." });
      return;
    }

    const selectedRole = roles.find((role) => role.name === form.role);
    const selectedBranch = branches.find(
      (branch) => branch.id === form.branchId
    );

    if (!selectedRole) {
      setFieldErrors({ role: "Please select a valid User Staff role from Role Management." });
      return;
    }

    if (!selectedBranch) {
      setFieldErrors({ branchId: "Please select a valid active branch." });
      return;
    }

    setSaving(true);

    try {
      const updatedStaff = allStaff.map((item) =>
        item.id === staffId
          ? {
              ...item,
              name: form.name.trim(),
              email: form.email.trim(),
              contact: form.contact.trim(),
              role: form.role,
              branchId: form.branchId,
              status: form.status,
            }
          : item
      );

      localStorage.setItem("posadmin_staff", JSON.stringify(updatedStaff));
      router.push("/staff/user");
    } catch (err) {
      console.error("Unable to save staff:", err);
      setError("Unable to save changes. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading staff details...
        </div>
      </AdminLayout>
    );
  }

  if (!staff) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            User Staff not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This staff record may have been removed.
          </p>
          <Link
            href="/staff/user"
            className="mt-5 inline-block rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to User Staff
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/staff/user"
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            ← Back to User Staff
          </Link>

          <h1 className="mt-3 text-2xl font-semibold text-gray-900">
            Edit User Staff
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update staff information, role, restaurant and status.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSave}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Staff Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Staff ID: {staff.code || staff.id}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="staff-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`${inputClass} ${fieldErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                placeholder="Enter full name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "staff-name-error" : undefined}
              />
              {fieldErrors.name && (
                <p id="staff-name-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`${inputClass} ${fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                placeholder="name@example.com"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "staff-email-error" : undefined}
              />
              {fieldErrors.email && (
                <p id="staff-email-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact Number *
              </label>
              <input
                id="staff-contact"
                type="tel"
                value={form.contact}
                onChange={(e) => updateField("contact", normalizeMobileNumber(e.target.value))}
                className={`${inputClass} ${fieldErrors.contact ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                placeholder="Enter contact number"
                inputMode="numeric"
                maxLength={10}
                required
                aria-invalid={Boolean(fieldErrors.contact)}
                aria-describedby={fieldErrors.contact ? "staff-contact-error" : undefined}
              />
              {fieldErrors.contact && (
                <p id="staff-contact-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.contact}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role *
              </label>
              <Dropdown
                id="staff-role"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                className={`${inputClass} ${fieldErrors.role ? "border-red-500 focus:border-red-500" : ""}`}
                required
                error={Boolean(fieldErrors.role)}
                aria-describedby={fieldErrors.role ? "staff-role-error" : undefined}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </Dropdown>
              {fieldErrors.role && (
                <p id="staff-role-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.role}
                </p>
              )}

              {roles.length === 0 && (
                <Link
                  href="/roles"
                  className="mt-2 inline-block text-xs text-[var(--primary)] hover:underline"
                >
                  Create a User Staff role first
                </Link>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Restaurant *
              </label>
              <Dropdown
                id="staff-branch"
                value={form.branchId}
                onChange={(e) => updateField("branchId", e.target.value)}
                className={`${inputClass} ${fieldErrors.branchId ? "border-red-500 focus:border-red-500" : ""}`}
                required
                error={Boolean(fieldErrors.branchId)}
                aria-describedby={fieldErrors.branchId ? "staff-branch-error" : undefined}
              >
                <option value="">Select Restaurant</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name || branch.branchName || branch.id}
                  </option>
                ))}
              </Dropdown>
              {fieldErrors.branchId && (
                <p id="staff-branch-error" role="alert" className="mt-1 text-xs text-red-600">
                  {fieldErrors.branchId}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status *
              </label>
              <Dropdown
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Dropdown>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/staff/user")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
