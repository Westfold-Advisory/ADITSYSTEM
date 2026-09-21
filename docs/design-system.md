# Fundamentos visuales — Material Design 3

## Decisión

Se adopta una base clara Material Design 3 con azul marino como color de marca. La interfaz actual usa una paleta oscura tipo _cyber_ sin una preferencia de usuario ni necesidad funcional que la justifique; la superficie clara mejora la lectura de formularios, tablas y contenido administrativo. Los colores y combinaciones de texto de `src/styles/tokens.css` están seleccionados para contraste AA (texto normal 4.5:1 o superior). No se añadió una librería UI: Tailwind, Radix y el componente `Button` ya cubren la necesidad.

Los tokens `--md-sys-*` son la fuente de verdad. Los aliases `--cyber-*` son una capa de compatibilidad para la migración gradual de los componentes de mapa; no se deben usar en componentes nuevos.

## Inventario de inconsistencias (priorizado)

| Impacto | Hallazgo                                                                                                                           | Fundamento aplicado                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Alto    | La paleta cyber oscura, los brillos y los radios cuadrados no expresaban una jerarquía común entre mapa, eventos y administración. | Roles semánticos M3, superficies por nivel y forma consistente.                |
| Alto    | Botones administrativos nativos y botones de eventos tenían tratamiento distinto.                                                  | Acción primaria tonal, altura mínima de 40 px y forma `full`.                  |
| Alto    | Foco y estados dependían de estilos repartidos e `inline`.                                                                         | Anillo de foco global visible de 3 px.                                         |
| Medio   | Formularios y tarjetas usaban radios, borde y elevación sin escala definida.                                                       | Escalas de espaciado, forma y elevación reutilizables.                         |
| Medio   | La tipografía mono y las mayúsculas eran dominantes incluso para contenido.                                                        | Geist para lectura; mono sólo para metadatos o referencias breves.             |
| Medio   | No había criterio documentado para carga, vacío y error.                                                                           | Estados y roles accesibles descritos abajo.                                    |
| Bajo    | Iconos y colores de capas del mapa no pertenecen aún a una escala semántica única.                                                 | Mantenerlos como visualización de datos; migrarlos al tocar el módulo de mapa. |

## Uso de componentes

- **Superficies:** fondo `background`; contenido agrupado `surface-container-low`; formularios y diálogos `surface-container` o `high`. La elevación indica interacción, no sustituye contraste.
- **Acciones:** una primaria por bloque (`primary` sólido); secundaria con contorno o texto; destructiva usa `error` y confirmación cuando sea irreversible. Los iconos deben llevar etiqueta o `aria-label`.
- **Formularios:** etiqueta visible antes del control, ayuda/error cercano al campo, no validar sólo por color y bloquear el reenvío durante la solicitud. Los campos mantienen foco visible y altura cómoda.
- **Alertas:** `role="alert"` para errores que requieren atención; error container para fallo, warning para atención y success para confirmación. El texto explica la acción siguiente.
- **Diálogos:** fondo `scrim`, `z-dialog`, foco inicial dentro y cierre con Escape/botón accesible. No usar un diálogo para mensajes breves.
- **Carga, vacío y error:** carga conserva el encabezado y usa `aria-busy`; vacío explica qué falta y ofrece acción si existe; error preserva el contexto, da reintento y usa `role="alert"`.

## Accesibilidad y movimiento

El foco se ve en teclado sin depender del hover. Los controles interactivos tienen 40 px mínimos; para objetivos compactos del mapa se conserva la etiqueta accesible. `prefers-reduced-motion` lleva la duración de transiciones a cero. Antes de un componente nuevo, comprobar navegación por teclado, nombre accesible y contraste sobre la superficie donde se ubica.

## Componentes admin (estructura de personas)

Estilos en `src/styles/primitives.css` con prefijo `ui-` y tokens `--md-sys-*` únicamente.

### `MetricGrid`

Cuadrícula de indicadores (`<dl>`) para métricas de una persona.

| Prop      | Valores                   | Uso                                                             |
| --------- | ------------------------- | --------------------------------------------------------------- |
| `columns` | `2`, `3` (default), `4`   | Densidad en escritorio; en viewport estrecho baja a 2 columnas. |
| `items`   | `{ label, value, id? }[]` | Etiqueta visible + valor (número o «—» si falta dato).          |

### `RoleChip`

Etiqueta compacta del rol jerárquico. Variante por `data-role`:

| Rol     | Superficie            |
| ------- | --------------------- |
| `AMIGO` | `tertiary-container`  |
| `ADMIN` | `secondary-container` |
| Resto   | `primary-container`   |

Texto en minúsculas legibles (sin guiones bajos). No usar color como único indicador: el texto del rol siempre está presente.

### `HierarchyTree`

Composición para el panel de estructura:

- `HierarchyLayout` — columnas árbol + detalle.
- `HierarchyTreePanel` — encabezado y borde de panel.
- `HierarchyTreeFilterBar` — filtros sobre el árbol.
- `HierarchyTree` / `HierarchyTreeNode` — `role="tree"` / `treeitem`, expansión con botón accesible, selección con foco visible en `.ui-hierarchy-tree-person`.
- `HierarchyTreeRoot` — atajo que une filtros, `aria-busy` en carga y nodo raíz.

Los módulos en `src/components/admin/` consumen estos primitivos (`HierarchyTreePanel`, `PersonDetailPanel`, `PersonForm`). En `App.css` ya no deben usarse `.person-metrics`, `.role-chip` ni clases de nodo del árbol (`.tree-*`); el layout master-detail (`.hierarchy-master-detail`) permanece como estilo de página.

### Eventos públicos

Patrón `EventList`, `EventCard`, `EventDetail` y `EventStatusBadge` en `src/components/events/public/`. Inventario: [`public-events-components.md`](design-system/public-events-components.md).

### Consola admin — acciones (Etapa 1)

Jerarquía primary / outline / destructive y agrupación con `AdminActionBar`: [`admin-actions.md`](design-system/admin-actions.md).
