
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { branding } from "@/lib/branding";
import {
  BookOpen,
  Building2,
  LayoutDashboard,
  MapPinHouse,
  Palette,
  QrCode,
  ReceiptText,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

type StaffType = "POS Staff" | "User Staff";

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
  permissions: Permission[];
};

type Staff = {
  id: string;
  name?: string;
  role?: string;
  staffType?: StaffType;
};

type CurrentUser = {
  id?: string;
  staffId?: string;
  name?: string;
  role?: string;
  staffType?: StaffType;
};

const menuGroups = [
  {
    title: "ANALYTICS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Brands", href: "/brands", icon: Building2 },
      { label: "Restaurants", href: "/restaurants", icon: MapPinHouse },
      { label: "Theme", href: "/theme", icon: Palette },
      { label: "Staff", href: "/staff", icon: UsersRound },
      { label: "Roles", href: "/roles", icon: ShieldCheck, permissionLabels: ["Role"] },
    ],
  },
  {
    title: "RESTAURANT OPERATIONS",
    items: [
      { label: "Menu", href: "/menu", icon: BookOpen, permissionLabels: ["Menu Management"] },
      { label: "Orders", href: "/orders", icon: ReceiptText },
      { label: "Tables & QR", href: "/tables", icon: QrCode },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { label: "Business Settings", href: "/settings", icon: Settings2 },
    ],
  },
];

const storageKeys = {
  roles: "posadmin_roles",
  staff: "posadmin_staff",
  currentUser: "posadmin_current_user",
};

type SidebarProps = {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
};

export default function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const [allowedMenus, setAllowedMenus] = useState<string[] | null>(null);

  useEffect(() => {
    function loadPermissions() {
      try {
        const currentUserText = localStorage.getItem(
          storageKeys.currentUser
        );

        // Until a staff session is configured, keep the existing demo UI.
        if (!currentUserText) {
          setAllowedMenus(null);
          return;
        }

        const currentUser = JSON.parse(currentUserText) as CurrentUser;
        const staffText = localStorage.getItem(storageKeys.staff) || "[]";
        const rolesText = localStorage.getItem(storageKeys.roles) || "[]";

        const staffList = JSON.parse(staffText) as Staff[];
        const roleList = JSON.parse(rolesText) as Role[];

        const staffId = currentUser.staffId || currentUser.id;

        const staff = staffList.find((item) => item.id === staffId);

        const staffType = currentUser.staffType || staff?.staffType;
        const roleName = currentUser.role || staff?.role;

        if (!staffType || !roleName) {
          setAllowedMenus([]);
          return;
        }

        const role = roleList.find(
          (item) =>
            item.staffType === staffType &&
            item.name.trim().toLowerCase() ===
              roleName.trim().toLowerCase()
        );

        if (!role) {
          setAllowedMenus(null);
          return;
        }

        const permitted = new Set(
          role.permissions
            .filter((permission) => permission.view)
            .map((permission) => permission.module)
        );

        setAllowedMenus([...permitted]);
      } catch (error) {
        console.error("Unable to load sidebar permissions:", error);
        setAllowedMenus([]);
      }
    }

    loadPermissions();

    window.addEventListener("storage", loadPermissions);

    return () => {
      window.removeEventListener("storage", loadPermissions);
    };
  }, []);

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(`${href}/`))
    );
  }

  function navigate(href: string) {
    onNavigate(href);
    onClose();
  }

  function menuClass(active: boolean) {
    return `group flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors ${
      active
        ? "bg-[var(--primary)] font-semibold text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-50 hover:text-[var(--foreground)]"
    }`;
  }

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items:
        allowedMenus === null
          ? group.items
          : group.items.filter((item) =>
              allowedMenus.includes(item.label) ||
              item.permissionLabels?.some((label) => allowedMenus.includes(label)) ||
              (item.label === "Brands" && allowedMenus.includes("Restaurants")) ||
              (item.label === "Restaurants" && allowedMenus.includes("Branches"))
            ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border)] bg-white transition-[width,transform] duration-200 lg:translate-x-0 ${
          isCollapsed ? "w-[260px] lg:w-[76px]" : "w-[260px]"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--border)] ${isCollapsed ? "px-3" : "px-5"}`}>
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.defaultName}
              className="max-h-12 max-w-[200px] object-contain object-left"
            />
          ) : (
            <span className={`flex flex-col leading-tight ${isCollapsed ? "lg:items-center" : ""}`}>
              <span className="text-lg font-bold text-[var(--primary)]">
                <span className={isCollapsed ? "lg:hidden" : ""}>{branding.defaultName.toUpperCase()}</span>
                {isCollapsed && <span className="hidden lg:inline">A</span>}
              </span>
              <span className={`mt-1 text-[9px] font-semibold tracking-[0.16em] text-[var(--muted)] ${isCollapsed ? "lg:hidden" : ""}`}>
                MASTER PANEL
              </span>
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse sidebar"
            title="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14.5 5L7.5 12L14.5 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 5V19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto ${isCollapsed ? "p-2 lg:p-2" : "p-3"}`}>
          {visibleGroups.map((group) => (
            <div key={group.title} className="pt-2">
              <p
                className={`mb-4 px-4 tracking-[0.16em] text-gray-500 ${isCollapsed ? "lg:hidden" : ""}`}
                style={{
                  fontSize: "var(--sidebar-group-font-size)",
                  fontWeight: 700,
                }}
              >
                {group.title}
              </p>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigate(item.href)}
                    style={{
                      fontSize: "var(--sidebar-item-font-size)",
                      fontWeight: "var(--sidebar-item-font-weight)",
                    }}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    aria-label={isCollapsed ? item.label : undefined}
                    className={`${menuClass(isActive(item.href))} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={`h-6 w-6 shrink-0 ${isActive(item.href) ? "text-white" : "text-slate-500 group-hover:text-[var(--primary)]"}`}
                      strokeWidth={1.8}
                    />
                    <span className={isCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
