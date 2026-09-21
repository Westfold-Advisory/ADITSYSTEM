import { GitBranch, List, Network } from "lucide-react";

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
  return (
    <nav className="personas-view-nav" aria-label="Vistas de personas">
      <p className="personas-view-nav__heading">Vistas</p>
      <ul className="personas-view-nav__list">
        {VIEWS.map((view) => (
          <li key={view.value}>
            <button
              type="button"
              className="personas-view-nav__link"
              aria-current={value === view.value ? "page" : undefined}
              onClick={() => onChange(view.value)}
            >
              <view.Icon
                size={16}
                className="personas-view-nav__icon"
                aria-hidden
              />
              <span>{view.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
