const VIEWS = [
  { value: "listado" as const, label: "Listado" },
  { value: "arbol" as const, label: "Árbol y detalle" },
  { value: "organigrama" as const, label: "Organigrama" },
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
              {view.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
