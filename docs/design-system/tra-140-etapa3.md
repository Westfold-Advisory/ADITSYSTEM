# TRA-140 — Etapa 3 (P0)

## TRA-143 — Hook de detalle para mapa admin

### `usePersonDetailForPanel`

Ubicación: `src/hooks/usePersonDetailForPanel.ts`

Parámetros:

- `api` — `DomainApi`
- `session` — `LoginResponse`
- `personId` — persona seleccionada (p. ej. pin del mapa) o `null`

Retorno (consumo previsto por **TRA-144** → `PersonDetailPanel`):

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

### Fuera de este PR

Integración UI en `AdminCoverageMapPage` → **TRA-144**.
