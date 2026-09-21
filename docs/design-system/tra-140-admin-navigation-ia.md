# TRA-140 — Navegación consola admin (IA)

## Problema

En Personas coexistían **dos tab bars horizontales** (módulos + vistas), el contenido admin quedaba en ~960px y el detalle/chart no aprovechaban el viewport.

## Estándar recomendado (Public Sector Product DS)

| Nivel             | Qué responde                     | Patrón                                          | Ejemplo                       |
| ----------------- | -------------------------------- | ----------------------------------------------- | ----------------------------- |
| **L1 — AppShell** | ¿En qué área del producto estoy? | **Sidebar** fija (desktop), drawer (móvil)      | Personas · Mapa · Eventos     |
| **L2 — Módulo**   | ¿Qué formato de tarea uso?       | **Subnav en sidebar** o tabs locales verticales | Listado · Árbol · Organigrama |
| **L3 — Página**   | ¿Qué estoy editando?             | Título + breadcrumbs + acciones contextuales    | Detalle persona (drawer)      |

Reglas:

1. **Un solo control primario de módulo** — no repetir L1 en header y sidebar.
2. **L2 no compite con L1** — vistas de Personas van debajo de “Personas” en sidebar, no como segunda fila de tabs.
3. **Detalle contextual = overlay/drawer**, no columna permanente vacía.
4. **Ancho de trabajo (canvas)** — mapas, tablas y organigrama usan `admin-workspace` a ancho completo; formularios cortos pueden usar `max-width` interno.

## Implementación actual (iteración)

- Clase `admin-workspace` en Personas, Mapa y Eventos.
- `AdminWorkspaceShell`: sidebar L1 + slot L2 (solo Personas).
- Header: identidad, sesión y acciones de página (sin tabs L1).

## Próximos pasos (Design System)

- Extraer `AppShell` / `Sidebar` como componentes core (fase migración 4).
- Tokens de botón admin: primario reservado a **una** acción irreversible o de envío; resto `outline`/`secondary`.
- `PersonSummary` + drawer unificado para listado, mapa y organigrama.

## Anti-patrones

- Dos filas de tabs horizontales con el mismo peso visual.
- Detalle siempre visible sin selección.
- Mezclar shadcn `primary` saturado con MD3 surface en la misma ficha sin semántica clara.
