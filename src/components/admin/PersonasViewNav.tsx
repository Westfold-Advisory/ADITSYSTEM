import { useAdminSidebarCompact } from "@/components/admin/admin-sidebar-context";
import {
  ORGANIZATION_STRUCTURE_VIEWS,
  type PersonasStructureView,
} from "@/components/admin/organization-structure-views";

export function PersonasViewNav({
  value,
  onChange,
}: {
  value: PersonasStructureView;
  onChange: (view: PersonasStructureView) => void;
}) {
  const compact = useAdminSidebarCompact();

  return (
    <nav
      className={
        compact
          ? "personas-view-nav personas-view-nav--compact"
          : "personas-view-nav"
      }
      aria-label="Vistas de organización"
    >
      {!compact ? <p className="personas-view-nav__heading">Vistas</p> : null}
      <ul className="personas-view-nav__list">
        {ORGANIZATION_STRUCTURE_VIEWS.map((view) => (
          <li key={view.value}>
            <button
              type="button"
              className="personas-view-nav__link"
              aria-current={value === view.value ? "page" : undefined}
              onClick={() => onChange(view.value)}
              title={view.label}
            >
              <view.Icon
                size={16}
                className="personas-view-nav__icon"
                aria-hidden
              />
              <span className="personas-view-nav__label">{view.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
