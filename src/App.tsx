import { useEffect, useState } from "react";

import { MapPage } from "./components/MapPage";
import { PublicEventsPage } from "./components/PublicEventsPage";
import { AdminEventsPage } from "./components/AdminEventsPage";
import "./App.css";

function pathname() {
  const legacyPath = window.location.hash.slice(1);
  if (legacyPath.startsWith("/")) return legacyPath;
  return window.location.pathname.replace(/\/+$/, "") || "/";
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
  if (currentPath === "/eventos") return <PublicEventsPage />;
  return <MapPage />;
}
