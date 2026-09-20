# Auditoría — superficies públicas, login y privacidad

**Epic:** TRA-103 · **Issue:** TRA-104  
**Repo:** ADITSYSTEM (`main`, revisión auditada: 2026-09-20)  
**Baseline DS:** Material Design 3, tokens `--md-sys-*` ([`docs/design-system.md`](../design-system.md))

## Resumen ejecutivo

Las rutas sin autenticación (`/`, `/eventos`, `/mapa`) y el acceso `/admin` comparten navegación superior vía `PublicShell`, pero **no forman aún una familia visual única**: eventos y 404 mezclan tokens M3 con aliases `--cyber-*`; el mapa público permanece casi enteramente en capa cyber (inline + Tailwind); el login administrativo no comparte shell ni pie legal; **no existe** ruta `/privacidad` ni configuración institucional centralizada. La prioridad P0 es publicar esta matriz (hecho aquí) y ejecutar TRA-105–TRA-110 antes de P2 de theming DIF (TRA-113).

## Alcance

| Ruta / superficie  | Archivo principal                                                                          | Auth         |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------ |
| `/`, `/eventos`    | `src/components/PublicEventsPage.tsx`, `src/App.tsx`                                       | No           |
| `/mapa`            | `src/components/MapPage.tsx`, `src/components/ui/MapaVista.tsx`                            | No           |
| `/admin` (login)   | `src/components/AdminEventsPage.tsx` (`Login`)                                             | Credenciales |
| 404                | `src/App.tsx` (`NotFoundPage`)                                                             | No           |
| Shell transversal  | `src/App.tsx` (`PublicShell`), `src/components/ui/AppBar.tsx`, `src/styles/primitives.css` | —            |
| Privacidad / legal | — (ausente)                                                                                | —            |

**Fuera de alcance de esta auditoría:** contenido jurídico del aviso; admin post-login (`DomainAdminPage`); backend/API.

## Leyenda

| Campo           | Significado                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **Estado**      | `OK` alineado · `PARTIAL` mezcla DS/legacy · `INCONSISTENT` diverge del DS · `NOT` no implementado |
| **Severidad**   | CRITICAL · HIGH · MEDIUM · LOW (taxonomía DS del proyecto)                                         |
| **Seguimiento** | Issue hijo TRA-103                                                                                 |

---

## Matriz CURRENT → EXPECTED (brief PO §1 — experiencia pública e identidad)

