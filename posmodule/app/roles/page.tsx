
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Dropdown from "@/components/ui/Dropdown";

type StaffType = "POS Staff" | "User Staff";
type Action = "view" | "add" | "edit" | "delete" | "export";

type Permission = {
  module: string;
  subModule: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
};

type Role = {
  id: string;
  name: string;
  staffType: StaffType;
  description: string;
  permissions: Permission[];
};

type StaffRecord = {
  id: string;
  name?: string;
  role?: string;
  staffType?: string;
};

const STORAGE_KEY = "posadmin_roles";
const STAFF_KEY = "posadmin_staff";

const menuItems = [
  { name: "Dashboard", children: ["Overview", "Analytics"] },
  { name: "Brands", children: ["Add Brand", "View Brands"] },
  { name: "Restaurants", children: ["Add Restaurant", "View Restaurants"] },
  { name: "Theme", children: ["Customize Theme", "Website Preview"] },
  { name: "Staff", children: ["Add Staff", "View Staff"] },
  { name: "Role", children: ["Add Role", "View Roles"] },
  {
    name: "Menu Management",
    children: ["Add Menu Item", "View Menu Items", "Categories"],
  },
  { name: "Orders", children: ["View Orders", "Manage Orders"] },
  { name: "Tables & QR", children: ["Manage Tables", "Generate QR"] },
  {
    name: "Business Settings",
    children: ["General Settings", "Payment Settings"],
  },
];

const actions: Action[] = ["view", "add", "edit", "delete", "export"];

function createPermissions(): Permission[] {
  return menuItems.flatMap((menu) =>
    menu.children.map((subModule) => ({
      module: menu.name,
      subModule,
      view: false,
      add: false,
      edit: false,
      delete: false,
      export: false,
    }))
  );
}

function makeRole(
  id: string,
  name: string,
  staffType: StaffType,
  description: string,
  allowedModules: string[]
): Role {
  return {
    id,
    name,
    staffType,
    description,
    permissions: createPermissions().map((permission) => {
      const allowed = allowedModules.includes(permission.module);

      return {
        ...permission,
        view: allowed,
        add: allowed && ["POS Manager", "Cashier", "Waiter"].includes(name),
        edit: allowed && name === "POS Manager",
        delete: false,
        export: allowed && name === "POS Manager",
      };
    }),
  };
}

const demoRoles: Role[] = [
  makeRole(
    "role-001",
    "POS Manager",
    "POS Staff",
    "Manage POS administration and daily operations.",
    menuItems.map((item) => item.name)
  ),
  makeRole(
    "role-002",
    "Branch Manager",
    "POS Staff",
    "Manage assigned branch operations.",
    ["Dashboard", "Brands", "Restaurants", "Staff", "Menu Management", "Orders", "Tables & QR"]
  ),
  makeRole(
    "role-003",
    "Cashier",
    "User Staff",
    "Handle customer orders and billing.",
    ["Dashboard", "Orders"]
  ),
  makeRole(
    "role-004",
    "Waiter",
    "User Staff",
    "View and manage assigned customer orders.",
    ["Dashboard", "Orders", "Tables & QR"]
  ),
];

