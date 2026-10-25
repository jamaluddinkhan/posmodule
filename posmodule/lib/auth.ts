
export const DEMO_SESSION_KEY = "posadmin_demo_session";
export const CURRENT_USER_KEY = "posadmin_current_user";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  staffType: "POS Staff" | "User Staff";
};

export function isDemoLoggedIn(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(DEMO_SESSION_KEY) === "active";
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? (JSON.parse(saved) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export function loginDemoUser(user: CurrentUser): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  localStorage.setItem(DEMO_SESSION_KEY, "active");
}

export function logoutDemoUser(): void {
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
