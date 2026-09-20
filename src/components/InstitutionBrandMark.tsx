import * as React from "react";
import type { InstitutionTheme } from "@/config/institution";

void React;

export type InstitutionBrandMarkProps = {
  institution: InstitutionTheme;
  /** Clase del contenedor (marca en barra o cabecera de login). */
  className?: string;
  /** Clase del logotipo cuando existe URL. */
  logoClassName?: string;
  /** Clase del nombre de producto. */
  productClassName?: string;
  /** Si false, no muestra el nombre de producto (solo logo). */
  showProductName?: boolean;
};

export function InstitutionBrandMark({
  institution,
  className,
  logoClassName = "institution-brand__logo",
  productClassName = "institution-brand__product",
  showProductName = true,
}: InstitutionBrandMarkProps) {
  return (
    <span className={className ?? "institution-brand"}>
      {institution.logoUrl ? (
        <img
          className={logoClassName}
          src={institution.logoUrl}
          alt={institution.logoAlt}
          width={120}
          height={40}
          decoding="async"
        />
      ) : null}
      {showProductName ? (
        <span className={productClassName}>{institution.productName}</span>
      ) : null}
    </span>
  );
}