| ID     | Ítem                                                     | Estado       | Severidad | Evidencia (repo)                                        | CURRENT                                                                            | EXPECTED (DS institucional)                                                                                                                                      | GAP                                                                          | Recomendación                                                        | Seguimiento      |
| ------ | -------------------------------------------------------- | ------------ | --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------- |
| 1.1.1  | Shell público reutilizable (header + nav + footer legal) | PARTIAL      | HIGH      | `App.tsx` L16–54; sin footer; `App.tsx` L82 login fuera | Header `AppBar` + nav Eventos/Mapa + CTA login; **sin footer**; `/admin` sin shell | `PublicAppShell` envuelve eventos, mapa, **404 y login pre-auth** + footer legal                                                                                 | Footer faltante; login y 404 fuera del shell (PO: login **con** nav pública) | Extraer layout; incluir `/admin` sin sesión en shell                 | TRA-105          |
| 1.1.2  | Identidad / nombre producto                              | PARTIAL      | MEDIUM    | `App.tsx` L27–28; `PublicEventsPage` L181               | Texto hardcoded «ADIT SYSTEM» en 3 lugares                                         | `src/config/institution.ts` (nombre, logo, links legales)                                                                                                        | Duplicación y sin hook para DIF                                              | Centralizar copy institucional                                       | TRA-105, TRA-113 |
| 1.1.3  | Navegación principal pública                             | OK           | LOW       | `AppBar.tsx`, `primitives.css` `.ui-navigation`         | `aria-current="page"`, etiqueta «Navegación principal»                             | Igual + estados focus M3                                                                                                                                         | Aliases `--cyber-*` en barra                                                 | Migrar `.ui-app-bar` a `--md-sys-color-surface-*`                    | TRA-105          |
| 1.1.4  | Listado eventos públicos                                 | PARTIAL      | MEDIUM    | `PublicEventsPage.tsx` L204–228                         | `Card`, `Button`, `AsyncState` DS                                                  | Patrón `EventList` documentado, grid M3                                                                                                                          | `EventCard` local; estilos `.event-*` en `App.css` usan `--cyber-text-*`     | Extraer primitivos compartidos mapa/eventos                          | TRA-107          |
| 1.1.5  | Detalle evento (URL / compartir)                         | INCONSISTENT | HIGH      | `PublicEventsPage.tsx` L129–132, L171; sin `history`    | Detalle vía estado + query `?evento=` **sin** `pushState`                          | Ruta dedicada `/eventos/:id` o URL actualizable + OG meta                                                                                                        | No compartible; refresh pierde contexto si no hay query                      | Actualizar URL al abrir/cerrar; documentar rutas                     | TRA-107, TRA-114 |
| 1.1.6  | Estados carga / vacío / error (eventos)                  | OK           | LOW       | `PublicEventsPage.tsx` L191–216; `ui/AsyncState`        | `LoadingState`, `EmptyState`, `ErrorState`                                         | Patrón DS global                                                                                                                                                 | —                                                                            | Reutilizar mismos componentes en mapa                                | TRA-106          |
| 1.1.7  | Mapa público (mapa + lista)                              | INCONSISTENT | CRITICAL  | `MapPage.tsx` L158–377                                  | Tailwind + `--cyber-*` inline; botones nativos; empty/error custom                 | Superficie clara M3; `EmptyState`/`ErrorState`; filtros con `Field`/`SearchInput`                                                                                | No usa DS; doble header (shell + map header)                                 | Migración incremental mapa                                           | TRA-106, TRA-110 |
| 1.1.8  | Sincronización mapa ↔ eventos                            | PARTIAL      | MEDIUM    | `MapPage.tsx` L334–337 link a `/eventos?evento=`        | Enlace cruzado existe                                                              | Navegación coherente + mismos componentes detalle                                                                                                                | Experiencia visual distinta                                                  | Unificar patrón detalle                                              | TRA-112, TRA-107 |
| 1.1.9  | Capas territoriales (mapa)                               | PARTIAL      | MEDIUM    | `MapaVista.tsx`, `PanelCapas.tsx`                       | UI cyber para capas                                                                | Tokens semánticos; no depender de cyan decorativo                                                                                                                | Visualización datos ≠ status semántico                                       | Mantener colores de capa como data-viz; chrome en M3                 | TRA-106          |
| 1.1.10 | Login administrativo (pre-auth)                          | INCONSISTENT | HIGH      | `AdminEventsPage.tsx` L72–127; `App.css` `.login-form`  | `Field` + `Button` DS; shell `admin-page` a pantalla completa; **sin** nav pública | **`PublicAppShell`**: misma nav Eventos/Mapa que rutas públicas; `<main>` con formulario M3 + enlace privacidad; usuario puede seguir navegando sin autenticarse | Layout aislado; sin link legal; mezcla cyber en labels                       | Renderizar login dentro de `PublicAppShell` (decisión PO 2026-09-20) | TRA-105, TRA-109 |
| 1.1.11 | Mensajes de error auth                                   | PARTIAL      | HIGH      | `AdminEventsPage.tsx` L26–30; `api/http.ts`             | `ApiError.message` puede exponer detalle backend                                   | Mensajes genéricos en UI; detalle sólo en logs                                                                                                                   | Riesgo enumeración / filtración                                              | Capa de mensajes seguros                                             | TRA-111          |
| 1.1.12 | Aviso de privacidad                                      | NOT          | CRITICAL  | Sin ruta; sin footer                                    | —                                                                                  | `/privacidad` + placeholder legal + link en login/footer                                                                                                         | Requisito operativo LFPDPPP-oriented UX                                      | Página estructura + slots contenido PO                               | TRA-108          |
| 1.1.13 | Página 404 pública                                       | PARTIAL      | MEDIUM    | `App.tsx` L57–65; `App.css` L156–170                    | M3 parcial; **sin** `PublicShell`                                                  | 404 dentro de shell + `ErrorState`/`EmptyState`                                                                                                                  | Usuario pierde nav en error                                                  | Envolver con shell                                                   | TRA-105          |
| 1.1.14 | Tipografía pública                                       | INCONSISTENT | MEDIUM    | `App.css` L37–44; `MapPage.tsx` L187–188                | Eyebrows uppercase + mono en mapa                                                  | `--md-sys-typescale-*`; mono sólo metadatos                                                                                                                      | Dos dialectos tipográficos                                                   | Aplicar escala M3 en eventos/mapa/login                              | TRA-106, TRA-107 |
| 1.1.15 | Responsive (mapa móvil)                                  | PARTIAL      | MEDIUM    | `MapPage.tsx` L207–211 `data-sheet-state`               | Sheet inferior ~62dvh                                                              | Documentado en DS; touch 44px                                                                                                                                    | Controles icon-only parcialmente OK                                          | Verificar targets en auditoría a11y                                  | TRA-110          |
| 1.1.16 | Theming multi-institución (prueba DIF)                   | NOT          | LOW       | Sin `themes/`                                           | Solo ADIT hardcoded                                                                | Theme swap tokens brand                                                                                                                                          | Fuera de MVP público                                                         | Validar arquitectura tras homologación                               | TRA-113          |

