import { PublicEventsPage } from "./components/PublicEventsPage";
import { AdminEventsPage } from "./components/AdminEventsPage";
import "./App.css";

export default function App() {
  return window.location.hash.startsWith("#/admin") ? (
    <AdminEventsPage />
  ) : (
    <PublicEventsPage />
  );
}