function migrateRole(value: unknown): Role | null {
  if (!value || typeof value !== "object") return null;

  const oldRole = value as Partial<Role> & {
    permissions?: Array<Partial<Permission>>;
  };

  if (
    !oldRole.id ||
    !oldRole.name ||
    (oldRole.staffType !== "POS Staff" &&
      oldRole.staffType !== "User Staff")
  ) {
    return null;
  }

  const oldPermissions = Array.isArray(oldRole.permissions)
    ? oldRole.permissions
    : [];

  const permissions = createPermissions().map((permission) => {
    const existing = oldPermissions.find(
      (item) =>
        item.module === permission.module &&
        (!item.subModule || item.subModule === permission.subModule)
    );

    return {
      ...permission,
      view: Boolean(existing?.view),
      add: Boolean(existing?.add),
      edit: Boolean(existing?.edit),
      delete: Boolean(existing?.delete),
      export: Boolean(
        (existing as Partial<Permission> | undefined)?.export
      ),
    };
  });

  return {
    id: oldRole.id,
    name: oldRole.name,
    staffType: oldRole.staffType,
    description: oldRole.description || "",
    permissions,
  };
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [staffTypeFilter, setStaffTypeFilter] = useState<StaffType | "">("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [nameError, setNameError] = useState("");

  const [name, setName] = useState("");
  const [staffType, setStaffType] = useState<StaffType>("POS Staff");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] =
    useState<Permission[]>(createPermissions());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          throw new Error("Invalid saved role data");
        }

        const migrated = parsed
          .map(migrateRole)
          .filter((role): role is Role => role !== null);

        setRoles(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } else {
        setRoles(demoRoles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRoles));
      }
    } catch (err) {
      console.error("Unable to load roles:", err);
      setError("Unable to load saved roles. Please check browser storage.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!showForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showForm]);

  const filteredRoles = roles.filter((role) => {
    const matchesType = !staffTypeFilter || role.staffType === staffTypeFilter;
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      role.name.toLowerCase().includes(searchText) ||
      role.description.toLowerCase().includes(searchText);

    return matchesType && matchesSearch;
  });

  function resetForm() {
    setName("");
    setStaffType("POS Staff");
    setDescription("");
    setPermissions(createPermissions());
    setEditingId(null);
    setShowForm(false);
    setError("");
    setSaveError("");
    setNameError("");
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(role: Role) {
    setEditingId(role.id);
    setName(role.name);
    setStaffType(role.staffType);
    setDescription(role.description || "");

    setPermissions(
      createPermissions().map((permission) => {
        const existing = role.permissions.find(
          (item) =>
            item.module === permission.module &&
            item.subModule === permission.subModule
        );

        return existing ? { ...permission, ...existing } : permission;
      })
    );

    setError("");
    setSaveError("");
    setNameError("");
    setShowForm(true);
  }

  function updatePermission(
    module: string,
    subModule: string,
    action: Action,
    checked: boolean
  ) {
    setPermissions((current) =>
      current.map((permission) =>
        permission.module === module &&
        permission.subModule === subModule
          ? { ...permission, [action]: checked }
          : permission
      )
    );
  }

  function updateMenuPermission(module: string, checked: boolean) {
    setPermissions((current) =>
      current.map((permission) =>
        permission.module === module
          ? {
              ...permission,
              view: checked,
              add: checked,
              edit: checked,
              delete: checked,
              export: checked,
            }
          : permission
      )
    );
  }

  function saveRole() {
    if (saving) return;

    setError("");
    setSaveError("");
    setNameError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Please enter a role name.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.staffType === staffType &&
        role.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        role.id !== editingId
    );

    if (duplicate) {
      setNameError("This role already exists for the selected staff type.");
      return;
    }

    const role: Role = {
      id: editingId || `role-${Date.now()}`,
      name: trimmedName,
      staffType,
      description: description.trim(),
      permissions,
    };

    const updated = editingId
      ? roles.map((item) => (item.id === editingId ? role : item))
      : [...roles, role];

    setSaving(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRoles(updated);
      resetForm();
    } catch (err) {
      console.error("Unable to save role:", err);
      setSaveError("Unable to save the role. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function deleteRole(role: Role) {
    if (saving) return;

    let allStaff: StaffRecord[];

    try {
      const savedStaff = localStorage.getItem(STAFF_KEY);
      const parsed: unknown = savedStaff ? JSON.parse(savedStaff) : [];

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid staff data");
      }

      allStaff = parsed;
    } catch (err) {
      console.error("Unable to check staff assignments:", err);
      setSaveError(
        "Unable to verify staff assignments. The role was not deleted."
      );
      return;
    }

    const assignedStaff = allStaff.filter(
      (staff) =>
        staff.staffType === role.staffType &&
        staff.role?.trim().toLowerCase() === role.name.trim().toLowerCase()
    );

    if (assignedStaff.length > 0) {
      window.alert(
        `Cannot delete "${role.name}". This role is assigned to ${assignedStaff.length} staff member(s). Reassign their roles first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${role.name}"?`)) {
      return;
    }

    const updated = roles.filter((item) => item.id !== role.id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRoles(updated);
      setSaveError("");
    } catch (err) {
      console.error("Unable to delete role:", err);
      setSaveError("Unable to delete the role. Please try again.");
    }
  }

  return (
    <AdminLayout>
      <div className="w-full min-w-0 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Role Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create roles and manage menu-level permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:opacity-90"
          >
            + Add Role
          </button>
        </div>

        {(error || saveError) && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error || saveError}
          </p>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-gray-500">Total Roles</p>
            <p className="mt-2 text-2xl font-semibold">{roles.length}</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-gray-500">POS Staff Roles</p>
            <p className="mt-2 text-2xl font-semibold">
              {roles.filter((role) => role.staffType === "POS Staff").length}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-gray-500">User Staff Roles</p>
            <p className="mt-2 text-2xl font-semibold">
              {roles.filter((role) => role.staffType === "User Staff").length}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search role name or description..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />

            <Dropdown
              value={staffTypeFilter}
              onChange={(event) =>
                setStaffTypeFilter(event.target.value as StaffType | "")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="">All staff types</option>
              <option value="POS Staff">POS Staff</option>
              <option value="User Staff">User Staff</option>
            </Dropdown>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[var(--primary)] text-white">
                <tr>
                  <th className="px-5 py-4 font-medium">Role Name</th>
                  <th className="px-5 py-4 font-medium">Staff Type</th>
                  <th className="px-5 py-4 font-medium">Description</th>
                  <th className="px-5 py-4 font-medium">Sub-menus Allowed</th>
                  <th className="px-5 py-4 text-center font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!loaded ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      Loading roles...
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {role.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                          {role.staffType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {role.description || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {
                          role.permissions.filter((permission) =>
                            actions.some((action) => permission[action])
                          ).length
                        }
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(role)}
                            className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRole(role)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                resetForm();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-form-title"
              className="max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-xl sm:p-7"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="role-form-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {editingId ? "Edit Role" : "Add Role"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure role details and permissions for each sub-menu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  aria-label="Close role form"
                  className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              {error && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Role Name *
                  </label>
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setNameError("");
                    }}
                    placeholder="e.g. Restaurant Manager"
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? "role-name-error" : undefined}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 ${nameError ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {nameError && (
                    <p id="role-name-error" role="alert" className="mt-1 text-xs text-red-600">
                      {nameError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Staff Type *
                  </label>
                  <Dropdown
                    value={staffType}
                    onChange={(event) =>
                      setStaffType(event.target.value as StaffType)
                    }
                    disabled={Boolean(editingId)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 disabled:bg-gray-100"
                  >
                    <option value="POS Staff">POS Staff</option>
                    <option value="User Staff">User Staff</option>
                  </Dropdown>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={2}
                    placeholder="Describe this role..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-semibold">Menu & Sub-menu Permissions</h3>
                  <p className="text-xs text-gray-500">
                    Select permissions for each sub-menu.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Menu / Sub-menu</th>
                        {actions.map((action) => (
                          <th key={action} className="px-4 py-3 capitalize">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {menuItems.map((menu) => (
                        <>
                          <tr
                            key={`${menu.name}-heading`}
                            className="bg-gray-50"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {menu.name}
                            </td>
                            <td colSpan={5} className="px-4 py-3">
                              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={permissions
                                    .filter((p) => p.module === menu.name)
                                    .every((p) =>
                                      actions.every((action) => p[action])
                                    )}
                                  onChange={(event) =>
                                    updateMenuPermission(
                                      menu.name,
                                      event.target.checked
                                    )
                                  }
                                  className="h-4 w-4 accent-[var(--primary)]"
                                />
                                Select all permissions
                              </label>
                            </td>
                          </tr>

                          {menu.children.map((subModule) => {
                            const permission = permissions.find(
                              (p) =>
                                p.module === menu.name &&
                                p.subModule === subModule
                            );

                            if (!permission) return null;

                            return (
                              <tr
                                key={`${menu.name}-${subModule}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 pl-8 text-gray-700">
                                  ↳ {subModule}
                                </td>

                                {actions.map((action) => (
                                  <td key={action} className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={permission[action]}
                                      onChange={(event) =>
                                        updatePermission(
                                          menu.name,
                                          subModule,
                                          action,
                                          event.target.checked
                                        )
                                      }
                                      aria-label={`${action} permission for ${subModule}`}
                                      className="h-4 w-4 accent-[var(--primary)]"
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {saveError && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {saveError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveRole}
                  disabled={saving}
                  className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Role"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
