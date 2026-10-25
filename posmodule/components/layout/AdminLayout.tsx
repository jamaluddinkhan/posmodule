
"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { DEMO_SESSION_KEY, isDemoLoggedIn } from "@/lib/auth";
import { subscribeStorage } from "@/lib/storage";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    (notify) => subscribeStorage(DEMO_SESSION_KEY, notify),
    isDemoLoggedIn,
    () => false
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function toggleNavigation() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarCollapsed((collapsed) => !collapsed);
      return;
    }

    setSidebarOpen(true);
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <Header onMenuClick={toggleNavigation} sidebarCollapsed={sidebarCollapsed} />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(href) => router.push(href)}
      />

      <main className={`w-full min-w-0 px-3 py-4 transition-[margin] duration-200 sm:px-6 lg:w-auto lg:py-6 ${sidebarCollapsed ? "lg:ml-[76px] lg:pl-7 lg:pr-7" : "lg:ml-[260px] lg:pl-7 lg:pr-7"}`}>
        <div className="mx-auto w-full max-w-[1600px] min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
