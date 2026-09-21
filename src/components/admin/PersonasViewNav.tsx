import {
  ORGANIZATION_STRUCTURE_VIEWS,
  type PersonasStructureView,
} from "@/components/admin/organization-structure-views";

/**
 * Tab bar L2 del canvas (bajo el título de página): cambia la vista de
 * Personas sin depender del sidebar. Única fuente de verdad de la vista activa.
 */
export function PersonasViewNav({
  value,
  onChange,
}: {
  value: PersonasStructureView;
  onChange: (view: PersonasStructureView) => void;
}) {
  return (
    <nav className="admin-view-tabs" aria-label="Vistas de Personas">
      <ul className="admin-nav-tabs__list">
        {ORGANIZATION_STRUCTURE_VIEWS.map((view) => (
          <li key={view.value}>
            <button
              type="button"
              className="admin-nav-tabs__tab admin-view-tabs__tab"
              aria-current={value === view.value ? "page" : undefined}
              onClick={() => onChange(view.value)}
            >
              <view.Icon
                size={16}
                className="admin-view-tabs__icon"
                aria-hidden="true"
              />
              <span>{view.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
