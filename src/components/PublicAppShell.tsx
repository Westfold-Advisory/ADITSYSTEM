import * as React from "react";
import type { ReactNode } from "react";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";

void React;

import {
  getInstitutionConfig,
  type InstitutionTheme,
} from "@/config/institution";
import { InstitutionBrandMark } from "./InstitutionBrandMark";
import { PublicLegalFooter } from "./PublicLegalFooter";
import { AppBar, Navigation } from "./ui/AppBar";

export type PublicNavPath = "/eventos" | "/mapa";

export type PublicAppShellVariant = "public" | "auth";

export type PublicAppShellProps = {
  /** Ruta pública activa para `aria-current` en la navegación. */
  currentPath?: PublicNavPath;
  /**
   * `public`: navegación de visitante (eventos, mapa, login).
   * `auth`: barra mínima en `/login` — marca + enlace a eventos públicos.
   */
  variant?: PublicAppShellVariant;
  /** Override de tema (p. ej. pruebas); por defecto `getInstitutionConfig()`. */
  institution?: InstitutionTheme;
  /** Destino del enlace de marca. */
  brandHref?: string;
  footer?: ReactNode;
  children: ReactNode;
};

const MAIN_CONTENT_ID = "public-main-content";

export function PublicAppShell({
  currentPath,
  variant = "public",
  institution: institutionOverride,
  brandHref = "/eventos",
  footer,
  children,
}: PublicAppShellProps) {
  const institution = institutionOverride ?? getInstitutionConfig();
  const isAuthShell = variant === "auth";

  return (
    <div
      className={
        isAuthShell
          ? "public-app-shell public-app-shell--auth"
          : "public-app-shell"
      }
    >
      <a className="public-app-shell__skip-link" href={`#${MAIN_CONTENT_ID}`}>
        Saltar al contenido principal
      </a>
      <AppBar
        className="public-app-shell__app-bar"
        brand={
          <a
            className="public-app-shell__brand"
            href={brandHref}
            aria-label={institution.productName}
          >
            <InstitutionBrandMark
              institution={institution}
              className="public-app-shell__brand-mark"
              logoClassName="public-app-shell__brand-logo"
              productClassName="public-app-shell__brand-label"
              showProductName={false}
            />
            <span
              className="public-app-shell__brand-label public-app-shell__brand-label--full"
              aria-hidden="true"
            >
              {institution.productName}
            </span>
            <span
              className="public-app-shell__brand-label public-app-shell__brand-label--short"
              aria-hidden="true"
            >
              {institution.productShortName}
            </span>
          </a>
        }
        actions={
          isAuthShell ? (
            <a className="public-app-shell__public-return" href="/eventos">
              <ArrowLeft
                aria-hidden="true"
                className="public-app-shell__icon"
              />
              Eventos públicos
            </a>
          ) : (
            <a
              className="public-app-shell__auth-action"
              href="/login"
              aria-label="Personal autorizado"
            >
              <ShieldCheck
                aria-hidden="true"
                className="public-app-shell__icon"
              />
              <span
                className="public-app-shell__auth-action-label"
                aria-hidden="true"
              >
                Personal autorizado
              </span>
            </a>
          )
        }
      >
        {!isAuthShell && (
          <Navigation className="public-app-shell__nav public-app-shell__nav-segment">
            <a
              href="/eventos"
              aria-current={currentPath === "/eventos" ? "page" : undefined}
            >
              Eventos
            </a>
            <a
              href="/mapa"
              aria-current={currentPath === "/mapa" ? "page" : undefined}
            >
              <MapPin aria-hidden="true" className="public-app-shell__icon" />
              Mapa
            </a>
          </Navigation>
        )}
      </AppBar>
      <main
        id={MAIN_CONTENT_ID}
        className="public-app-shell__main"
        tabIndex={-1}
      >
        {children}
      </main>
      {footer ?? <PublicLegalFooter institution={institution} />}
    </div>
  );
}
