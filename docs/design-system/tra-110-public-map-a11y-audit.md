# Auditoría de accesibilidad — mapa público (`/mapa`)

**Issue:** TRA-110 · **Epic:** TRA-103 · **Dependencia:** TRA-106 (homologación visual M3)  
**Repo:** ADITSYSTEM  
**Objetivo WCAG:** 2.2 nivel AA (contrato del Design System institucional)  
**Alcance:** `MapPage`, `MapaVista`, `PanelCapas`, primitivos `map.tsx` (MapLibre). **Fuera de alcance:** reemplazar MapLibre.

## Resumen ejecutivo

El explorador **mapa + lista** cumple el patrón recomendado para producto público: la **lista lateral es la vía principal equivalente** cuando el lienzo WebGL no es operable con teclado o lector de pantalla. Tras TRA-110, filtros y listado son navegables con teclado; el mapa deja de capturar atajos de teclado (`keyboard: false`); controles del mapa usan etiquetas en español; el diálogo de capas mejora semántica y cierre con Escape.

**Riesgo residual P0:** puntos y clusters renderizados en **canvas** (capas MapLibre) no exponen nodos DOM focusables ni nombres accesibles por evento. Esto es una **limitación conocida de la librería**, no un bug aislado del producto. La mitigación aceptada es mantener la lista sincronizada con la selección y documentar el gap (ver §4).

## Metodología

| Capa               | Qué se revisó                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Código             | ARIA, roles, labels, focus, `aria-live`, contraste tokens, tamaños tipográficos                                                                                        |
| Manual (checklist) | Tab solo: filtros → resultados → detalle → acciones; Escape en capas; botón mostrar/ocultar explorador en móvil                                                        |
| Automatizada       | **No ejecutada en CI** (sin `axe-core` en repo). Recomendación: smoke `axe` sobre `#map-explorer` en E2E futuro; **no** escanear canvas MapLibre como fuente de verdad |

Regla del proyecto: pasar axe en el shell HTML **no** implica accesibilidad del mapa cartográfico.

## Inventario de superficies

| Superficie                             | Archivo                      | Rol a11y                                                             |
| -------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Explorador (filtros + lista + detalle) | `MapPage.tsx`, `MapPage.css` | Región `aside` con `aria-label`; resultados con `aria-live="polite"` |
| Lienzo mapa                            | `map.tsx`, `MapaVista.tsx`   | Complemento visual; hint `sr-only` + `aria-describedby`              |
| Controles zoom / ubicación / base      | `MapControls` en `map.tsx`   | Botones con `aria-label`                                             |
| Marcador DOM seleccionado              | `MapaVista.tsx`              | `button` con `aria-label`                                            |
| Puntos/cluster en canvas               | `MapClusterLayer`            | Solo puntero; mitigación = lista                                     |
| Capas territoriales                    | `PanelCapas.tsx`             | `role="dialog"`, `aria-modal`                                        |

## Hallazgos (clasificación DS)

| ID          | Severidad    | Categoría        | Hallazgo                                                                      | Evidencia                                                         | Impacto                                                     | Estado TRA-110                                                    |
| ----------- | ------------ | ---------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| A11Y-MAP-01 | **CRITICAL** | ACCESSIBILITY    | Puntos y clusters en canvas sin equivalente teclado/SR                        | `MapClusterLayer` en `map.tsx`; clicks en capas `circle`/`symbol` | Usuario solo teclado/SR no puede “pulsar” un punto del mapa | **Mitigado** (lista + hint); gap documentado                      |
| A11Y-MAP-02 | HIGH         | ACCESSIBILITY    | Controles de mapa en inglés                                                   | `MapControls` labels previos                                      | SR anuncia idioma incorrecto                                | **Resuelto** (español)                                            |
| A11Y-MAP-03 | HIGH         | ACCESSIBILITY    | `Field` no enlazaba `<select>` con `<label>`                                  | `Field.tsx` solo clonaba `input`                                  | Filtros Tipo/Fecha sin nombre accesible                     | **Resuelto** (`select`/`textarea`)                                |
| A11Y-MAP-04 | HIGH         | ACCESSIBILITY    | `aria-controls` apuntaba a `#map-event-results` en lugar del panel explorador | `MapPage.tsx` toggle sidebar                                      | Relación control/región incorrecta para SR                  | **Resuelto** (`#map-explorer`)                                    |
| A11Y-MAP-05 | MEDIUM       | ACCESSIBILITY    | MapLibre capturaba flechas cuando el canvas tenía foco                        | Opción por defecto `keyboard: true`                               | Trampa de teclado al tabular                                | **Resuelto** (`keyboard={false}` en `MapaVista`)                  |
| A11Y-MAP-06 | MEDIUM       | ACCESSIBILITY    | Diálogo capas sin `aria-modal`, Escape ni foco inicial                        | `PanelCapas.tsx`                                                  | Modal difícil de cerrar con teclado                         | **Parcial** (Escape + foco en cerrar); falta trap + devolver foco |
| A11Y-MAP-07 | MEDIUM       | ACCESSIBILITY    | Ítems geocerca sin estado seleccionado                                        | Lista en `PanelCapas`                                             | SR no distingue selección                                   | **Resuelto** (`aria-pressed`)                                     |
| A11Y-MAP-08 | MEDIUM       | UX / CONSISTENCY | Chrome mapa/capas aún estilo cyber (mono 9–10px)                              | `PanelCapas.tsx`, inline en `MapaVista`                           | Legibilidad / zoom 200%                                     | **Abierto** → TRA-106                                             |
| A11Y-MAP-09 | LOW          | ACCESSIBILITY    | Popup marcador sin botón cerrar; depende de mapa                              | `MarkerPopup`                                                     | Menor; lista alternativa                                    | **Abierto** (mejora opcional)                                     |
| A11Y-MAP-10 | LOW          | ACCESSIBILITY    | Popups/cierres en inglés en primitivo                                         | `map.tsx` “Close popup”                                           | Copy SR                                                     | **Abierto** (i18n primitivo map)                                  |

