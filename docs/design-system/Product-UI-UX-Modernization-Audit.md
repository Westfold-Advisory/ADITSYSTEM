# Product UI/UX Modernization Audit

**Producto:** ADITSYSTEM (frontend React/Vite)  
**Alcance:** FASE 1 — solo auditoría (sin cambios de código en este entregable)  
**Fecha:** 2026-09-21  
**Baseline DS:** [`docs/design-system.md`](../design-system.md), tokens `--md-sys-*` en `src/styles/tokens.css`  
**Referencias UX (no identidad):** GOV.UK DS, USWDS, WCAG 2.2 AA

---

## 1. Executive Summary

ADITSYSTEM es una SPA con **funcionalidad real** en personas, eventos, mapas públicos/admin y login institucional. Existe un **Design System documentado (MD3 + tokens)** y primitivos en `src/components/ui/`, pero la implementación es **heterogénea**: administración y eventos públicos avanzan hacia M3; el **mapa público y capas territoriales** conservan capa **cyber/legacy** (`--cyber-*`, colores inline, Tailwind arbitrario); **App.css** concentra estilos de página que duplican o contradice `primitives.css` y `admin-layout.css`.

La jerarquía de roles en UI deriva de `src/lib/capabilities.ts` (affordances) y políticas en API; **AMIGO no es rol autenticable** (`AuthenticatedRole` excluye AMIGO en `src/types/domain.ts`). No inventar permisos: la UI ya refleja alcance vía árbol, filtros y `canRegisterDocuments` (`src/lib/document-access.ts`).

**Reacción objetivo del brief:** “El mismo producto, más terminado.”  
**Prioridad de modernización:** (1) homologar **layout admin + navegación** en todos los módulos; (2) unificar **acciones/botones** en DS; (3) migración incremental **mapa público**; (4) consolidar **detalle de persona** (`PersonSummary` / drawer); (5) copy ES.

