import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";

export function AdminWorkspaceShell({
  children,
  subNav,
}: {
  children: ReactNode;
  /** Navegación local del módulo (p. ej. Listado / Árbol / Organigrama en Personas). */
  subNav?: ReactNode;
}) {
  return (
    <div className="admin-workspace-shell">
      <aside
        className="admin-workspace-sidebar"
        aria-label="Navegación de administración"
      >
        <AdminNav orientation="vertical" />
        {subNav ? (
          <div className="admin-workspace-sidebar__sub">{subNav}</div>
        ) : null}
      </aside>
      <div className="admin-workspace-main">{children}</div>
    </div>
  );
}
