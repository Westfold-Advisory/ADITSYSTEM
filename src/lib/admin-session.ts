import type { LoginResponse } from "@/api/auth";

export const ADMIN_SESSION_STORAGE_KEY = "adit.admin.session";

/** Metadatos locales; el backend sigue siendo la fuente de verdad del JWT. */
export type AdminSession = LoginResponse & {
  logged_in_at?: number;
};

export function readAdminSession(): AdminSession | null {
  try {
    const value = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return value ? (JSON.parse(value) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function persistAdminSession(session: LoginResponse): void {
  const stored: AdminSession = { ...session, logged_in_at: Date.now() };
  sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(stored));
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

/** Usa `expires_in_seconds` del login; sin `logged_in_at` no se infiere expiración en cliente. */
export function isAdminSessionExpired(session: AdminSession): boolean {
  if (session.logged_in_at === undefined) return false;
  const expiresAt = session.logged_in_at + session.expires_in_seconds * 1000;
  return Date.now() >= expiresAt;
}

export function adminSessionExpiresAt(session: AdminSession): Date | null {
  if (session.logged_in_at === undefined) return null;
  return new Date(session.logged_in_at + session.expires_in_seconds * 1000);
}
