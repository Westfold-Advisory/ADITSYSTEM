import * as React from "react";

void React;

import {
  getInstitutionConfig,
  type InstitutionTheme,
} from "@/config/institution";

export type PublicLegalFooterProps = {
  institution?: InstitutionTheme;
};

export function PublicLegalFooter({
  institution: institutionOverride,
}: PublicLegalFooterProps = {}) {
  const institution = institutionOverride ?? getInstitutionConfig();
  const { legal, contact, institutionName, productName } = institution;
  const year = new Date().getFullYear();

  return (
    <footer className="public-legal-footer" role="contentinfo">
      <nav aria-label="Enlaces secundarios">
        <a href="/mapa">Mapa</a>
        <span aria-hidden="true">·</span>
        <a href={legal.privacyIntegralPath}>Aviso de privacidad</a>
        <span aria-hidden="true">·</span>
        <a href={legal.privacySummaryPath}>Resumen de privacidad</a>
        {legal.termsOfUsePath ? (
          <>
            <span aria-hidden="true">·</span>
            <a href={legal.termsOfUsePath}>Términos de uso</a>
          </>
        ) : null}
      </nav>
      {contact.email || contact.phone ? (
        <p className="public-legal-footer__contact">
          {contact.email ? (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          ) : null}
          {contact.email && contact.phone ? (
            <span aria-hidden="true"> · </span>
          ) : null}
          {contact.phone ? (
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
              {contact.phone}
            </a>
          ) : null}
        </p>
      ) : null}
      <p className="public-legal-footer__copyright">
        © {year} {institutionName}. {productName}. Todos los derechos
        reservados.
      </p>
    </footer>
  );
}
