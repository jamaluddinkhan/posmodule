"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Download, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { CURRENT_USER_KEY } from "@/lib/auth";
import { branding } from "@/lib/branding";
import { STORAGE_KEYS } from "@/lib/constants";
import { createId } from "@/lib/utils";
import { useStorageValue } from "@/hooks/useStorage";
import type { Branch } from "@/types/branch";
import type { Restaurant } from "@/types/restaurant";
import type { StaffMember } from "@/types/staff";

export type SessionUser = {
  id?: string;
  staffId?: string;
  email?: string;
  name?: string;
  role?: string;
  staffType?: "POS Staff" | "User Staff";
  branchId?: string;
};

type TableStatus = "Available" | "Occupied" | "Reserved" | "Inactive";

export type TableRecord = {
  id: string;
  name: string;
  tableNumber: string;
  branchId?: string;
  branch?: string;
  restaurantName?: string;
  brandName?: string;
  logoUrl?: string;
  capacity: number;
  floor?: string;
  area?: string;
  tableType?: string;
  menuUrl?: string;
  status: TableStatus;
  notes?: string;
  createdAt?: string;
};

type FormState = {
  id?: string;
  tableNumber: string;
  name: string;
  branchId: string;
  capacity: string;
  floor: string;
  area: string;
  tableType: string;
  logoUrl: string;
  menuUrl: string;
  status: TableStatus;
  notes: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const MENU_URL_KEY = "posadmin_table_menu_url";

export const starterBranches: Branch[] = [
  { id: "br-001", code: "BR-001", name: "Vashi Branch", restaurantId: "rest-001", address: "Sector 17, Vashi", city: "Navi Mumbai", contact: "9876543210", status: "active" },
  { id: "br-002", code: "BR-002", name: "Belapur Branch", restaurantId: "rest-001", address: "CBD Belapur", city: "Navi Mumbai", contact: "9876543211", status: "active" },
  { id: "br-003", code: "BR-003", name: "Andheri Branch", restaurantId: "rest-002", address: "Andheri West", city: "Mumbai", contact: "9876543212", status: "active" },
];

export const starterRestaurants: Restaurant[] = [
  { id: "rest-001", code: "RST-001", name: "The Taj Kitchen", city: "Navi Mumbai", branches: 2, status: "active", registeredOn: "2026-01-05" },
  { id: "rest-002", code: "RST-002", name: "Urban Tadka", city: "Mumbai", branches: 1, status: "active", registeredOn: "2026-01-12" },
];

export const starterTables: TableRecord[] = [
  { id: "table-01", name: "Table 01", tableNumber: "01", branchId: "br-001", branch: "Vashi Branch", restaurantName: "Vashi Branch", brandName: "The Taj Kitchen", capacity: 2, floor: "Ground", area: "Indoor", tableType: "Dine-in", status: "Available" },
  { id: "table-02", name: "Table 02", tableNumber: "02", branchId: "br-001", branch: "Vashi Branch", restaurantName: "Vashi Branch", brandName: "The Taj Kitchen", capacity: 4, floor: "Ground", area: "Indoor", tableType: "Dine-in", status: "Occupied" },
  { id: "table-03", name: "Table 03", tableNumber: "03", branchId: "br-003", branch: "Andheri Branch", restaurantName: "Andheri Branch", brandName: "Urban Tadka", capacity: 4, floor: "First", area: "Family", tableType: "Dine-in", status: "Reserved" },
];

const emptyForm = (menuUrl: string): FormState => ({
  tableNumber: "",
  name: "",
  branchId: "",
  capacity: "4",
  floor: "",
  area: "",
  tableType: "Dine-in",
  logoUrl: branding.logoUrl,
  menuUrl,
  status: "Available",
  notes: "",
});

export function normalizeTable(value: unknown, index: number): TableRecord {
  const item = value && typeof value === "object" ? (value as Partial<TableRecord>) : {};
  const tableNumber = String(item.tableNumber || item.name?.replace(/table/i, "").trim() || index + 1).padStart(2, "0");

  return {
    id: String(item.id || `table-${String(index + 1).padStart(2, "0")}`),
    name: String(item.name || `Table ${tableNumber}`),
    tableNumber,
    branchId: item.branchId ? String(item.branchId) : undefined,
    branch: item.branch ? String(item.branch) : undefined,
    restaurantName: item.restaurantName ? String(item.restaurantName) : undefined,
    brandName: item.brandName ? String(item.brandName) : undefined,
    logoUrl: item.logoUrl ? String(item.logoUrl) : undefined,
    capacity: Number.isFinite(Number(item.capacity)) ? Number(item.capacity) : 0,
    floor: item.floor ? String(item.floor) : undefined,
    area: item.area ? String(item.area) : undefined,
    tableType: item.tableType ? String(item.tableType) : undefined,
    menuUrl: item.menuUrl ? String(item.menuUrl) : undefined,
    status: isTableStatus(item.status) ? item.status : "Available",
    notes: item.notes ? String(item.notes) : undefined,
    createdAt: item.createdAt ? String(item.createdAt) : undefined,
  };
}

function isTableStatus(value: unknown): value is TableStatus {
  return value === "Available" || value === "Occupied" || value === "Reserved" || value === "Inactive";
}

function getBranchRestaurant(branch: Branch | undefined, restaurants: Restaurant[]) {
  return branch ? restaurants.find((restaurant) => restaurant.id === branch.restaurantId) : undefined;
}

export function getAssignedBranchId(currentUser: SessionUser | null, staff: StaffMember[]) {
  if (!currentUser) return "";
  if (currentUser.branchId) return currentUser.branchId;

  const staffId = currentUser.staffId || currentUser.id;
  const found = staff.find((item) =>
    (staffId && item.id === staffId) ||
    (currentUser.email && item.email?.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
  );

  return found?.branchId || "";
}

export function isRestrictedRestaurantUser(currentUser: SessionUser | null, assignedBranchId: string) {
  if (!currentUser || !assignedBranchId) return false;
  return currentUser.staffType === "POS Staff" || currentUser.staffType === "User Staff";
}

export function getQrValue(table: TableRecord, fallbackMenuUrl: string) {
  const menuUrl = table.menuUrl || fallbackMenuUrl;

  try {
    const url = new URL(menuUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    url.searchParams.set("table", table.id);
    url.searchParams.set("tableNo", table.tableNumber);
    if (table.branchId) url.searchParams.set("restaurant", table.branchId);
    return url.toString();
  } catch {
    return "";
  }
}

export function getMenuUrlError(value: string) {
  if (!value.trim()) return "Please enter the guest menu URL.";

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "Enter a valid HTTP or HTTPS menu URL.";
    return "";
  } catch {
    return "Enter a valid HTTP or HTTPS menu URL.";
  }
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&apos;",
  }[character] || character));
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "R";
}

