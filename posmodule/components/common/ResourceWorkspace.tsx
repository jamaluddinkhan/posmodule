"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import SearchFilter from "@/components/common/SearchFilter";
import Button from "@/components/ui/Button";
import DataTable, { type DataColumn } from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { STORAGE_KEYS } from "@/lib/constants";
import { createId, formatCurrency } from "@/lib/utils";
import { useStorageValue } from "@/hooks/useStorage";

type ResourceModule = "menu" | "categories" | "orders" | "tables";
type ResourceMode = "list" | "add" | "edit" | "detail";
type ResourceRecord = {
  id: string;
  name: string;
  status: string;
  [key: string]: string | number | boolean | undefined;
};
type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
};

const starterCategories: ResourceRecord[] = [
  { id: "cat-breakfast", name: "Breakfast", description: "Morning favourites", status: "Active" },
  { id: "cat-mains", name: "Main Course", description: "Meals and mains", status: "Active" },
  { id: "cat-drinks", name: "Beverages", description: "Hot and cold drinks", status: "Active" },
];

const configs: Record<ResourceModule, {
  title: string;
  description: string;
  storageKey: string;
  addHref?: string;
  fields: Field[];
  starter: ResourceRecord[];
}> = {
  menu: {
    title: "Menu Management",
    description: "Manage menu items, prices and availability.",
    storageKey: STORAGE_KEYS.menuItems,
    addHref: "/menu/add",
    fields: [
      { name: "name", label: "Item name", required: true },
      { name: "category", label: "Category", type: "select", required: true, options: starterCategories.map(({ name }) => ({ value: name, label: name })) },
      { name: "price", label: "Price (INR)", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "status", label: "Availability", type: "select", options: [{ value: "Active", label: "Available" }, { value: "Inactive", label: "Unavailable" }] },
    ],
    starter: [
      { id: "item-001", name: "Masala Dosa", category: "Breakfast", price: 180, description: "Crisp dosa with house masala", status: "Active" },
      { id: "item-002", name: "Paneer Tikka", category: "Main Course", price: 320, description: "Chargrilled paneer with spices", status: "Active" },
      { id: "item-003", name: "Mango Lassi", category: "Beverages", price: 120, description: "Fresh mango and yoghurt", status: "Inactive" },
    ],
  },
  categories: {
    title: "Menu Categories",
    description: "Organize menu items into clear sections.",
    storageKey: STORAGE_KEYS.menuCategories,
    addHref: "/menu/categories/add",
    fields: [
      { name: "name", label: "Category name", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
    ],
    starter: starterCategories,
  },
  orders: {
    title: "Orders",
    description: "Review incoming orders and their payment status.",
    storageKey: STORAGE_KEYS.orders,
    fields: [],
    starter: [
      { id: "order-1048", name: "#1048 · Ayesha Khan", number: "Table 04", total: 740, paymentStatus: "Paid", status: "Preparing", createdAt: "2026-10-11T10:25:00" },
      { id: "order-1047", name: "#1047 · Walk-in", number: "Table 02", total: 510, paymentStatus: "Pending", status: "New", createdAt: "2026-10-11T10:12:00" },
      { id: "order-1046", name: "#1046 · Farah Ali", number: "Pickup", total: 325, paymentStatus: "Paid", status: "Ready", createdAt: "2026-10-11T09:54:00" },
    ],
  },
  tables: {
    title: "Tables & QR",
    description: "Manage seating, table capacity and guest QR links.",
    storageKey: STORAGE_KEYS.tables,
    addHref: "/tables/add",
    fields: [
      { name: "name", label: "Table name", required: true },
      { name: "branch", label: "Branch", type: "select", required: true, options: ["Main Branch", "Vashi Branch", "Andheri Branch"].map((name) => ({ value: name, label: name })) },
      { name: "capacity", label: "Seating capacity", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: [{ value: "Available", label: "Available" }, { value: "Occupied", label: "Occupied" }, { value: "Reserved", label: "Reserved" }, { value: "Inactive", label: "Inactive" }] },
    ],
    starter: [
      { id: "table-01", name: "Table 01", branch: "Main Branch", capacity: 2, status: "Available" },
      { id: "table-02", name: "Table 02", branch: "Main Branch", capacity: 4, status: "Occupied" },
      { id: "table-03", name: "Table 03", branch: "Vashi Branch", capacity: 4, status: "Reserved" },
    ],
  },
};

export default function ResourceWorkspace({
  module,
  mode,
  id,
}: {
  module: ResourceModule;
  mode: ResourceMode;
  id?: string;
}) {
  const config = configs[module];
  const router = useRouter();
  const [records, setRecords] = useStorageValue<ResourceRecord[]>(config.storageKey, config.starter);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const record = records.find((item) => item.id === id);
  const basePath = module === "categories" ? "/menu/categories" : `/${module}`;
  const filtered = records.filter((item) =>
    Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase()))
  );

  function backToList() {
    router.push(basePath);
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    const fieldValue = (field: Field) => {
      const savedValue =
        form[field.name] ??
        (mode === "edit" ? String(record?.[field.name] ?? "") : "");

      if (savedValue) return savedValue;

      return field.type === "select" ? field.options?.[0]?.value ?? "" : "";
    };
    const name = form.name?.trim() || (mode === "edit" ? String(record?.name || "").trim() : "");

    const nextErrors: Record<string, string> = {};

    for (const field of config.fields) {
      if (!field.required) continue;
      const current = fieldValue(field);
      if (!current.trim()) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
    }

    if (!name) {
      nextErrors.name = "Enter a name before saving.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const values: ResourceRecord = {
      id: mode === "edit" && id ? id : createId(module),
      name,
      status: form.status || String(record?.status || (module === "tables" ? "Available" : "Active")),
    };

    for (const field of config.fields) {
      if (field.name === "name") continue;
      const value = fieldValue(field);
      if (value !== undefined && value !== "") {
        values[field.name] = field.type === "number" ? Number(value) : value;
      }
    }

    setRecords(mode === "edit"
      ? records.map((item) => item.id === id ? { ...item, ...values } : item)
      : [values, ...records]);
    backToList();
  }

  function removeRecord(target: ResourceRecord) {
    if (!window.confirm(`Delete ${target.name}? This cannot be undone.`)) return;
    setRecords(records.filter((item) => item.id !== target.id));
  }

  const columns: DataColumn<ResourceRecord>[] = [
    {
      key: "name",
      label: module === "orders" ? "Order" : module === "tables" ? "Table" : "Name",
      render: (item) => <div className="min-w-40"><p className="font-semibold text-[var(--foreground)]">{item.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{String(item.description || item.number || item.id)}</p></div>,
    },
    ...(module === "menu" ? [
      { key: "category", label: "Category", render: (item: ResourceRecord) => <span>{String(item.category || "-")}</span> },
      { key: "price", label: "Price", render: (item: ResourceRecord) => <span className="font-medium">{formatCurrency(Number(item.price || 0))}</span> },
    ] : []),
    ...(module === "tables" ? [
      { key: "branch", label: "Branch", render: (item: ResourceRecord) => <span>{String(item.branch || "-")}</span> },
      { key: "capacity", label: "Seats", render: (item: ResourceRecord) => <span>{String(item.capacity || 0)}</span> },
    ] : []),
    ...(module === "orders" ? [
      { key: "total", label: "Total", render: (item: ResourceRecord) => <span className="font-medium">{formatCurrency(Number(item.total || 0))}</span> },
      { key: "paymentStatus", label: "Payment", render: (item: ResourceRecord) => <StatusBadge status={String(item.paymentStatus || "Pending")} /> },
    ] : []),
    { key: "status", label: "Status", render: (item: ResourceRecord) => <StatusBadge status={item.status} /> },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (item) => <div className="flex justify-end gap-3 whitespace-nowrap">
        <Link className="font-semibold text-[var(--primary)] hover:underline" href={`${basePath}/${item.id}`}>View</Link>
        {module !== "orders" && <Link className="font-semibold text-[var(--primary)] hover:underline" href={`${basePath}/${item.id}/edit`}>Edit</Link>}
        {module !== "orders" && <button type="button" onClick={() => removeRecord(item)} className="font-semibold text-red-600 hover:underline">Delete</button>}
      </div>,
    },
  ];

  let content;

  if (mode === "list") {
    content = (
      <div className="space-y-6">
        <PageHeader
          eyebrow={module === "orders" ? "OPERATIONS" : "CATALOGUE"}
          title={config.title}
          description={config.description}
          backHref={module === "categories" ? "/menu" : module === "menu" || module === "tables" ? "/dashboard" : undefined}
          action={<>
            {module === "menu" && <Link href="/menu/categories" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-gray-50">Categories</Link>}
            {config.addHref && <Link href={config.addHref} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:opacity-90">{module === "tables" ? "Add table" : module === "categories" ? "Add category" : "Add item"}</Link>}
            {module === "tables" && <Link href="/tables/qr" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold hover:bg-gray-50">QR codes</Link>}
          </>}
        />
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-admin-card">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div><h2 className="font-semibold">{module === "orders" ? "Recent orders" : module === "tables" ? "Restaurant tables" : module === "categories" ? "All categories" : "All menu items"}</h2><p className="mt-1 text-sm text-[var(--muted)]">{filtered.length} records</p></div>
            <SearchFilter value={query} onChange={setQuery} onClear={() => setQuery("")} placeholder={`Search ${config.title.toLowerCase()}`} />
          </div>
          <DataTable rows={filtered} columns={columns} emptyMessage="No matching records. Try another search." />
        </section>
      </div>
    );
  } else if (mode === "detail") {
    content = !record ? (
      <EmptyState title="Record not found" description="It may have been removed or the link is no longer valid." action={<Button variant="secondary" onClick={backToList}>Back to {config.title}</Button>} />
    ) : (
      <div className="space-y-6">
        <PageHeader eyebrow={config.title.toUpperCase()} title={record.name} description="Record details" action={<>
          {module !== "orders" && <Link href={`${basePath}/${record.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white">Edit</Link>}
          <Button variant="secondary" onClick={backToList}>Back</Button>
        </>} backHref={basePath} />
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-7">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(record).filter(([key]) => key !== "id").map(([key, value]) => <div key={key} className="min-w-0 border-b border-[var(--border)] pb-4"><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim()}</dt><dd className="mt-2 break-words text-sm font-medium">{key === "status" ? <StatusBadge status={String(value)} /> : key === "price" || key === "total" ? formatCurrency(Number(value)) : String(value ?? "-" )}</dd></div>)}
          </dl>
        </section>
      </div>
    );
  } else {
    content = module === "orders" ? (
      <EmptyState title="This action is unavailable" description="Use the module list to continue." action={<Button variant="secondary" onClick={backToList}>Back to {config.title}</Button>} />
    ) : (
      <div className="space-y-6">
        <PageHeader eyebrow={config.title.toUpperCase()} title={mode === "edit" ? `Edit ${record?.name || "record"}` : module === "tables" ? "Add table" : module === "categories" ? "Add category" : "Add menu item"} description={config.description} backHref={basePath} />
        <form noValidate onSubmit={saveRecord} className="space-y-6 rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-7">
          {!record && mode === "edit" && <EmptyState title="Record not found" description="The selected record could not be loaded." action={<Button variant="secondary" onClick={backToList}>Back to list</Button>} />}
          {config.fields.length > 0 && <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {config.fields.map((field) => {
              const current = form[field.name] ?? (record?.[field.name] === undefined ? "" : String(record[field.name]));
              const fieldError = fieldErrors[field.name];
              const updateField = (value: string) => {
                setForm({ ...form, [field.name]: value });
                setFieldErrors((currentErrors) => ({ ...currentErrors, [field.name]: undefined }));
              };
              if (field.type === "select") return <Select key={field.name} label={field.label} name={field.name} required={field.required} value={current || field.options?.[0]?.value} options={field.options || []} error={fieldError} onChange={(event) => updateField(event.target.value)} />;
              if (field.type === "textarea") return <label key={field.name} className="block md:col-span-2"><span className="mb-2 block text-sm font-medium">{field.label}</span><textarea name={field.name} rows={3} value={current} onChange={(event) => updateField(event.target.value)} aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? `${field.name}-error` : undefined} className={`w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--color-focus)] ${fieldError ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`} />{fieldError && <span id={`${field.name}-error`} role="alert" className="mt-1 block text-xs text-red-600">{fieldError}</span>}</label>;
              return <Input key={field.name} label={field.label} name={field.name} type={field.type || "text"} required={field.required} min={field.type === "number" ? 0 : undefined} step={field.name === "price" ? "0.01" : undefined} value={current} error={fieldError} onChange={(event) => updateField(event.target.value)} />;
            })}
          </div>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={backToList}>Cancel</Button>
            <Button type="submit">{mode === "edit" ? "Save changes" : "Create record"}</Button>
          </div>
        </form>
      </div>
    );
  }

  return <AdminLayout><div className="space-y-6">{content}</div></AdminLayout>;
}
