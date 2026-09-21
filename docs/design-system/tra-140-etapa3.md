# TRA-140 — Etapa 3 (P0)

## TRA-143 — Hook de detalle para mapa admin

### `usePersonDetailForPanel`

Ubicación: `src/hooks/usePersonDetailForPanel.ts`

Parámetros:

- `api` — `DomainApi`
- `session` — `LoginResponse`
- `personId` — persona seleccionada (p. ej. pin del mapa) o `null`

Retorno (consumo por **TRA-144** → `PersonDetailPanel`):

| Campo                             | Descripción                                    |
| --------------------------------- | ---------------------------------------------- |
| `person`                          | Persona cargada                                |
| `metrics` / `scopedMap`           | Paralelo vía `loadPersonSelectionDetails`      |
| `breadcrumb`                      | Cadena de ancestros conocidos                  |
| `canManageSelected`               | Misma regla que Personas                       |
| `canRegisterDocumentsForSelected` | `document-access` + mapa de personas conocidas |
| `loading`, `error`, `refresh`     | Estados y re-fetch                             |

Helpers compartidos: `src/lib/person-detail-context.ts`.

### Cancelación

Al cambiar `personId`, cada `useEffect` aborta el `AbortController` anterior (persona, ancestros, metrics/map).

**Merge:** PR #107.

---

## TRA-144 — PersonDetailPanel en mapa admin

**Merge:** PR #109 (`1955948` en `main`).

### Implementación

- `AdminCoverageMapPage`: selección de pin → `usePersonDetailForPanel` + drawer `PersonDetailPanel` (paridad con Personas: tabs, `PersonSummary`, `AdminActionBar`, CRUD, `ConfirmDialog` baja).
- `onDismiss` + `returnFocusRef` al pin/mapa; breadcrumb navega con `selectPin`.
- Tras mutaciones: `refreshPersonDetail()` + `reloadToken` en cobertura.
- `PersonDetailPanel` / Territorio: prop opcional `mapPinLocation` (coords del pin en mapa admin).

### QA PO (P0 mapa — pendiente sign-off)

Viewport **1440×900**, mismo usuario en Personas y **Admin → Mapa**:

- [ ] Misma persona: mismas pestañas y acciones que en listado/organigrama.
- [ ] Cerrar drawer (✕): mapa usable; foco razonable al dismiss.
- [ ] Teclado: trap en drawer; Tab no pierde contexto crítico.
- [ ] Editar / alta hijo / baja (según rol): sin errores; pins/cobertura coherentes.
- [ ] Territorio: coords del pin + geocercas como en Personas.

---

## P0.3 — UX-02 (sin drawer al entrar en listado / organigrama)

- Bootstrap en `useHierarchyScope`: **no** preselecciona persona al cargar (`setSelected` eliminado del effect inicial).
- `DomainAdminPage`: al cargar o estar en **listado** u **organigrama**, `clearSelection()` mantiene el drawer cerrado hasta clic explícito.
- Cambio a vista **árbol** sigue usando `resetSelectionToRoot()` (patrón master-detail del árbol).
- Tras baja lógica: en listado/organigrama se limpia selección; en árbol se restaura ancla.

### Cierre P0 TRA-142 (merge gate)

| Ítem                              | Evidencia                    |
| --------------------------------- | ---------------------------- |
| P0.1 PersonSummary mapa           | PR #109                      |
| P0.2 PersonDetailPanel compartido | PR #107, #109                |
| P0.3 UX-02                        | PR #111                      |
| P0.4 Doc + checklist              | `tra-140-etapa3.md`, PR #110 |

**P2 (TRA-142):** ver sección P2 abajo.

---

## P2 — Drawer DS y DescriptionList

### P2.1 — `Drawer` (`src/components/ui/Drawer.tsx`)

| Prop             | Uso                                                                                |
| ---------------- | ---------------------------------------------------------------------------------- |
| `open`           | Muestra u oculta el panel                                                          |
| `onDismiss`      | Escape, trap restore; consumidor limpia selección                                  |
| `ariaLabel`      | Nombre accesible del panel                                                         |
| `returnFocusRef` | Elemento que abrió el drawer (pin, fila, etc.)                                     |
| `className`      | Modificadores de layout (`hierarchy-detail-section`, `coverage-map-detail-drawer`) |

**Consumidores:** `DomainAdminPage` (listado/organigrama), `AdminCoverageMapPage` (pin).

Focus trap y foco inicial (`[data-ui-drawer-initial-focus]`) viven en el shell; `PersonDetailPanel` conserva botón ✕.

Bottom sheet móvil: hereda `@media (max-width: 48rem)` de `.hierarchy-detail-drawer` en `admin-layout.css`.

### P2.2 — `DescriptionList`

Primitivo término/valor (`ui-description-list`). **MVP:** bloque de hechos en `PersonSummary` (teléfono, registro, métricas).

Migración progresiva de otros `<dl class="person-profile-dl">` en fases posteriores.

### Fuera de alcance

Mapa público (Etapa 4); DataTable completo.
