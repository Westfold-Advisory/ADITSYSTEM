import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  onSignOut,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  onSignOut: () => void;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-header">
      <div className="admin-header__band">
        <div className="admin-header__lead">
          <p className="eyebrow admin-header__eyebrow">{eyebrow}</p>
          <div className="admin-header__title-row">
            <h1>{title}</h1>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="admin-header__sign-out"
              onClick={onSignOut}
            >
              Cerrar sesión
            </Button>
          </div>
          <p className="admin-header__meta">{subtitle}</p>
        </div>
        <div className="admin-header__tools">
          <AdminNav />
          {actions}
        </div>
      </div>
    </header>
  );
}
