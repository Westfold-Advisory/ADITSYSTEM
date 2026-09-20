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
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="admin-header__tools">
          <AdminNav />
          {actions}
          <Button type="button" variant="outline" size="sm" onClick={onSignOut}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
