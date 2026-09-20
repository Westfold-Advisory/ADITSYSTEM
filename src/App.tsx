import { useEffect, useState, type ReactNode } from "react";

import { MapPage } from "./components/MapPage";
import { PublicEventsPage } from "./components/PublicEventsPage";
import { AdminEventsPage } from "./components/AdminEventsPage";
import { PrivacyNoticePage } from "./components/PrivacyNoticePage";
import { PublicLegalFooter } from "./components/PublicLegalFooter";
import { AppBar, Navigation } from "./components/ui/AppBar";
import { privacyNoticeKindFromPath } from "./lib/public-routes";
import { normalizePathname } from "./lib/routing";
import "./App.css";

function pathname(): string {
  const legacyPath = window.location.hash.slice(1);
  if (legacyPath.startsWith("/")) return legacyPath;
  return normalizePathname(window.location.pathname);
}

function PublicShell({
  currentPath,
  children,
}: {
  currentPath?: "/eventos" | "/mapa";
  children: ReactNode;
}) {
  return (
    <div className="public-shell">
      <AppBar
        brand={
          <a className="public-brand" href="/eventos">
            ADIT SYSTEM
          </a>
        }
        actions={
          <a className="auth-action" href="/admin">
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
      {children}
      <PublicLegalFooter />
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">404</p>
      <h1 id="not-found-title">Página no encontrada</h1>
      <p>La ruta solicitada no está disponible.</p>
      <a href="/eventos">Ir a eventos públicos</a>
    </main>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    const legacyPath = window.location.hash.slice(1);
    if (legacyPath.startsWith("/")) {
      window.history.replaceState(null, "", legacyPath);
    }

    const handlePopState = () => setCurrentPath(pathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (currentPath === "/admin") return <AdminEventsPage />;
  if (currentPath === "/" || currentPath === "/eventos") {
    return (
      <PublicShell currentPath="/eventos">
        <PublicEventsPage />
      </PublicShell>
    );
  }
  if (currentPath === "/mapa") {
    return (
      <PublicShell currentPath="/mapa">
        <MapPage />
      </PublicShell>
    );
  }
  const privacyKind = privacyNoticeKindFromPath(currentPath);
  if (privacyKind) {
    return (
      <PublicShell>
        <PrivacyNoticePage kind={privacyKind} />
      </PublicShell>
    );
  }
  return <NotFoundPage />;
}
