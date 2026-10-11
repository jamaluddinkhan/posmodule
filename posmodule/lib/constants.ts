export const STORAGE_KEYS = {
  restaurants: "posadmin_restaurants",
  branches: "posadmin_branches",
  staff: "posadmin_staff",
  roles: "posadmin_roles",
  menuItems: "posadmin_menu_items",
  menuCategories: "posadmin_menu_categories",
  orders: "posadmin_orders",
  tables: "posadmin_tables",
  settings: "posadmin_settings",
  theme: "posadmin_theme",
} as const;

export const ADMIN_MODULES = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Brands", href: "/brands" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Theme", href: "/theme" },
  { label: "Staff", href: "/staff" },
  { label: "Roles", href: "/roles" },
  { label: "Menu Management", href: "/menu" },
  { label: "Orders", href: "/orders" },
  { label: "Tables & QR", href: "/tables" },
  { label: "Business Settings", href: "/settings" },
] as const;
