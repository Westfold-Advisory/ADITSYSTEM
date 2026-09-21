import { useEffect, useState } from "react";

import { MapPage } from "./components/MapPage";
import { PublicEventsPage } from "./components/PublicEventsPage";
import { AdminEventsPage } from "./components/AdminEventsPage";
import { AdminCoverageMapPage } from "./components/AdminCoverageMapPage";
import { AdminStructurePage } from "./components/AdminStructurePage";
import { LoginPage } from "./components/LoginPage";
import { LegalNoticePage } from "./components/LegalNoticePage";
import { PrivacyNoticePage } from "./components/PrivacyNoticePage";
import { PublicAppShell } from "./components/PublicAppShell";
import { persistAdminSession } from "./lib/admin-session";
import { privacyNoticeKindFromPath } from "./lib/public-routes";
import { normalizePathname } from "./lib/routing";
import "./App.css";
import "./styles/admin-layout.css";
import "./styles/person-drawer.css";
import "./components/MapPage.css";
import "./components/LoginPage.css";
import "./components/PublicAppShell.css";

function pathname(): string {
  const legacyPath = window.location.hash.slice(1);
  if (legacyPath.startsWith("/")) return legacyPath;
  return normalizePathname(window.location.pathname);
}

function NotFoundPage() {
  return (
    <div className="not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">404</p>
      <h1 id="not-found-title">Página no encontrada</h1>
      <p>La ruta solicitada no está disponible.</p>
      <a href="/eventos">Ir a eventos públicos</a>
    </div>
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

  if (currentPath === "/" || currentPath === "/login") {
    return (
      <PublicAppShell variant="auth">
        <LoginPage
          onLogin={(session) => {
            persistAdminSession(session);
            window.location.assign("/admin");
          }}
        />
      </PublicAppShell>
    );
  }
  if (currentPath === "/admin") return <AdminEventsPage />;
  if (currentPath === "/admin/mapa") return <AdminCoverageMapPage />;
  if (currentPath === "/admin/personas") return <AdminStructurePage />;
  if (currentPath === "/eventos") {
    return (
      <PublicAppShell currentPath="/eventos">
        <PublicEventsPage />
      </PublicAppShell>
    );
  }
  if (currentPath === "/mapa") {
    return (
      <PublicAppShell currentPath="/mapa">
        <MapPage />
      </PublicAppShell>
    );
  }
  const privacyKind = privacyNoticeKindFromPath(currentPath);
  if (privacyKind) {
    return (
      <PublicAppShell>
        <PrivacyNoticePage kind={privacyKind} />
      </PublicAppShell>
    );
  }
  if (currentPath === "/aviso-legal") {
    return (
      <PublicAppShell>
        <LegalNoticePage />
      </PublicAppShell>
    );
  }
  return (
    <PublicAppShell>
      <NotFoundPage />
    </PublicAppShell>
  );
}
