import type { LoginResponse } from "@/api/auth";

export const ADMIN_SESSION_STORAGE_KEY = "adit.admin.session";

export function readAdminSession(): LoginResponse | null {
  try {
    const value = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return value ? (JSON.parse(value) as LoginResponse) : null;
  } catch {
    return null;
  }
}

export function persistAdminSession(session: LoginResponse): void {
  sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}
