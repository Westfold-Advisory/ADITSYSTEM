import * as React from "react";
import type { InstitutionTheme } from "@/config/institution";

void React;

export type InstitutionDeploymentIdentityProps = {
  institution: InstitutionTheme;
  className?: string;
  nameClassName?: string;
  taglineClassName?: string;
};

/** Nombre de la institución desplegada y etiqueta de entorno (configuración, no hardcode). */
export function InstitutionDeploymentIdentity({
  institution,
  className = "institution-deployment-identity",
  nameClassName = "institution-deployment-identity__name",
  taglineClassName = "institution-deployment-identity__tagline",
}: InstitutionDeploymentIdentityProps) {
  return (
    <div className={className}>
      <p className={nameClassName}>{institution.institutionName}</p>
      {institution.environmentTagline ? (
        <p className={taglineClassName}>{institution.environmentTagline}</p>
      ) : null}
    </div>
  );
}
