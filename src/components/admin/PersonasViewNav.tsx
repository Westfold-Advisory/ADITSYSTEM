import { ChevronDown, GitBranch, List, Network } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { useAdminSidebarCompact } from "@/components/admin/admin-sidebar-context";

const VIEWS = [
  { value: "listado" as const, label: "Listado", Icon: List },
  { value: "arbol" as const, label: "Árbol y detalle", Icon: GitBranch },
  { value: "organigrama" as const, label: "Organigrama", Icon: Network },
];

export type PersonasStructureView = (typeof VIEWS)[number]["value"];

export function PersonasViewNav({
  value,
  onChange,
}: {
  value: PersonasStructureView;
  onChange: (view: PersonasStructureView) => void;
}) {
  const compact = useAdminSidebarCompact();
  const current = VIEWS.find((view) => view.value === value) ?? VIEWS[0]!;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="personas-view-nav__trigger"
          aria-label={compact ? `Vista: ${current.label}` : undefined}
          title={compact ? current.label : undefined}
        >
          <current.Icon
            size={16}
            className="personas-view-nav__icon"
            aria-hidden
          />
          {!compact ? (
            <>
              <span className="personas-view-nav__label">{current.label}</span>
              <ChevronDown
                size={14}
                className="personas-view-nav__chevron"
                aria-hidden
              />
            </>
          ) : null}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="personas-view-nav__menu"
          align="start"
          side={compact ? "right" : "bottom"}
          sideOffset={4}
        >
          {VIEWS.map((view) => (
            <DropdownMenu.Item
              key={view.value}
              className="personas-view-nav__menu-item"
              data-active={value === view.value ? "true" : undefined}
              onSelect={() => onChange(view.value)}
            >
              <view.Icon
                size={16}
                className="personas-view-nav__icon"
                aria-hidden
              />
              {view.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