export function downloadText(filename: string, content: string, type = "image/svg+xml;charset=utf-8") {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export function buildQrCardSvg(table: TableRecord, qrMarkup: string) {
  const restaurantName = table.restaurantName || table.branch || "Restaurant";
  const brandName = table.brandName || "";
  const subtitle = [brandName, table.branch].filter(Boolean).join(" - ");
  const qrContent = qrMarkup
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/width="[^"]*"/, "width=\"260\"")
    .replace(/height="[^"]*"/, "height=\"260\"");

  const logo = table.logoUrl
    ? `<image href="${escapeXml(table.logoUrl)}" x="156" y="26" width="88" height="58" preserveAspectRatio="xMidYMid meet" />`
    : `<circle cx="200" cy="55" r="31" fill="#0057ff"/><text x="200" y="64" text-anchor="middle" font-family="Arial" font-size="23" font-weight="700" fill="#fff">${escapeXml(initials(restaurantName))}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <rect width="400" height="560" rx="28" fill="#ffffff"/>
  <rect x="16" y="16" width="368" height="528" rx="22" fill="none" stroke="#e5e5e0" stroke-width="2"/>
  ${logo}
  <text x="200" y="120" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" fill="#172033">${escapeXml(restaurantName)}</text>
  <text x="200" y="146" text-anchor="middle" font-family="Arial" font-size="13" fill="#667085">${escapeXml(subtitle || "Scan to open menu")}</text>
  <g transform="translate(70 174)">${qrContent}</g>
  <text x="200" y="474" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#172033">Table ${escapeXml(table.tableNumber)}</text>
  <text x="200" y="503" text-anchor="middle" font-family="Arial" font-size="14" fill="#667085">Scan QR to view the menu</text>
</svg>`;
}

