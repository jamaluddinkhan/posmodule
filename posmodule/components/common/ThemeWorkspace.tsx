"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { STORAGE_KEYS } from "@/lib/constants";
import { useStorageValue } from "@/hooks/useStorage";

const palettes = [
  { name: "Royal blue", primary: "#0057FF", hover: "#0047D6", active: "#003DB8" },
  { name: "Forest", primary: "#147D53", hover: "#116744", active: "#0D5337" },
  { name: "Coral", primary: "#D94F45", hover: "#BD3F37", active: "#9F332D" },
  { name: "Teal", primary: "#087E8B", hover: "#066A75", active: "#055660" },
  { name: "Amber", primary: "#B66A12", hover: "#98570D", active: "#7B460A" },
];

type Palette = (typeof palettes)[number];

export default function ThemeWorkspace() {
  const [palette, setPalette] = useStorageValue<Palette>(STORAGE_KEYS.theme, palettes[0]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", palette.primary);
    document.documentElement.style.setProperty("--color-primary-hover", palette.hover);
    document.documentElement.style.setProperty("--color-primary-active", palette.active);
  }, [palette]);

  function choose(next: Palette) {
    setPalette(next);
    setSaved(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="BRANDING" title="Theme" description="Set the primary accent used throughout your admin workspace." />
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-7">
          <h2 className="text-base font-semibold">Primary color</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Changes are applied immediately and saved to this browser.</p>
          <div className="mt-5 flex flex-wrap gap-3" role="radiogroup" aria-label="Primary color">
            {palettes.map((option) => (
              <button
                key={option.name}
                type="button"
                role="radio"
                aria-checked={palette.primary === option.primary}
                aria-label={option.name}
                title={option.name}
                onClick={() => choose(option)}
                className={`h-11 w-11 rounded-full border-2 transition hover:scale-105 ${palette.primary === option.primary ? "border-[var(--foreground)] ring-2 ring-[var(--color-focus)] ring-offset-2" : "border-white shadow"}`}
                style={{ backgroundColor: option.primary }}
              />
            ))}
          </div>
          <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-sm"><span className="h-5 w-5 rounded-full" style={{ backgroundColor: palette.primary }} />{palette.name}</div>
            <Button onClick={() => setSaved(true)}>{saved ? "Saved" : "Save theme"}</Button>
          </div>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-admin-card sm:p-7">
          <h2 className="text-base font-semibold">Preview</h2>
          <div className="mt-5 flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-semibold">Master Admin</p><p className="mt-1 text-xs text-[var(--muted)]">Restaurant management workspace</p></div>
            <Button>Primary action</Button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
