import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DomainAdminPage } from "@/components/DomainAdminPage";
import { LoginPage } from "@/components/LoginPage";
import { PublicAppShell } from "@/components/PublicAppShell";
import { UnauthorizedRoleScreen } from "@/components/UnauthorizedRoleScreen";
import { getInstitutionConfig } from "@/config/institution";
import { adminUiCopy } from "@/content/admin-ui-es";
import { useAdminSessionGate } from "@/hooks/useAdminSessionGate";
import { adminPageTitle } from "@/lib/admin-nav";
import { capabilitiesFor } from "@/lib/capabilities";

export function AdminStructurePage() {
  const institution = getInstitutionConfig();
  const { session, loginNotice, login, logout, handleUnauthorized } =
    useAdminSessionGate();

  if (!session) {
    return (
      <PublicAppShell variant="auth">
        <LoginPage initialNotice={loginNotice} onLogin={login} />
      </PublicAppShell>
    );
  }

  const capabilities = capabilitiesFor(session.user.rol);
  if (!capabilities.canViewStructure) {
    return (
      <UnauthorizedRoleScreen role={session.user.rol} onSignOut={logout} />
    );
  }

  return (
    <main className="admin-console-page hierarchy-page">
      <DomainAdminPage
        session={session}
        onSignOut={logout}
        onSessionExpired={handleUnauthorized}
        pageHeader={
          <AdminPageHeader
            eyebrow={institution.productName}
            title={adminPageTitle("/admin/personas")}
            subtitle={adminUiCopy.personas.pageSubtitle}
            onSignOut={logout}
            showModuleNav={false}
            showSignOut={false}
            showEyebrow={false}
          />
        }
      />
    </main>
  );
}
