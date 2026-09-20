import { useCallback, useState } from "react";

import type { LoginResponse } from "@/api/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { roleLabel } from "@/components/admin/person-display";
import { DomainAdminPage } from "@/components/DomainAdminPage";
import { LoginPage } from "@/components/LoginPage";
import { PublicAppShell } from "@/components/PublicAppShell";
import { UnauthorizedRoleScreen } from "@/components/UnauthorizedRoleScreen";
import { getInstitutionConfig } from "@/config/institution";
import {
  clearAdminSession,
  isAdminSessionExpired,
  persistAdminSession,
  readAdminSession,
  type AdminSession,
} from "@/lib/admin-session";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";
import { capabilitiesFor } from "@/lib/capabilities";

function loadAdminSession(): {
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

export function AdminStructurePage() {
  const institution = getInstitutionConfig();
  const [loginNotice, setLoginNotice] = useState<string | null>(() => {
    return loadAdminSession().expiredNotice;
  });
  const [session, setSession] = useState<LoginResponse | null>(() => {
    return loadAdminSession().session;
  });

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

  if (!session) {
    return (
      <PublicAppShell>
        <LoginPage initialNotice={loginNotice} onLogin={login} />
      </PublicAppShell>
    );
  }

  const capabilities = capabilitiesFor(session.user.rol);
  if (!capabilities.canViewStructure) {
    return (
      <UnauthorizedRoleScreen roleLabel={session.user.rol} onSignOut={logout} />
    );
  }

  return (
    <main className="admin-page hierarchy-page">
      <AdminPageHeader
        eyebrow={institution.productName}
        title="Estructura de personas"
        subtitle={
          <>
            {session.user.email} · alcance {roleLabel(session.user.rol)}
          </>
        }
        onSignOut={logout}
      />
      <DomainAdminPage session={session} />
    </main>
  );
}