export function filenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "table";
}

export default function TableQrWorkspace({ startWithForm = false }: { startWithForm?: boolean }) {
  const [tables, setTables] = useStorageValue<TableRecord[]>(STORAGE_KEYS.tables, starterTables);
  const [branches] = useStorageValue<Branch[]>(STORAGE_KEYS.branches, starterBranches);
  const [restaurants] = useStorageValue<Restaurant[]>(STORAGE_KEYS.restaurants, starterRestaurants);
  const [staff] = useStorageValue<StaffMember[]>(STORAGE_KEYS.staff, []);
  const [currentUser] = useStorageValue<SessionUser | null>(CURRENT_USER_KEY, null);
  const [menuUrl, setMenuUrl] = useStorageValue(MENU_URL_KEY, "https://your-restaurant.com/menu");
  const normalizedTables = useMemo(() => tables.map(normalizeTable), [tables]);
  const activeBranches = branches.filter((branch) => branch.status !== "inactive");
  const assignedBranchId = getAssignedBranchId(currentUser, staff);
  const restricted = isRestrictedRestaurantUser(currentUser, assignedBranchId);
  const allowedBranches = restricted ? activeBranches.filter((branch) => branch.id === assignedBranchId) : activeBranches;
  const allowedBranchIds = new Set(allowedBranches.map((branch) => branch.id));
  const visibleTables = restricted
    ? normalizedTables.filter((table) => table.branchId && allowedBranchIds.has(table.branchId))
    : normalizedTables;
  const [showForm, setShowForm] = useState(startWithForm);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<FormState>(() => emptyForm(menuUrl));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [copied, setCopied] = useState("");
  const [query, setQuery] = useState("");
  const menuUrlError = getMenuUrlError(menuUrl);

  const filteredTables = visibleTables.filter((table) => {
    const haystack = [table.name, table.tableNumber, table.branch, table.restaurantName, table.area, table.floor, table.status]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function updateForm(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function openAddForm() {
    const base = emptyForm(menuUrl);
    if (allowedBranches.length === 1) base.branchId = allowedBranches[0].id;
    setForm(base);
    setEditingId("");
    setFieldErrors({});
    setShowForm(true);
  }

  function openEditForm(table: TableRecord) {
    setForm({
      id: table.id,
      tableNumber: table.tableNumber,
      name: table.name,
      branchId: table.branchId || "",
      capacity: String(table.capacity || ""),
      floor: table.floor || "",
      area: table.area || "",
      tableType: table.tableType || "Dine-in",
      logoUrl: table.logoUrl || branding.logoUrl,
      menuUrl: table.menuUrl || menuUrl,
      status: table.status,
      notes: table.notes || "",
    });
    setEditingId(table.id);
    setFieldErrors({});
    setShowForm(true);
  }

  function saveTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    const tableNumber = form.tableNumber.trim();
    const name = form.name.trim() || `Table ${tableNumber}`;
    const capacity = Number(form.capacity);
    const selectedBranch = allowedBranches.find((branch) => branch.id === form.branchId);

    if (!tableNumber) nextErrors.tableNumber = "Please enter the table number.";
    if (!form.branchId) nextErrors.branchId = "Please select the restaurant.";
    if (form.branchId && !selectedBranch) nextErrors.branchId = "Please select an active restaurant.";
    if (!Number.isFinite(capacity) || capacity < 1) nextErrors.capacity = "Enter a valid seating capacity.";
    if (getMenuUrlError(form.menuUrl)) nextErrors.menuUrl = getMenuUrlError(form.menuUrl);

    const duplicate = normalizedTables.some((table) =>
      table.id !== editingId &&
      table.branchId === form.branchId &&
      table.tableNumber.trim().toLowerCase() === tableNumber.toLowerCase()
    );

    if (duplicate) nextErrors.tableNumber = "This table number already exists for the selected restaurant.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const restaurant = getBranchRestaurant(selectedBranch, restaurants);
    const nextTable: TableRecord = {
      id: editingId || createId("table"),
      name,
      tableNumber,
      branchId: selectedBranch?.id,
      branch: selectedBranch?.name,
      restaurantName: selectedBranch?.name,
      brandName: restaurant?.name,
      logoUrl: form.logoUrl.trim() || branding.logoUrl,
      capacity,
      floor: form.floor.trim() || undefined,
      area: form.area.trim() || undefined,
      tableType: form.tableType,
      menuUrl: form.menuUrl.trim(),
      status: form.status,
      notes: form.notes.trim() || undefined,
      createdAt: editingId ? normalizedTables.find((table) => table.id === editingId)?.createdAt : new Date().toISOString(),
    };

    setMenuUrl(form.menuUrl.trim());
    setTables((current) => {
      const normalized = current.map(normalizeTable);
      return editingId
        ? normalized.map((table) => table.id === editingId ? nextTable : table)
        : [nextTable, ...normalized];
    });
    setShowForm(false);
    setEditingId("");
    setForm(emptyForm(form.menuUrl.trim()));
  }

  function removeTable(table: TableRecord) {
    if (!window.confirm(`Delete ${table.name}?`)) return;
    setTables((current) => current.map(normalizeTable).filter((item) => item.id !== table.id));
  }

  async function copyQrLink(table: TableRecord) {
    const value = getQrValue(table, menuUrl);
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(table.id);
  }

  function downloadQrCard(table: TableRecord) {
    const qr = document.getElementById(`table-qr-${table.id}`);
    if (!qr) return;
    const qrMarkup = new XMLSerializer().serializeToString(qr);
    const svg = buildQrCardSvg(table, qrMarkup);
    downloadText(`${filenamePart(table.restaurantName || table.branch || "restaurant")}-${filenamePart(table.name)}-qr.svg`, svg);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="TABLES & QR"
          title="Restaurant tables"
          description="Create restaurant tables and generate table-specific QR codes for the same guest menu."
          backHref="/dashboard"
          action={<>
            <Button type="button" variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.open("/tables/qr", "_self")}>Print QR</Button>
            <Button type="button" icon={<Plus className="h-4 w-4" />} onClick={openAddForm}>Add table</Button>
          </>}
        />

        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Input
              label="Common guest menu URL"
              name="menuUrl"
              type="url"
              value={menuUrl}
              onChange={(event) => setMenuUrl(event.target.value)}
              placeholder="https://restaurant.example/menu"
              error={menuUrlError}
              required
            />
            <Input
              label="Search tables"
              name="tableSearch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Table number, restaurant, floor, status"
            />
          </div>
        </section>

        {showForm && (
          <form noValidate onSubmit={saveTable} className="space-y-5 rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{editingId ? "Edit table" : "Add table"}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Table number is added into the QR link so every table opens the same menu with its own table context.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Close</Button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Input label="Table number" name="tableNumber" value={form.tableNumber} onChange={(event) => updateForm("tableNumber", event.target.value)} placeholder="01" error={fieldErrors.tableNumber} required />
              <Input label="Display name" name="name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Table 01" error={fieldErrors.name} />
              <Select
                label="Restaurant"
                name="branchId"
                value={form.branchId}
                onChange={(event) => updateForm("branchId", event.target.value)}
                error={fieldErrors.branchId}
                options={[{ value: "", label: "Select restaurant" }, ...allowedBranches.map((branch) => {
                  const restaurant = getBranchRestaurant(branch, restaurants);
                  return { value: branch.id, label: `${branch.name}${restaurant?.name ? ` - ${restaurant.name}` : ""}` };
                })]}
                required
              />
              <Input label="Seating capacity" name="capacity" type="number" min={1} value={form.capacity} onChange={(event) => updateForm("capacity", event.target.value)} error={fieldErrors.capacity} required />
              <Input label="Floor" name="floor" value={form.floor} onChange={(event) => updateForm("floor", event.target.value)} placeholder="Ground, First, Rooftop" />
              <Input label="Area / section" name="area" value={form.area} onChange={(event) => updateForm("area", event.target.value)} placeholder="Indoor, Family, Patio" />
              <Select label="Table type" name="tableType" value={form.tableType} onChange={(event) => updateForm("tableType", event.target.value)} options={[
                { value: "Dine-in", label: "Dine-in" },
                { value: "VIP", label: "VIP" },
                { value: "Outdoor", label: "Outdoor" },
                { value: "Takeaway counter", label: "Takeaway counter" },
              ]} />
              <Select label="Status" name="status" value={form.status} onChange={(event) => updateForm("status", event.target.value)} options={[
                { value: "Available", label: "Available" },
                { value: "Occupied", label: "Occupied" },
                { value: "Reserved", label: "Reserved" },
                { value: "Inactive", label: "Inactive" },
              ]} />
              <Input label="Logo URL" name="logoUrl" type="url" value={form.logoUrl} onChange={(event) => updateForm("logoUrl", event.target.value)} placeholder="https://..." />
              <Input label="Guest menu URL" name="tableMenuUrl" type="url" value={form.menuUrl} onChange={(event) => updateForm("menuUrl", event.target.value)} error={fieldErrors.menuUrl} required />
              <label className="block min-w-0 md:col-span-2 xl:col-span-3">
                <span className="mb-2 block text-sm font-medium">Internal note</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--color-focus)]"
                  placeholder="Near window, needs high chair, service instruction"
                />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Save changes" : "Create table & QR"}</Button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-admin-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-5">
            <div>
              <h2 className="font-semibold">Tables</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{filteredTables.length} table records</p>
            </div>
            {!showForm && <Button type="button" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={openAddForm}>Add table</Button>}
          </div>

          {filteredTables.length ? (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Restaurant</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>QR</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((table) => {
                    const qrValue = getQrValue(table, menuUrl);
                    return (
                      <tr key={table.id}>
                        <td>
                          <p className="font-semibold text-[var(--foreground)]">{table.name}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">Table {table.tableNumber}</p>
                        </td>
                        <td>
                          <p className="font-medium">{table.restaurantName || table.branch || "-"}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{table.brandName || table.branchId || "-"}</p>
                        </td>
                        <td>
                          <p>{table.capacity} seats - {table.tableType || "Dine-in"}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{[table.floor, table.area].filter(Boolean).join(" - ") || "No section set"}</p>
                        </td>
                        <td><StatusBadge status={table.status} /></td>
                        <td>
                          {qrValue ? (
                            <div className="flex items-center gap-3">
                              <QRCodeSVG id={`table-qr-${table.id}`} value={qrValue} size={72} level="H" includeMargin />
                              <button type="button" onClick={() => copyQrLink(table)} className="text-sm font-semibold text-[var(--primary)] hover:underline">
                                {copied === table.id ? "Copied" : "Copy link"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-red-600">Invalid menu URL</span>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => downloadQrCard(table)} disabled={!qrValue}>Download</Button>
                            <Button type="button" variant="quiet" icon={<Pencil className="h-4 w-4" />} onClick={() => openEditForm(table)} aria-label={`Edit ${table.name}`} />
                            <Button type="button" variant="quiet" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => removeTable(table)} aria-label={`Delete ${table.name}`} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No tables found" description="Create a table to generate its QR code." action={<Button type="button" onClick={openAddForm}>Add table</Button>} />
          )}
        </section>

        {filteredTables.length > 0 && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTables.slice(0, 6).map((table) => {
              const qrValue = getQrValue(table, menuUrl);
              return (
                <article key={table.id} className="rounded-xl border border-[var(--border)] bg-white p-5 text-center shadow-admin-card">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-gray-50">
                    {table.logoUrl ? (
                      <span
                        aria-hidden="true"
                        className="block h-full w-full bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url("${table.logoUrl}")` }}
                      />
                    ) : (
                      <span className="font-bold text-[var(--primary)]">{initials(table.restaurantName || table.branch || "R")}</span>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold">{table.restaurantName || table.branch || "Restaurant"}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">Table {table.tableNumber}</p>
                  {qrValue ? <QRCodeSVG value={qrValue} size={160} level="H" includeMargin className="mx-auto my-4 h-auto max-w-full" /> : <div className="my-4 text-sm text-red-600">Invalid QR URL</div>}
                  <p className="text-xs text-[var(--muted)]">Ready for print/download</p>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </AdminLayout>
  );
}