## Lista usable sin puntero (criterio de aceptación)

Flujo verificado por diseño e implementación:

1. Tab hasta **Buscar**, **Tipo**, **Fecha** (labels asociados vía `Field`).
2. Tab a cada **botón de evento** en la lista; **Enter/Espacio** selecciona (`aria-pressed="true"`, badge “Seleccionado”).
3. Panel **detalle** expone enlaces “Ver detalle” y “Cómo llegar” focusables.
4. En viewport estrecho, si el explorador está oculto: **Mostrar explorador** (toolbar) restaura el panel (`aria-expanded` / `aria-controls`).
5. **Capas:** botón “Capas” abre diálogo; **Escape** cierra; toggles usan `role="switch"` + `aria-checked`.

**No requerido:** operar pan/zoom del lienzo sin puntero (controles de zoom son botones separados y focusables).

## Marcadores MapLibre (gap documentado)

| Tipo                         | DOM                | Teclado | SR                | Alternativa producto                  |
| ---------------------------- | ------------------ | ------- | ----------------- | ------------------------------------- |
| Cluster / punto suelto       | Canvas             | No      | No                | Lista filtrada + selección            |
| Marcador evento seleccionado | Sí (`button` 18px) | Sí      | Sí (`aria-label`) | Redundante con lista (aceptable)      |
| Geometrías geocerca          | Canvas             | No      | No                | Lista en `PanelCapas` + metadatos pie |

**No se sustituirá la librería** en este epic. Mejoras futuras posibles (P1, no comprometidas aquí):

- Lista “resultados en mapa” espejo de features visibles (ya parcialmente vía `visibleEvents`).
- Anuncio `aria-live` al cambiar selección desde mapa (sincronizar con lista).
- Patrón “skip to event list” en shell público (TRA-105).

## Contraste y tokens

- `MapPage.css` usa `--md-sys-color-*` para lista y focus (`outline` primario).
- `--cyber-*` en `tokens.css` **alias** a M3 en tema actual; el riesgo de contraste persiste donde se usan tamaños **9px** y mono decorativo en `PanelCapas` (A11Y-MAP-08).
- Clusters usan colores fijos `#168d9a`, `#7566d9`, `#c77515` (data-viz); validar contraste texto blanco en auditoría visual TRA-106.

## Issues P0 de seguimiento (post informe)

| ID informe  | Acción                                             | Issue destino               |
| ----------- | -------------------------------------------------- | --------------------------- |
| A11Y-MAP-01 | Aceptar mitigación + copy en docs usuario          | TRA-110 (este doc)          |
| A11Y-MAP-06 | Focus trap completo + devolver foco al botón Capas | Backlog hijo TRA-103        |
| A11Y-MAP-08 | Migrar `PanelCapas` / chrome mapa a M3             | TRA-106                     |
| A11Y-MAP-10 | i18n primitivos `map.tsx`                          | TRA-106 o issue técnico map |

## Cambios entregados en TRA-110 (código)

- `Field.tsx`: asocia label a `input`, `select`, `textarea`.
- `MapPage.tsx`: `#map-explorer`, hint `sr-only`, `aria-controls` corregido.
- `MapaVista.tsx`: `keyboard={false}`; etiqueta marcador legible.
- `map.tsx`: `aria-label` de controles en español; iconos decorativos `aria-hidden`.
- `PanelCapas.tsx`: `aria-modal`, Escape, foco inicial, `aria-pressed` en geocercas.

## Pruebas recomendadas antes de merge

```bash
npm run format && npm run lint && npm run format:check && npm test && npm run build
```

Manual: teclado solo en `/mapa` (desktop + ancho móvil); VoiceOver en lista y diálogo capas; zoom 200% en explorador.

## Referencias

- [`docs/map-explorer.md`](../map-explorer.md) — comportamiento funcional
- [`docs/design-system/public-surfaces-audit.md`](./public-surfaces-audit.md) — matriz TRA-104 (ítem 1.1.7 / 1.1.15)
- [`docs/design-system.md`](../design-system.md) — contrato WCAG 2.2 AA
