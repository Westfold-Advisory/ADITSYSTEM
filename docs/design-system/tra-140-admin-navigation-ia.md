# TRA-140 — Navegación consola admin (IA)

## Problema

En Personas coexistían **dos tab bars horizontales** (módulos + vistas), el contenido admin quedaba en ~960px y el detalle/chart no aprovechaban el viewport.

## Estándar recomendado (Public Sector Product DS)

| Nivel             | Qué responde                     | Patrón                                                        | Ejemplo                       |
| ----------------- | -------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| **L1 — AppShell** | ¿En qué área del producto estoy? | **Sidebar** fija (desktop), drawer off-canvas (móvil/tablet)  | Personas · Mapa · Eventos     |
| **L2 — Módulo**   | ¿Qué formato de tarea uso?       | **Tab bar horizontal en el canvas**, bajo el título de página | Listado · Árbol · Organigrama |
| **L3 — Página**   | ¿Qué estoy editando?             | Título + breadcrumbs + acciones contextuales                  | Detalle persona (drawer)      |

Reglas:

1. **Un solo control primario de módulo** — no repetir L1 en header y sidebar.
2. **L2 no compite con L1** — vive en el canvas (bajo el título), no en el sidebar; una sola fuente de verdad de la vista activa (ver TRA-147).
3. **Detalle contextual = overlay/drawer**, no columna permanente vacía.
4. **Ancho de trabajo (canvas)** — mapas, tablas y organigrama usan `admin-workspace` a ancho completo; formularios cortos pueden usar `max-width` interno.

## Implementación actual (iteración)

- Clase `admin-workspace` en Personas, Mapa y Eventos.
- `AdminWorkspaceShell`: sidebar L1 (rail desktop / drawer móvil) + slot `subheaderTabs` para L2 (solo Personas).
- Header: identidad, sesión y acciones de página (sin tabs L1).

## TRA-147 — Iteración Personio (sidebar, tab bar L2, marca, elevación)

Ajustes sobre feedback PO comparando con Personio:

- **L2 pasó de hover-submenu en sidebar a tab bar en el canvas** (`PersonasViewNav`, bajo el título de página). Se eliminó el submenú de organización de `AdminNav` — una sola fuente de verdad (`structureView` en `DomainAdminPage`), sin depender de abrir el sidebar ni de hover.
- **Drawer off-canvas real en móvil/tablet** (`<64rem`): antes el rail se apilaba siempre visible arriba del contenido (con cierre de sesión incluido, percibido como “top app bar” duplicado). Ahora `AdminWorkspaceShell` muestra una barra superior mínima (monograma + hamburguesa) y el rail completo (módulos + tarjeta de usuario + cerrar sesión) vive en un drawer (`position: fixed`, backdrop, cierre con `Escape`/click fuera/botón `X`). Un solo control de cierre de sesión, siempre en el pie del rail — nunca en la barra superior.
- **Marca del sidebar simplificada**: se retiró el nombre de producto («ADIT SYSTEM») del rail persistente (redundante en cada vista); queda solo el logo institucional o, si no hay `logoUrl` configurado, un monograma compacto (`productShortName`, opt-in vía `InstitutionBrandMark#showMonogramFallback`). El nombre completo se reserva para `/login` (contexto legal).
- **Radius/elevación**: shell, tab bar y drawer reutilizan los tokens existentes (`--md-sys-radius-sm/md`, `--md-sys-elevation-3` para el drawer móvil) — no se introdujeron valores arbitrarios nuevos.

## Próximos pasos (Design System)

- Extraer `AppShell` / `Sidebar` como componentes core (fase migración 4).
- Tokens de botón admin: primario reservado a **una** acción irreversible o de envío; resto `outline`/`secondary`.
- `PersonSummary` + drawer unificado para listado, mapa y organigrama.
- Generalizar `subheaderTabs`/`PersonasViewNav` a un componente `AdminViewTabs` reutilizable cuando un segundo módulo necesite vistas L2 (hoy solo Personas).

## Anti-patrones

- Dos filas de tabs horizontales con el mismo peso visual.
- Detalle siempre visible sin selección.
- Mezclar shadcn `primary` saturado con MD3 surface en la misma ficha sin semántica clara.
- Repetir la marca institucional completa en cada vista admin, o duplicar el control de cierre de sesión entre el rail y una barra superior.
