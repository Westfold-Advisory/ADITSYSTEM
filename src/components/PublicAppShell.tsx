import * as React from "react";
import type { ReactNode } from "react";

void React;

import { PublicLegalFooter } from "./PublicLegalFooter";
import { AppBar, Navigation } from "./ui/AppBar";

export type PublicNavPath = "/eventos" | "/mapa";

export type PublicAppShellProps = {
  /** Ruta pública activa para `aria-current` en la navegación. */
  currentPath?: PublicNavPath;
  /** Etiqueta de marca (themable por institución). */
  brandLabel?: string;
  /** Destino del enlace de marca. */
  brandHref?: string;
  footer?: ReactNode;
  children: ReactNode;
};

const MAIN_CONTENT_ID = "public-main-content";

export function PublicAppShell({
  currentPath,
  brandLabel = "ADIT SYSTEM",
  brandHref = "/eventos",
  footer,
  children,
}: PublicAppShellProps) {
  return (
    <div className="public-app-shell">
      <a className="public-app-shell__skip-link" href={`#${MAIN_CONTENT_ID}`}>
        Saltar al contenido principal
      </a>
      <AppBar
        className="public-app-shell__app-bar"
        brand={
          <a className="public-app-shell__brand" href={brandHref}>
            {brandLabel}
          </a>
        }
        actions={
          <a className="public-app-shell__auth-action" href="/login">
            Iniciar sesión
          </a>
        }
      >
        <Navigation>
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
            Mapa
          </a>
        </Navigation>
      </AppBar>
      <main
        id={MAIN_CONTENT_ID}
        className="public-app-shell__main"
        tabIndex={-1}
      >
        {children}
      </main>
      {footer ?? <PublicLegalFooter />}
    </div>
  );
}