---

## Matriz §2 — Privacidad y datos en UI pública

| ID  | Ítem                                  | Estado  | Severidad | Evidencia                                    | CURRENT                                                    | EXPECTED                                         | GAP                              | Seguimiento                              |
| --- | ------------------------------------- | ------- | --------- | -------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ | -------------------------------- | ---------------------------------------- |
| 2.1 | Datos personales en listados públicos | OK      | LOW       | `PublicEventsPage` / API `listPublic`        | Solo eventos publicados (nombre, lugar, fechas, capacidad) | Minimización                                     | —                                | —                                        |
| 2.2 | Coordenadas / territorio              | OK      | MEDIUM    | `MapPage`, eventos publicados                | Lat/lng y geocercas visibles                               | Scope público intencional; documentar            | Política de publicación en aviso | TRA-108                                  |
| 2.3 | PII en formulario login               | PARTIAL | MEDIUM    | Login email/password                         | Campos estándar; sin texto tratamiento datos               | Checkbox/aviso + link privacidad antes de enviar | Falta consentimiento UX          | TRA-109, TRA-115                         |
| 2.4 | Persistencia sesión                   | PARTIAL | HIGH      | `sessionStorage` `adit.admin.session` L15–20 | Token + user JSON en sessionStorage                        | Documentar riesgo XSS; HttpOnly ideal backend    | Frontend expone token si XSS     | Informe TRA-111 (UX); backend fuera epic |
| 2.5 | Mensajes error red login              | PARTIAL | MEDIUM    | `errorMessage()` propagates `Error.message`  | Puede mostrar errores técnicos                             | Copy institucional fijo                          | Filtración stack/URL             | TRA-111                                  |

---

## Matriz §3 — Consistencia transversal (tokens)

| Superficie                             | `--md-sys-*`                         | `--cyber-*` / inline                              | Veredicto    |
| -------------------------------------- | ------------------------------------ | ------------------------------------------------- | ------------ |
| `PublicShell` / AppBar                 | Parcial (nav radius)                 | Fondo/borde barra                                 | INCONSISTENT |
| Eventos (`App.css` `.public-events-*`) | Superficies cards, botones primarios | Texto `--cyber-text-*`, hover `#174681` hardcoded | PARTIAL      |
| Mapa                                   | Mínimo                               | Dominante (L161–309)                              | INCONSISTENT |
| Login                                  | Inputs/buttons M3                    | Labels `--cyber-text`, focus cyan                 | PARTIAL      |
| 404                                    | Contenedor M3                        | —                                                 | OK/PARTIAL   |
| Admin post-login                       | Fuera de alcance epic público        | —                                                 | —            |

**Regla DS vigente:** no usar `--cyber-*` en componentes nuevos ([`design-system.md`](../design-system.md)).

---

