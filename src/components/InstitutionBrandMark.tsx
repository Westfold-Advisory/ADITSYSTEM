import * as React from "react";
import type { InstitutionTheme } from "@/config/institution";

void React;

export type InstitutionBrandMarkProps = {
  institution: InstitutionTheme;
  /** Clase del contenedor (marca en barra o cabecera de login). */
  className?: string;
  /** Clase del logotipo cuando existe URL. */
  logoClassName?: string;
  /** Clase del monograma cuando no hay logotipo (fallback opcional). */
  monogramClassName?: string;
  /** Clase del nombre de producto. */
  productClassName?: string;
  /** Si false, no muestra el nombre de producto (solo logo). */
  showProductName?: boolean;
  /**
   * Si no hay `logoUrl`, muestra un monograma compacto (`productShortName`)
   * como identidad institucional mínima. Pensado para superficies persistentes
   * (p. ej. sidebar admin) donde repetir el nombre completo es redundante.
   */
  showMonogramFallback?: boolean;
};

export function InstitutionBrandMark({
  institution,
  className,
  logoClassName = "institution-brand__logo",
  monogramClassName = "institution-brand__monogram",
  productClassName = "institution-brand__product",
  showProductName = true,
  showMonogramFallback = false,
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
      ) : showMonogramFallback ? (
        <span className={monogramClassName} title={institution.productName}>
          {institution.productShortName}
        </span>
      ) : null}
      {showProductName ? (
        <span className={productClassName}>{institution.productName}</span>
      ) : null}
    </span>
  );
}