Trabajo reciente TRA-140 (PRs #100–#102, ramas en revisión) aborda ancho, sidebar y drawer — esta auditoría lo trata como **evolución en curso**, no como DS paralelo.

---

## 2. Current Frontend Architecture

| Aspecto     | Evidencia                                                      | Notas                                        |
| ----------- | -------------------------------------------------------------- | -------------------------------------------- |
| Framework   | `package.json`: React 19, Vite                                 | Sin Next/remix                               |
| Routing     | `src/App.tsx` — `pathname()` manual, sin react-router          | `docs/frontend-routes.md`                    |
| Estado      | Hooks locales, `useHierarchyScope` para personas               | Sin store global                             |
| API         | `src/api/*`, token en sesión admin                             | Errores vía `ApiError`                       |
| Estilos     | `tokens.css`, `shadcn-tailwind.css`, `App.css`, CSS por página | Triple vía: M3, Tailwind, legacy             |
| UI libs     | Radix (Tabs, Slot), CVA `Button`, lucide icons                 | No Storybook en repo                         |
| Institución | `src/config/institution.ts`                                    | Theming white-label parcial (TRA-113)        |
| Tests       | Vitest (~111 tests unitarios)                                  | E2E Playwright documentado, no cubre todo UI |

**Riesgo arquitectónico (P2):** routing manual dificulta deep links y layouts anidados; ya documentado para eventos (`?evento=` sin `pushState` consistente) en `public-surfaces-audit.md`.

---

## 3. Existing Design System Assessment

### A. Bien implementado

- Tokens MD3 en `src/styles/tokens.css` (primary navy `#1e4f91`, superficies, tipografía Poppins).
- `Button`, `Field`, `Alert`, `Dialog`, `AsyncState` en `src/components/ui/`.
- Admin personas: `MetricGrid`, `RoleChip`, `HierarchyTree` primitivos (`docs/design-system.md`, `primitives.css` prefijo `ui-`).
- Eventos públicos: patrón `EventList` / `EventCard` documentado.
- Foco global y `prefers-reduced-motion` referenciados en DS.

### B. No respeta DS consistentemente

| Área                 | Evidencia                                                                 | Problema                                          |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| Admin layout         | `App.css` L274–278 `max-width: 960px` vs `admin-workspace` (rama TRA-140) | Módulos desalineados en ancho                     |
| Botones admin legacy | `App.css` L287–318 estilos nativos `.admin-page > button`                 | Compiten con `Button` CVA/shadcn                  |
| Mapa público         | `MapPage.tsx`, `MapPage.css`, `PanelCapas.tsx` (`text-[10px]`, cyber)     | Fuera de escala tipográfica M3                    |
| Capas geo            | `Capa.tsx` colores hex fijos (#4DEBFF…)                                   | Aceptable como **data-viz**, chrome no homologado |
| Detalle persona      | `PersonDetailPanel` + `Card` en árbol; drawer mock sin Card (PR #102)     | Dos patrones de detalle                           |
| Tabs                 | Radix + `.hierarchy-tabs` en `App.css`                                    | Mezcla con admin sidebar nuevo                    |

### C. Patrones duplicados

- **Árbol jerárquico:** `components/ui/HierarchyTree.tsx` (primitivos) vs `components/admin/HierarchyTree.tsx` (panel).
- **Encabezado admin:** `AdminPageHeader` + tabs horizontales vs `AdminWorkspaceShell` + sidebar (transición).
- **Estados vacío/error:** DS `EmptyState`/`ErrorState` vs mensajes `.request-message` custom.

### D. Hardcode innecesario

- `App.css` `#174681` en botones legacy (≠ token `--md-sys-color-primary`).
- Fallbacks `#e8f0fe`, `#f8fafc` repetidos en `admin-layout.css` (preferir solo tokens).
- Copy «ADIT SYSTEM» reducido vía institution config pero restos en docs/deploy.

### E–G. Resumen

- **Reutilizar:** extender `Button` variants admin; promover `PersonSummary`; aplicar `admin-workspace` a todos los `/admin/*`.
- **Faltantes DS formales:** `AppShell`, `Sidebar` (implementación parcial TRA-140), `DataTable`, `PageHeader` unificado, `DescriptionList` institucional, `Drawer` genérico.
- **Inconsistencia entre módulos:** Personas (M3+) vs Mapa público (cyber) vs Eventos admin (mix).

---

## 4. Component Inventory

| Categoría   | Componentes                                                     | Estado DS             |
| ----------- | --------------------------------------------------------------- | --------------------- |
| Foundations | `tokens.css`, `index.css` @theme                                | OK                    |
| Actions     | `button.tsx`                                                    | OK; uso inconsistente |
| Forms       | `Field`, `PersonForm`, `FormularioNuevoEvento`, `PasswordField` | PARTIAL               |
| Navigation  | `AppBar`, `AdminNav`, `AdminWorkspaceShell`, `PersonasViewNav`  | EN EVOLUCIÓN          |
| Feedback    | `Alert`, `AsyncState`, `PersonStatusBadge`, `EventStatusBadge`  | OK                    |
| Data        | `PersonDirectoryTable`, `MetricGrid`, `admin-events` grid       | PARTIAL               |
| Overlay     | `Dialog`, drawer CSS `person-drawer`                            | PARTIAL               |
| Identity    | `PersonSummary` (mock), `RoleChip`, `InstitutionBrandMark`      | NUEVO / OK            |
| Map         | `map.tsx`, `MapaVista`, `PanelCapas`, `Sidebar.tsx` (demo map)  | LEGACY                |
| Legal       | `PublicLegalFooter`, privacy pages                              | OK post TRA-108       |

Inventario detallado admin: `PersonDetailPanel`, `PersonOrgChartView`, `HierarchyMasterDetail`, `TreeSheet`, `PersonDocumentsTab`.

---

## 5. Page / Module Inventory

| Ruta              | Módulo           | Auth | Perfiles típicos         |
| ----------------- | ---------------- | ---- | ------------------------ |
| `/`, `/login`     | Login            | No   | Todos los autenticables  |
| `/eventos`        | Eventos públicos | No   | —                        |
| `/mapa`           | Mapa explorador  | No   | —                        |
| `/admin`          | Eventos admin    | Sí   | CG, Coord, Enlace, Admin |
| `/admin/mapa`     | Cobertura        | Sí   | Idem                     |
| `/admin/personas` | Estructura       | Sí   | Idem                     |
| `/privacidad*`    | Legal            | No   | —                        |
| 404               | Not found        | No   | —                        |

---

## 6. Navigation & Information Architecture Assessment

**Fortalezas**

- Admin: un solo menú de módulos (`ADMIN_NAV_LINKS` en `lib/admin-nav.ts`).
- Personas: sub-vistas Listado / Árbol / Organigrama (prototipo TRA-140).

**Problemas (con evidencia)**

| ID     | Problema                                                | Ubicación                                            | Impacto             | Prioridad                |
| ------ | ------------------------------------------------------- | ---------------------------------------------------- | ------------------- | ------------------------ |
| NAV-01 | Doble barra de tabs (módulo + vistas) antes del sidebar | `DomainAdminPage` + `AdminPageHeader`                | Carga cognitiva     | P1 → mitigado en PR #101 |
| NAV-02 | Ancho de canvas distinto por módulo                     | `App.css` vs `coverage-map-page` vs `hierarchy-page` | Producto “a trozos” | P1                       |
| NAV-03 | Público vs admin shells distintos                       | `PublicAppShell` vs admin sin shell unificado        | Curva aprendizaje   | P2                       |
| NAV-04 | Sin breadcrumbs globales admin                          | Solo en detalle persona / árbol                      | Orientación         | P2                       |
| NAV-05 | Deep links admin frágiles en S3                         | `docs/frontend-routes.md`                            | QA y soporte        | P1 ops                   |

**Recomendación IA (estándar):** L1 sidebar módulos, L2 subnav contextual, L3 drawer detalle — ver `tra-140-admin-navigation-ia.md`.

---

## 7. Role-based UX Assessment

Fuente: `capabilitiesFor()` — UI only; API `PersonaPolicy` manda.

| Rol                     | Autenticación | canViewStructure | canManageEvents | canCreateChild → | Notas UX                                            |
| ----------------------- | ------------- | ---------------- | --------------- | ---------------- | --------------------------------------------------- |
| **ADMIN**               | Sí            | Sí               | Sí              | CG               | Listado por defecto; sin raíz en árbol (`hideRoot`) |
| **COORDINADOR_GENERAL** | Sí            | Sí               | Sí              | Coordinador      | Alcance subárbol                                    |
| **COORDINADOR**         | Sí            | Sí               | Sí              | Enlace           | Idem                                                |
| **ENLACE**              | Sí            | Sí               | Sí              | Amigo            | Idem                                                |
| **AMIGO**               | **No**        | N/A              | N/A             | N/A              | Persona administrada; sin login                     |

**Hallazgos**

| ID     | Problema                                                | Evidencia                               | Prioridad |
| ------ | ------------------------------------------------------- | --------------------------------------- | --------- |
| RBX-01 | Mensaje de alcance genérico repetido                    | `.request-message` en `DomainAdminPage` | P3        |
| RBX-02 | Misma densidad UI para admin global vs enlace operativo | Sin modos “dense/comfortable”           | P2        |
| RBX-03 | Documentos: reglas UI en `canRegisterDocuments`         | Correcto; falta copy cuando denegado    | P2        |

No cambiar permisos; documentar copy contextual por rol en Fase implementación.

---

## 8. Forms Assessment

| Formulario   | Archivo                        | Labels        | Errores            | Observación                  |
| ------------ | ------------------------------ | ------------- | ------------------ | ---------------------------- |
| Login        | `LoginPage.tsx`                | Field DS      | Alert              | Mejor post TRA-109           |
| Persona CRUD | `PersonForm.tsx`               | Mix           | API → mensaje      | Secciones largas             |
| Evento       | `FormularioNuevoEvento.tsx`    | Field         | Inline             | Acciones OK                  |
| Password     | `PersonChangePasswordForm.tsx` | PasswordField | Validación cliente | OK TRA-139                   |
| Documentos   | `PersonDocumentsTab.tsx`       | Parcial       | Saving state       | “Registrar metadata” técnico |

**P1:** homologar verbos submit (“Guardar cambios” vs “Crear evento” vs “Registrar”).  
**P2:** error summary arriba en formularios largos (PersonForm).

---

## 9. Tables & Data-heavy Interfaces Assessment

- **PersonDirectoryTable:** sticky header, filtros — buen baseline; falta paginación si volumen crece (P2).
- **Admin events grid:** cards no tabla — OK para pocos eventos; P2 si escala.
- **Mapa/lista:** `Sidebar.tsx` legacy demo patterns — no alineado admin (P1 mapa módulo).

---

## 10. Accessibility Assessment

Objetivo WCAG 2.2 AA.

| Área           | Estado       | Evidencia                                       |
| -------------- | ------------ | ----------------------------------------------- |
| Foco           | Parcial      | DS global; mapa/icon-only revisar TRA-110       |
| Teclado árbol  | OK           | `role="tree"` en primitivos                     |
| Tabs           | OK           | Radix + estilos focus                           |
| Contraste M3   | OK en tokens | Cyber mapa en riesgo                            |
| Drawer persona | Nuevo        | Verificar focus trap al abrir/cerrar (P1)       |
| Organigrama    | Parcial      | Botones tarjeta OK; conectores solo decorativos |

Automatizado: lint a11y limitado; E2E smoke en CI. Manual pendiente: VoiceOver drawer, 200% zoom admin.

---

## 11. Responsive Assessment

- Admin sidebar → fila en `<64rem` (`admin-layout.css`) — OK.
- Drawer persona → bottom sheet móvil — OK mock.
- `HierarchyMasterDetail` → sheet árbol móvil (`TreeSheet`) — OK.
- Tablas: scroll horizontal; sin card-stacking aún (P2).
- Mapa: sheet 62dvh documentado — PARTIAL.

---

## 12. Visual Consistency Issues

1. **Dos familias de botón** (CVA vs `App.css` nativo). — P0 visual admin.
2. **Cards everywhere** vs drawer PersonSummary — P1.
3. **Sombras** mix elevation-1/2 y `shadow-sm` Tailwind — P2.
4. **Radius** M3 md vs `rounded-lg` Tailwind arbitrario — P2.
5. **Org chart** vs resto admin — P1 TRA-140.

---

## 13. UX Issues (selected)

| ID    | Problema                                | Ubicación                                      | Impacto             | P   | Esfuerzo |
| ----- | --------------------------------------- | ---------------------------------------------- | ------------------- | --- | -------- |
| UX-01 | Panel detalle vacío (mitigado TRA-140)  | Listado/Organigrama                            | Desperdicio espacio | P1  | Low      |
| UX-02 | Detalle admin preseleccionado al cargar | `useHierarchyScope` L86 `setSelected(current)` | Confusión           | P1  | Low      |
| UX-03 | Confirm `window.confirm` baja persona   | `DomainAdminPage`                              | Poco institucional  | P2  | Med      |
| UX-04 | Evento detalle URL no compartible       | `PublicEventsPage`                             | Ciudadanía          | P1  | Med      |
| UX-05 | Mapa público doble header               | `MapPage`                                      | Ruido               | P2  | Med      |

---

## 14. Duplicated Components / Patterns

- Hierarchy tree (ui vs admin wrappers).
- Detail panels: Card embebido vs `person-drawer`.
- Empty/error: AsyncState vs `.request-message.error`.
- Métricas: `MetricGrid` vs filas sueltas en copy.

---

## 15. Legacy or Out-of-System Components

- `FormularioNuevoLugar`, `Sidebar.tsx` (map demo / integrantes) — lenguaje “Agregar objetivo”, cyber.
- `App.css` bloques `.event-*`, login legacy overrides.
- Aliases `--cyber-*` en tokens (compat mapa).

---

## 16. Copy & Terminology Inconsistencies

| Concepto     | Variantes encontradas  | Recomendación                                        |
| ------------ | ---------------------- | ---------------------------------------------------- |
| Alta persona | Registrar / Crear      | **Registrar** (dominio personas)                     |
| Alta evento  | Crear evento / Guardar | **Crear** borrador, **Guardar cambios** edición      |
| Baja         | Eliminar / Dar de baja | **Dar de baja** personas; **Eliminar** eventos draft |
| Documentos   | Registrar metadata     | **Registrar documento** (usuario)                    |

Glosario ES pendiente en DS Content Standard (fase docs AGENTS.md).

---

## 17. Performance / Perceived Performance Issues

- Carga jerarquía: spinner global OK; métricas detalle async (`selectionDetails`) — OK.
- Mapa: tiles externos — skip CI documentado.
- Layout shift: MetricGrid sin skeleton en detalle — P3.
- Zoom organigrama CSS transform — scroll OK; P3.

---

## 18. Quick Wins

1. Aplicar `admin-workspace` + sidebar a **todos** `/admin/*` (merge #101).
2. Deprecar estilos `.admin-page > button` en favor de `Button` (scoped migration).
3. Drawer `PersonSummary` en listado/organigrama (#102).
4. Unificar `max-width` admin en un solo token/layout class.
5. Glosario 1 página copy ES para acciones CRUD.
6. Focus trap + `aria-modal` en drawer persona.
7. Documentar variantes Button admin (primary única por vista).

---

## 19. Proposed Improvements (priorizados)

| Mejora                               | Tipo       | Depende de     | P   |
| ------------------------------------ | ---------- | -------------- | --- |
| AppShell admin completo              | Layout     | Sidebar merged | P0  |
| PersonSummary + Drawer componente DS | Identity   | Mock #102      | P1  |
| DataTable primitivo (personas)       | Data       | Tokens         | P1  |
| Mapa público chrome M3               | Superficie | TRA-106        | P1  |
| Dialog confirm destructivo           | Feedback   | Dialog DS      | P2  |
| Form error summary                   | Forms      | Field          | P2  |
| Theming DIF validación               | Brand      | TRA-113        | P2  |

---

## 20. Regression Risks

- Cambiar routing → romper S3 y bookmarks.
- Tocar `useHierarchyScope` selección → regresión árbol/filtros.
- Mapa: regresión MapLibre layers al migrar CSS.
- Button global restyle → eventos admin + públicos a la vez.
- Organigrama CSS conectores — visual only pero QA intensivo.

---

## Proposed Modernization Roadmap

### Etapa 0 — Aprobación y baseline (ahora)

- Congelar esta auditoría; PO prioriza P0/P1.
- Merge ordenado PRs TRA-140 (#101, #102).

### Etapa 1 — Layout & navegación compartida (2–3 sprints)

- `admin-workspace` en todos los módulos admin.
- Eliminar tabs horizontales duplicadas.
- `PageHeader` pattern único (título + acciones).

### Etapa 2 — Acciones & forms (1–2 sprints)

- Matriz primary/secondary/destructive en DS.
- Retirar botones nativos `App.css`.
- Copy homologado ES.

### Etapa 3 — Detalle persona & data (2 sprints)

- Promover `PersonSummary` + drawer genérico.
- Reutilizar en mapa cobertura (pin seleccionado).
- `DescriptionList` institucional.

### Etapa 4 — Superficies públicas (2–3 sprints)

- Mapa + eventos: chrome M3 (`public-surfaces-audit` TRA-105–110).
- URL eventos compartible.

### Etapa 5 — Accesibilidad & QA (continuo)

- Checklist DoD pantalla (`docs/frontend-definition-of-done.md`).
- axe en CI por ruta crítica.

### Etapa 6 — Theming institucional (cuando PO)

- Validar swap tokens DIF sin fork de componentes.

---

## FASE 2 — Detener implementación

**No se implementa código adicional** más allá de lo ya en PRs abiertos hasta aprobación explícita del PO sobre:

1. Prioridad de etapas 1 vs 4 (admin vs público).
2. Aceptación del drawer PersonSummary como patrón oficial.
3. Calendario de deprecación `--cyber-*` en mapa.

---

## Apéndice — Formato de hallazgo (ejemplo)

**UX-02 — Selección inicial automática**

- **Ubicación:** `src/hooks/useHierarchyScope.ts` (~L86)
- **Componente:** `useHierarchyScope` / vistas Listado y Organigrama
- **Problema:** Al cargar, `setSelected(current)` abre detalle sin acción del usuario.
- **Evidencia:** Effect de bootstrap + capturas PO TRA-140.
- **Impacto:** Panel derecho ocupa espacio; contradice patrón Personio.
- **Recomendación:** Clear selection en vistas alt; mantener selección en árbol.
- **Prioridad:** P1 | **Esfuerzo:** Low

---

_Documento generado bajo brief “Senior GovTech Product Designer & Frontend UX Engineer” — FASE 1 exclusivamente._