## Checklist WCAG 2.2 AA por superficie

Criterios evaluados por revisión de código (no sustituye prueba manual).

| Criterio                     | Eventos | Mapa    | Login   | 404 | Notas                                                         |
| ---------------------------- | ------- | ------- | ------- | --- | ------------------------------------------------------------- |
| 1.3.1 Info y relaciones      | Parcial | Parcial | OK      | OK  | Mapa: filtros `<label>` OK; lista eventos en `<button>` OK    |
| 2.4.1 Bypass blocks          | NOT     | NOT     | NOT     | NOT | Sin skip link — TRA-105                                       |
| 2.4.3 Focus order            | OK      | Revisar | OK      | OK  | Mapa: panel móvil + mapa — TRA-110                            |
| 2.4.7 Focus visible          | PARTIAL | PARTIAL | PARTIAL | OK  | Mezcla `--cyber-cyan` vs `--md-sys-*` focus                   |
| 3.3.1 Identificación errores | OK      | OK      | OK      | —   | `role="alert"` en login                                       |
| 3.3.2 Labels                 | OK      | OK      | OK      | —   |                                                               |
| 4.1.2 Name, role, value      | OK      | Parcial | OK      | OK  | Icon buttons mapa tienen `aria-label`                         |
| 1.4.3 Contraste              | Revisar | Revisar | Revisar | OK  | Texto `--cyber-text-secondary` sobre cyber surfaces — TRA-110 |
| 2.5.8 Target size            | Parcial | Parcial | OK      | OK  | Botones mapa header `p-1.5` — TRA-110                         |

**Automatización recomendada (fases siguientes):** axe en `/eventos`, `/mapa`, `/admin` (sin credenciales: sólo formulario login).

---

## Mapa de trabajo (issues hijos TRA-103)

| Prioridad | Issue                             | Depende de       |
| --------- | --------------------------------- | ---------------- |
| P0        | TRA-104 (esta matriz)             | —                |
| P0        | TRA-108 Aviso + `/privacidad`     | TRA-105 (footer) |
| P0        | TRA-109 Login institucional       | TRA-105, TRA-108 |
| P0        | TRA-110 a11y mapa                 | TRA-106          |
| P1        | TRA-105 Public App Shell          | TRA-104          |
| P1        | TRA-106 Homologar mapa            | TRA-105          |
| P1        | TRA-107 EventList/Card/Detail     | TRA-105          |
| P1        | TRA-111 Mensajes auth seguros     | TRA-109          |
| P1        | TRA-115 Auditoría PII formularios | TRA-109          |
| P2        | TRA-112 Mapa↔eventos              | TRA-106, TRA-107 |
| P2        | TRA-113 Theming DIF               | TRA-105          |
| P2        | TRA-114 Rutas públicas propuestas | TRA-107          |

---

## Definition of Done — TRA-104

- [x] Matriz cubre ítems 1.1 del brief (tabla §1 + privacidad §2).
- [x] Cada fila cita archivo/ruta en repo.
- [x] Severidad alineada a taxonomía DS del proyecto.
- [x] Enlaces a tareas TRA-105+.
- [ ] Revisión PO + merge a `main` vía PR.

---

## Decisiones tomadas (Product Owner)

| Fecha      | Tema                  | Decisión                                                                                                                                                                                                                                                                                                 | Impacto en implementación                                                                                               |
| ---------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-09-20 | Layout login `/admin` | **Nav pública y continuidad:** el formulario de acceso vive dentro del mismo `PublicAppShell` (header + nav Eventos/Mapa + footer cuando exista). No usar layout dedicado que oculte la navegación pública. Tras autenticar, la consola admin puede usar shell distinto (fuera de alcance epic público). | TRA-105 debe extender el shell a login pre-auth; TRA-109 homologa formulario dentro de `<main>`, no reemplaza el shell. |

## Decisiones pendientes (Product Owner)

1. ¿URL de detalle público: `/eventos/:id` vs mantener `?evento=` con `history.pushState`?
2. ¿Institución responsable del aviso (razón social, domicilio, ARCO) para TRA-108?
3. ¿Publicar geocercas completas en mapa anónimo es política deseada?
