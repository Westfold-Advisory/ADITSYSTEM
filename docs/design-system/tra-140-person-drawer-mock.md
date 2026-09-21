# TRA-140 — Mock drawer de persona (Personio × ADITSYSTEM)

## Objetivo

Probar en producto un **drawer lateral** al estilo Personio con identidad institucional ADITSYSTEM (`tokens.css` / MD3), sin `Card` dentro de `Card`.

## Cuándo aplica

- Vistas **Listado** y **Organigrama** cuando hay persona seleccionada (`onDismiss` en `PersonDetailPanel`).
- **Árbol y detalle** sigue usando el panel embebido con `Card` + breadcrumbs (master–detail clásico).

## Anatomía

| Bloque     | Componente / clase        | Notas                                     |
| ---------- | ------------------------- | ----------------------------------------- |
| Contenedor | `.person-drawer`          | `div`, sin `ui-card`                      |
| Cerrar     | `.person-drawer__close`   | Esquina superior, ghost                   |
| Cabecera   | `PersonSummary`           | Avatar, nombre, rol, estado, hechos clave |
| Acciones   | `.person-drawer__actions` | Botones `outline`                         |
| Pestañas   | `.person-drawer-tabs`     | Tabs ancho completo, indicador primary    |

## Tokens

- Superficie drawer: `--md-sys-color-surface-container-low`
- Avatar: `--md-sys-color-primary-container` / `--md-sys-color-on-primary-container`
- Texto: `--md-sys-typescale-title-large`, `body-medium`, `label-small`
- Borde lateral: `--md-sys-color-outline-variant`

## Próximo paso DS

- Promover `PersonSummary` a componente **Identity** del Design System.
- Unificar drawer en mapa de cobertura (pin seleccionado) reutilizando el mismo shell.
