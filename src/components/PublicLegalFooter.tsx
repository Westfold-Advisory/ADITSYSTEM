import * as React from "react";

void React;

import {
  getInstitutionConfig,
  type FooterSegment,
  type InstitutionTheme,
} from "@/config/institution";

export type PublicLegalFooterProps = {
  institution?: InstitutionTheme;
};

function renderSegment(segment: FooterSegment, index: number) {
  if (segment.type === "link") {
    return (
      <a key={`${segment.href}-${index}`} href={segment.href}>
        {segment.label}
      </a>
    );
  }
  return (
    <span
      key={`${segment.label}-${index}`}
      className="public-legal-footer__text"
    >
      {segment.label}
    </span>
  );
}

export function PublicLegalFooter({
  institution: institutionOverride,
}: PublicLegalFooterProps = {}) {
  const institution = institutionOverride ?? getInstitutionConfig();
  const { contact, footer } = institution;

  return (
    <footer className="public-legal-footer" role="contentinfo">
      <nav aria-label="Enlaces secundarios">
        {footer.segments.map((segment, index) => (
          <span
            key={`footer-seg-${index}`}
            className="public-legal-footer__segment"
          >
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            {renderSegment(segment, index)}
          </span>
        ))}
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
      {footer.copyright ? (
        <p className="public-legal-footer__copyright">{footer.copyright}</p>
      ) : null}
    </footer>
  );
}
