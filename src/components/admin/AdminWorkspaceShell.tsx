import type { ReactNode } from "react";

import type { AuthenticatedRole } from "@/types/domain";
import { getInstitutionConfig } from "@/config/institution";
import { InstitutionBrandMark } from "@/components/InstitutionBrandMark";

import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSidebarUserCard } from "@/components/admin/AdminSidebarUserCard";

export function AdminWorkspaceShell({
  children,
  subNav,
  userDisplayName,
  userEmail,
  userRole,
  onSignOut,
}: {
  children: ReactNode;
  /** Navegación local del módulo (p. ej. Listado / Árbol / Organigrama en Personas). */
  subNav?: ReactNode;
  userDisplayName: string;
  userEmail: string;
  userRole: AuthenticatedRole;
  onSignOut: () => void;
}) {
  const institution = getInstitutionConfig();

  return (
    <div className="admin-workspace-shell">
      <aside
        className="admin-workspace-sidebar"
        aria-label="Navegación de administración"
      >
        <div className="admin-workspace-sidebar__brand">
          <InstitutionBrandMark
            institution={institution}
            className="admin-workspace-sidebar__brand-mark"
            logoClassName="admin-workspace-sidebar__logo"
            productClassName="admin-workspace-sidebar__product"
            showProductName
          />
        </div>
        <div className="admin-workspace-sidebar__nav-block">
          <AdminNav orientation="vertical" />
          {subNav ? (
            <div className="admin-workspace-sidebar__sub">{subNav}</div>
          ) : null}
        </div>
        <AdminSidebarUserCard
          displayName={userDisplayName}
          email={userEmail}
          role={userRole}
          onSignOut={onSignOut}
        />
      </aside>
      <div className="admin-workspace-main">{children}</div>
    </div>
  );
}
