
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const moduleTabs = {
  brands: {
    title: "Brands",
    tabs: [
      { label: "Add Brand", href: "/brands/add" },
      { label: "View Brands", href: "/brands" },
    ],
  },
  restaurants: {
    title: "Restaurants",
    tabs: [
      { label: "Add Restaurant", href: "/restaurants/add" },
      { label: "View Restaurants", href: "/restaurants" },
    ],
  },
};

type ModuleTabsProps = {
  module: "brands" | "restaurants";
};

export default function ModuleTabs({ module }: ModuleTabsProps) {
  const pathname = usePathname();
  const currentModule = moduleTabs[module];

  return (
    <nav
      aria-label={`${currentModule.title} navigation`}
      className="border-b border-[var(--border)] bg-white px-5 md:px-8"
    >
      <div className="flex min-h-[58px] flex-wrap items-center gap-x-8">
        {currentModule.tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 py-5 text-sm transition-colors ${
                isActive
                  ? "border-[var(--primary)] font-medium text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground)] hover:text-[var(--primary)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
