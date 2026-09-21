import * as React from "react";

void React;

import { getInstitutionConfig } from "@/config/institution";
import { FORBIDDEN_ROLE_MESSAGE } from "@/lib/auth-messages";
import { roleLabel } from "@/lib/role-label";
import type { AuthenticatedRole } from "@/types/domain";
import { PublicAppShell } from "./PublicAppShell";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";

export type UnauthorizedRoleScreenProps = {
  role?: AuthenticatedRole;
  onSignOut: () => void;
};

export function UnauthorizedRoleScreen({
  role,
  onSignOut,
}: UnauthorizedRoleScreenProps) {
  const institution = getInstitutionConfig();

  return (
    <PublicAppShell>
      <div className="login-page">
        <Card className="login-page__card">
          <header className="login-page__header">
            <p className="login-page__product">{institution.productName}</p>
            <h1 className="login-page__title">Acceso no autorizado</h1>
          </header>
          <Alert tone="warning" title="Permisos insuficientes">
            {FORBIDDEN_ROLE_MESSAGE}
            {role ? (
              <p className="login-page__intro">
                Rol de la sesión: <strong>{roleLabel(role)}</strong>
              </p>
            ) : null}
          </Alert>
          <Button className="login-page__submit" onClick={onSignOut}>
            Cerrar sesión
          </Button>
        </Card>
      </div>
    </PublicAppShell>
  );
}
