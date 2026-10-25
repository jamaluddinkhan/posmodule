"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  buildQrCardSvg,
  downloadText,
  filenamePart,
  getAssignedBranchId,
  getMenuUrlError,
  getQrValue,
  initials,
  isRestrictedRestaurantUser,
  normalizeTable,
  starterBranches,
  starterRestaurants,
  starterTables,
  type SessionUser,
  type TableRecord,
} from "@/components/common/TableQrWorkspace";
import { CURRENT_USER_KEY } from "@/lib/auth";
import { STORAGE_KEYS } from "@/lib/constants";
import { useStorageValue } from "@/hooks/useStorage";
import type { Branch } from "@/types/branch";
import type { Restaurant } from "@/types/restaurant";
import type { StaffMember } from "@/types/staff";

const MENU_URL_KEY = "posadmin_table_menu_url";

export default function TableQrPage() {
  const [tables] = useStorageValue<TableRecord[]>(STORAGE_KEYS.tables, starterTables);
  const [branches] = useStorageValue<Branch[]>(STORAGE_KEYS.branches, starterBranches);
  const [restaurants] = useStorageValue<Restaurant[]>(STORAGE_KEYS.restaurants, starterRestaurants);
  const [staff] = useStorageValue<StaffMember[]>(STORAGE_KEYS.staff, []);
  const [currentUser] = useStorageValue<SessionUser | null>(CURRENT_USER_KEY, null);
  const [menuUrl, setMenuUrl] = useStorageValue(MENU_URL_KEY, "https://your-restaurant.com/menu");
  const [copied, setCopied] = useState("");
  const [query, setQuery] = useState("");
  const menuUrlError = getMenuUrlError(menuUrl);
  const normalizedTables = useMemo(() => tables.map(normalizeTable), [tables]);
  const activeBranches = branches.filter((branch) => branch.status !== "inactive");
  const assignedBranchId = getAssignedBranchId(currentUser, staff);
  const restricted = isRestrictedRestaurantUser(currentUser, assignedBranchId);
  const allowedBranchIds = new Set(
    (restricted
      ? activeBranches.filter((branch) => branch.id === assignedBranchId)
      : activeBranches
    ).map((branch) => branch.id)
  );

  const visibleTables = normalizedTables
    .map((table) => enrichTable(table, branches, restaurants))
    .filter((table) => !restricted || (table.branchId && allowedBranchIds.has(table.branchId)))
    .filter((table) => {
      const haystack = [table.name, table.tableNumber, table.restaurantName, table.branch, table.brandName, table.floor, table.area]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

  async function copyValue(table: TableRecord) {
    const value = getQrValue(table, menuUrl);
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(table.id);
  }

  function downloadQrCard(table: TableRecord) {
    const qr = document.getElementById(`print-qr-${table.id}`);
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
          title="Print table QR codes"
          description="Every QR opens the same guest menu and carries the restaurant and table number."
          backHref="/tables"
          action={<Button type="button" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()} className="print:hidden">Print QR codes</Button>}
        />

        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-6 print:hidden">
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
              label="Search"
              name="qrSearch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Table, restaurant, floor"
            />
          </div>
        </section>

        {visibleTables.length ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-4">
            {visibleTables.map((table) => {
              const value = getQrValue(table, menuUrl);
              return (
                <article key={table.id} className="rounded-xl border border-[var(--border)] bg-white p-5 text-center shadow-admin-card print:break-inside-avoid print:rounded-lg print:shadow-none">
                  <div className="mx-auto flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-gray-50">
                    {table.logoUrl ? (
                      <span
                        aria-hidden="true"
                        className="block h-full w-full bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url("${table.logoUrl}")` }}
                      />
                    ) : (
                      <span className="text-xl font-bold text-[var(--primary)]">{initials(table.restaurantName || table.branch || "R")}</span>
                    )}
                  </div>

                  <h2 className="mt-4 text-lg font-semibold">{table.restaurantName || table.branch || "Restaurant"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{[table.brandName, table.branch].filter(Boolean).join(" - ") || "Scan to open menu"}</p>

                  {value ? (
                    <QRCodeSVG id={`print-qr-${table.id}`} value={value} size={190} level="H" includeMargin className="mx-auto my-5 h-auto max-w-full" />
                  ) : (
                    <div className="mx-auto my-5 flex h-48 w-48 items-center justify-center rounded-lg bg-gray-50 p-4 text-sm text-red-600">QR unavailable</div>
                  )}

                  <p className="text-2xl font-bold text-[var(--foreground)]">Table {table.tableNumber}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{[table.floor, table.area, table.tableType].filter(Boolean).join(" - ")}</p>

                  <div className="mt-5 flex justify-center gap-2 print:hidden">
                    <Button type="button" variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={() => copyValue(table)} disabled={!value}>
                      {copied === table.id ? "Copied" : "Copy link"}
                    </Button>
                    <Button type="button" variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => downloadQrCard(table)} disabled={!value}>
                      Download
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <EmptyState title="No QR codes yet" description="Add tables first, then print or download their QR codes." action={<Button type="button" onClick={() => window.open("/tables", "_self")}>Add tables</Button>} />
        )}
      </div>
    </AdminLayout>
  );
}

function enrichTable(table: TableRecord, branches: Branch[], restaurants: Restaurant[]): TableRecord {
  if (!table.branchId) return table;

  const branch = branches.find((item) => item.id === table.branchId);
  const restaurant = branch ? restaurants.find((item) => item.id === branch.restaurantId) : undefined;

  return {
    ...table,
    branch: table.branch || branch?.name,
    restaurantName: table.restaurantName || branch?.name,
    brandName: table.brandName || restaurant?.name,
  };
}
