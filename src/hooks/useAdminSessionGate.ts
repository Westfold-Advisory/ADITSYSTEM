import { useCallback, useState } from "react";

import type { LoginResponse } from "@/api/auth";
import {
  clearAdminSession,
  isAdminSessionExpired,
  persistAdminSession,
  readAdminSession,
  type AdminSession,
} from "@/lib/admin-session";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

function bootstrapAdminSession(): {
  session: AdminSession | null;
  expiredNotice: string | null;
} {
  const stored = readAdminSession();
  if (!stored) return { session: null, expiredNotice: null };
  if (isAdminSessionExpired(stored)) {
    clearAdminSession();
    return { session: null, expiredNotice: SESSION_EXPIRED_MESSAGE };
  }
  return { session: stored, expiredNotice: null };
}

/** Sesión admin en sessionStorage + aviso de expiración para LoginPage. */
export function useAdminSessionGate() {
  const [boot] = useState(() => bootstrapAdminSession());
  const [loginNotice, setLoginNotice] = useState<string | null>(
    boot.expiredNotice,
  );
  const [session, setSession] = useState<LoginResponse | null>(boot.session);

  const handleUnauthorized = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setLoginNotice(SESSION_EXPIRED_MESSAGE);
  }, []);

  const login = useCallback((nextSession: LoginResponse) => {
    persistAdminSession(nextSession);
    setLoginNotice(null);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setLoginNotice(null);
  }, []);

  return { session, loginNotice, login, logout, handleUnauthorized };
}
