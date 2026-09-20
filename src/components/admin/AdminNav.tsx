import { ADMIN_NAV_LINKS, adminNavIsActive } from "@/lib/admin-nav";
import { normalizePathname } from "@/lib/routing";

export function AdminNav() {
  const current = normalizePathname(window.location.pathname);
  return (
    <nav className="admin-nav-tabs" aria-label="Administración">
      {ADMIN_NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="admin-nav-tabs__tab"
          aria-current={
            adminNavIsActive(current, link.href) ? "page" : undefined
          }
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
