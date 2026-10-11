"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { STORAGE_KEYS } from "@/lib/constants";
import { useStorageValue } from "@/hooks/useStorage";
import {
  isValidEmail,
  isValidMobileNumber,
  normalizeMobileNumber,
} from "@/lib/validation";

type SettingsData = {
  businessName?: string;
  supportEmail?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  paymentsEnabled?: boolean;
  paymentProvider?: string;
  merchantId?: string;
};

type FieldErrors = Partial<Record<"businessName" | "supportEmail" | "phone", string>>;

const settingTabs = [
  { href: "/settings/general", label: "General" },
  { href: "/settings/payment", label: "Payments" },
];

export function SettingsHome() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="CONFIGURATION" title="Business settings" description="Configure the details used across your restaurant workspace." backHref="/dashboard" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {settingTabs.map((tab) => <Link key={tab.href} href={tab.href} className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card transition hover:border-[var(--primary)]"><h2 className="font-semibold">{tab.label}</h2><p className="mt-2 text-sm text-[var(--muted)]">{tab.label === "General" ? "Business profile, contact details and locale." : "Payment provider and account configuration."}</p><span className="mt-4 inline-flex text-sm font-semibold text-[var(--primary)]">Manage {tab.label.toLowerCase()}</span></Link>)}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SettingsWorkspace({ section }: { section: "general" | "payment" }) {
  const [settings, setSettings] = useStorageValue<SettingsData>(STORAGE_KEYS.settings, {});
  const [draft, setDraft] = useState<SettingsData>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isGeneral = section === "general";

  function value<K extends keyof SettingsData>(key: K, fallback: NonNullable<SettingsData[K]>): NonNullable<SettingsData[K]> {
    return (draft[key] ?? settings[key] ?? fallback) as NonNullable<SettingsData[K]>;
  }

  function update(key: keyof SettingsData, next: string | boolean) {
    setDraft((current) => ({ ...current, [key]: next }));
    setSaved(false);
    setError("");
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    if (isGeneral) {
      const businessName = value("businessName", "My Restaurant").trim();
      const supportEmail = value("supportEmail", "support@example.com").trim();
      const phone = value("phone", "").trim();

      const nextErrors: FieldErrors = {};

      if (!businessName) nextErrors.businessName = "Please enter the business name.";
      if (!supportEmail) nextErrors.supportEmail = "Please enter the support email.";
      if (!phone) nextErrors.phone = "Please enter the contact number.";

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        setError("");
        setSaved(false);
        return;
      }

      if (!isValidEmail(supportEmail)) {
        setFieldErrors({ supportEmail: "Please enter a valid support email address." });
        setError("");
        setSaved(false);
        return;
      }

      if (!isValidMobileNumber(phone)) {
        setFieldErrors({ phone: "Contact number must be exactly 10 digits." });
        setError("");
        setSaved(false);
        return;
      }
    }

    setSettings({ ...settings, ...draft });
    setSaved(true);
    setError("");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="CONFIGURATION" title="Business settings" description="Manage the defaults used by your restaurant workspace." backHref="/settings" />
        <nav aria-label="Settings sections" className="flex gap-6 overflow-x-auto border-b border-[var(--border)]">
          {settingTabs.map((tab) => <Link key={tab.href} href={tab.href} className={`shrink-0 border-b-2 px-1 py-3 text-sm font-semibold ${section === (tab.href.endsWith("general") ? "general" : "payment") ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"}`}>{tab.label}</Link>)}
        </nav>
        <form noValidate onSubmit={submit} className="space-y-6 rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-7">
          <div>
            <h2 className="font-semibold">{isGeneral ? "Business profile" : "Payment provider"}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{isGeneral ? "These details appear on receipts and guest communications." : "Connect payment processing for online and in-person orders."}</p>
          </div>
          {isGeneral ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="Business name" name="businessName" value={value("businessName", "My Restaurant")} onChange={(event) => update("businessName", event.target.value)} error={fieldErrors.businessName} required />
              <Input label="Support email" name="supportEmail" type="email" value={value("supportEmail", "support@example.com")} onChange={(event) => update("supportEmail", event.target.value)} error={fieldErrors.supportEmail} required />
              <Input label="Contact number" name="phone" type="tel" inputMode="numeric" maxLength={10} value={value("phone", "")} onChange={(event) => update("phone", normalizeMobileNumber(event.target.value))} error={fieldErrors.phone} required />
              <Select label="Timezone" value={value("timezone", "Asia/Kolkata")} onChange={(event) => update("timezone", event.target.value)} options={[{ value: "Asia/Kolkata", label: "India Standard Time (IST)" }, { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" }, { value: "UTC", label: "UTC" }]} />
              <Select label="Currency" value={value("currency", "INR")} onChange={(event) => update("currency", event.target.value)} options={[{ value: "INR", label: "INR · Indian Rupee" }, { value: "USD", label: "USD · US Dollar" }, { value: "AED", label: "AED · UAE Dirham" }]} />
            </div>
          ) : (
            <div className="space-y-5">
              <label className="flex min-h-12 items-center gap-3 rounded-lg border border-[var(--border)] px-4"><input type="checkbox" checked={value("paymentsEnabled", false)} onChange={(event) => update("paymentsEnabled", event.target.checked)} className="admin-checkbox" /><span className="text-sm font-medium">Accept digital payments</span></label>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Select label="Provider" value={value("paymentProvider", "razorpay")} onChange={(event) => update("paymentProvider", event.target.value)} options={[{ value: "razorpay", label: "Razorpay" }, { value: "stripe", label: "Stripe" }, { value: "cash", label: "Cash only" }]} />
                <Input label="Merchant account ID" value={value("merchantId", "")} onChange={(event) => update("merchantId", event.target.value)} placeholder="Enter your merchant ID" />
              </div>
              <p className="text-xs text-[var(--muted)]">Secret keys are intentionally not stored in this browser-only demo.</p>
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p role={error ? "alert" : "status"} className={`text-sm ${error ? "text-red-600" : "text-[var(--success)]"}`}>{error || (saved ? "Settings saved in this browser." : "")}</p>
            <Button type="submit">Save settings</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
