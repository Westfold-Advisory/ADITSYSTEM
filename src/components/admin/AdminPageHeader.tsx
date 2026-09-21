import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  onSignOut,
  actions,
  showModuleNav = true,
}: {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  onSignOut: () => void;
  actions?: ReactNode;
  /** Oculta tabs horizontales cuando la navegación vive en el sidebar (AppShell admin). */
  showModuleNav?: boolean;
}) {
  return (
    <header className="admin-header">
      <div className="admin-header__band">
        <div className="admin-header__identity">
          <p className="eyebrow admin-header__eyebrow">{eyebrow}</p>
          <h1 className="admin-header__title">{title}</h1>
          <p className="admin-header__meta">{subtitle}</p>
        </div>
        <div className="admin-header__session">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="admin-header__sign-out"
            onClick={onSignOut}
            aria-label="Cerrar sesión"
          >
            <span className="admin-header__sign-out-label">Cerrar sesión</span>
            <span
              className="admin-header__sign-out-label--short"
              aria-hidden="true"
            >
              Salir
            </span>
          </Button>
        </div>
        <div className="admin-header__nav-row">
          {showModuleNav ? <AdminNav /> : null}
          {actions ? (
            <div className="admin-header__page-actions">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
