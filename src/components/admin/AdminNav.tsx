import { Button } from "@/components/ui/button";
import { normalizePathname } from "@/lib/routing";

const links = [
  { href: "/admin", label: "Eventos" },
  { href: "/admin/mapa", label: "Mapa de cobertura" },
] as const;

export function AdminNav({
  onOpenStructure,
}: {
  onOpenStructure?: () => void;
}) {
  const current = normalizePathname(window.location.pathname);
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Administración">
      {links.map((link) => (
        <Button
          key={link.href}
          variant={current === link.href ? "default" : "outline"}
          onClick={() => {
            if (current !== link.href) window.location.assign(link.href);
          }}
        >
          {link.label}
        </Button>
      ))}
      {onOpenStructure && (
        <Button variant="outline" onClick={onOpenStructure}>
          Estructura de personas
        </Button>
      )}
    </nav>
  );
}
