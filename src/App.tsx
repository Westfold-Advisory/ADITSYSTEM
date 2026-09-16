import { MapPage } from "./components/MapPage";
import { PublicEventsPage } from "./components/PublicEventsPage";
import { AdminEventsPage } from "./components/AdminEventsPage";
import "./App.css";

export default function App() {
  const hash = window.location.hash;
  if (hash.startsWith("#/admin")) return <AdminEventsPage />;
  if (hash.startsWith("#/eventos")) return <PublicEventsPage />;
  return <MapPage />;
}
