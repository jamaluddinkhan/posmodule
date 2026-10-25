
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import Dropdown from "@/components/ui/Dropdown";

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
};

function normalizeStatus(status?: string): "Active" | "Inactive" {
  return status?.trim().toLowerCase() === "active" ? "Active" : "Inactive";
}

export default function UserStaffPage() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedStaff = localStorage.getItem("posadmin_staff");
      const savedBranches = localStorage.getItem("posadmin_branches");

      if (savedStaff) {
        const parsed: Staff[] = JSON.parse(savedStaff);

        const normalized = parsed.map((item) => ({
          ...item,
          status: normalizeStatus(item.status),
        }));

        setStaff(normalized);
        localStorage.setItem("posadmin_staff", JSON.stringify(normalized));
      }

      if (savedBranches) {
        setBranches(JSON.parse(savedBranches));
      }
    } catch (error) {
      console.error("Unable to load User Staff:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const userStaff = staff.filter((item) => item.staffType === "User Staff");

  const roles = Array.from(
    new Set(userStaff.map((item) => item.role).filter(Boolean))
  );

  function getBranchName(branchId?: string) {
    const branch = branches.find((item) => item.id === branchId);
    return branch?.name || branch?.branchName || branchId || "—";
  }

  const filteredStaff = userStaff.filter((item) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch = [
      item.name,
      item.code,
      item.email,
      item.role,
      item.branchId,
      item.contact,
      getBranchName(item.branchId),
    ].some((value) => value?.toLowerCase().includes(searchText));

    const matchesRole = roleFilter === "All" || item.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" ||
      normalizeStatus(item.status) === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  function resetFilters() {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  }

  function toggleStatus(id: string) {
    const updated = staff.map((item) => ({
      ...item,
      status:
        item.id === id
          ? normalizeStatus(item.status) === "Active"
            ? "Inactive"
            : "Active"
          : normalizeStatus(item.status),
    }));

    localStorage.setItem("posadmin_staff", JSON.stringify(updated));
    setStaff(updated);
    setMenuId(null);
  }

  return (
    <AdminLayout>
      <div
        className="space-y-5"
        onClick={() => menuId && setMenuId(null)}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage restaurant staff and their access.
            </p>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              router.push("/staff/user/add");
            }}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            + Add User Staff
          </button>
        </div>

        <div className="flex gap-6 border-b border-gray-200">
          <Link
            href="/staff/pos"
            className="border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            POS Staff
          </Link>

          <Link
            href="/staff/user"
            className="border-b-2 border-[var(--primary)] px-2 py-3 text-sm font-medium text-[var(--primary)]"
          >
            User Staff
          </Link>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Search User Staff
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Search Staff
              </label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, code, email or restaurant"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">Role</label>
              <Dropdown
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="All">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Dropdown>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">Status</label>
              <Dropdown
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Dropdown>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="overflow-visible rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">View User Staff</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredStaff.length} staff member(s) found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--primary)] text-white">
                <tr>
                  <th className="px-5 py-4 font-medium">Staff Name</th>
                  <th className="px-5 py-4 font-medium">Staff Code</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Restaurant</th>
                  <th className="px-5 py-4 font-medium">Contact</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                      Loading staff...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p className="font-medium text-gray-800">
                        No User Staff found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Change the filters or add a staff member.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((item) => {
                    const status = normalizeStatus(item.status);

                    return (
                      <tr key={item.id} className="transition hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {item.code || item.id}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {item.role || "—"}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {getBranchName(item.branchId)}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {item.contact || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex min-w-[82px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                              status === "Active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              aria-label={`Actions for ${item.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setMenuId(menuId === item.id ? null : item.id);
                              }}
                              className="rounded-lg px-3 py-1.5 text-xl leading-none text-gray-500 hover:bg-gray-100"
                            >
                              ⋯
                            </button>

                            {menuId === item.id && (
                              <div
                                onClick={(event) => event.stopPropagation()}
                                className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg"
                              >
                                <button
                                  onClick={() =>
                                    router.push(`/staff/user/${item.id}/edit`)
                                  }
                                  className="block w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  View / Edit
                                </button>

                                <button
                                  onClick={() => toggleStatus(item.id)}
                                  className="block w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {status === "Active" ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 px-5 py-3 text-sm text-gray-500">
            Showing {filteredStaff.length} of {userStaff.length} staff members
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
