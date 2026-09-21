# TRA-140 — Prototipo Personas (listado, árbol, organigrama)

Issue Multica: **TRA-140**. Referencia PO: vistas tipo Personio (tabla + organigrama) para validación con el equipo.

## Objetivo

Ofrecer **tres formatos** en `/admin/personas` sin eliminar el flujo actual, corregir la búsqueda en el árbol y alinear la experiencia **ADMIN** con un directorio global (sin nodo padre administrador).

## Cambios funcionales

| Área | Cambio |
|------|--------|
| Nav admin | Orden: **Personas → Mapa → Eventos** (`ADMIN_NAV_LINKS`). |
| Búsqueda árbol | `filterChildMapForTree` mantiene ramas con coincidencias; al filtrar se expanden ancestros y se selecciona la primera persona que coincide (detalle alineado con el resultado). |
| Vista Listado | Tabla: nombre, rol, teléfono, estado, superior, acción «Ver ficha». ADMIN: todas las personas operativas (excluye fila ADMIN). |
| Vista Organigrama | Tarjetas jerárquicas desde raíz(es) operativa(s); zoom ±; clic abre la misma ficha de detalle. |
| Vista Árbol | Sin cambio de patrón master-detail; **ADMIN** oculta la fila raíz (`omitRoot` en árbol). |
| ADMIN landing | Tab por defecto: **Listado**; selección inicial vacía para favorecer exploración del directorio. |

## Archivos tocados

- `src/lib/admin-nav.ts`, `src/lib/admin-nav.test.ts` — orden de tabs.
- `src/lib/person-filters.ts`, `src/lib/person-filters.test.ts` — filtro de árbol y ancestros.
- `src/lib/person-scope.ts`, `src/lib/person-scope.test.ts` — scope, filas de directorio, raíces del organigrama.
- `src/lib/hierarchy-tree.ts` — `buildVisibleTreeRows({ omitRoot })`.
- `src/components/ui/HierarchyTree.tsx`, `src/components/admin/HierarchyTree.tsx` — omitir raíz ADMIN.
- `src/components/admin/PersonDirectoryTable.tsx`, `PersonOrgChartView.tsx` — nuevas vistas.
- `src/components/DomainAdminPage.tsx` — tabs Listado \| Árbol \| Organigrama.
- `src/hooks/useHierarchyScope.ts` — `clearSelection`.
- `src/styles/admin-layout.css` — estilos tabla y organigrama.

## Cómo probar

1. `npm run dev` — iniciar sesión como ADMIN y como COORDINADOR_GENERAL / ENLACE.
2. **Personas → Listado:** tabla poblada; filtros por nombre/estado; «Ver ficha» abre detalle.
3. **Personas → Árbol:** buscar un subordinado profundo; comprobar expansión y detalle correcto.
4. **Personas → Organigrama:** seleccionar tarjetas; probar zoom.
5. **ADMIN en Árbol:** no debe aparecer el nodo ADMIN como padre de toda la estructura.

## Limitaciones del prototipo

- El organigrama muestra nodos ya presentes en el mapa de hijos cargado (ADMIN suele tener el subárbol completo tras la primera carga; otros roles pueden requerir expandir en vista Árbol).
- No hay rutas URL separadas por sub-vista (`?v=` pendiente si el PO lo pide).
- Sin paginación server-side en tabla (dataset acotado al scope API).

## Siguiente paso (post-aprobación PO)

Elegir vista por defecto por rol, pulir copy/nombres de tabs y, si aplica, extraer patrones al Design System (tabla institucional, organigrama accesible).
