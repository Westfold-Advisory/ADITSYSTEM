import { Button } from "@/components/ui/button";
import { ADMIN_NAV_LINKS, adminNavIsActive } from "@/lib/admin-nav";
import { normalizePathname } from "@/lib/routing";

export function AdminNav() {
  const current = normalizePathname(window.location.pathname);
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Administración">
      {ADMIN_NAV_LINKS.map((link) => (
        <Button
          key={link.href}
          variant={adminNavIsActive(current, link.href) ? "default" : "outline"}
          onClick={() => {
            if (!adminNavIsActive(current, link.href)) {
              window.location.assign(link.href);
            }
          }}
        >
          {link.label}
        </Button>
      ))}
    </nav>
  );
}
