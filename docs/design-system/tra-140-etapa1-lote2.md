# Etapa 1 — Lote 2 (confirm DS, drawer a11y, mapa acciones)

**Issue:** TRA-141 · **Parent:** TRA-140  
**Precondición:** Lote 1 mergeado en `main` (#103–#104).

## Incluido en este lote

- [x] `ConfirmDialog` institucional (`@/components/ui/ConfirmDialog`) con foco inicial en cancelar, trap vía `useModalFocus`, Esc para cerrar.
- [x] Flujo **Dar de baja** en Personas (`DomainAdminPage`) sin `window.confirm`.
- [x] Drawer persona (`PersonDetailPanel`): trap de foco + devolución al disparador al cerrar (listado / organigrama).
- [x] Panel lateral mapa admin: acciones con `AdminActionBar` (`AdminCoverageMapPage`).

## Fuera de alcance (documentado)

| Ubicación             | Uso residual                                               |
| --------------------- | ---------------------------------------------------------- |
| `AdminEventsPage.tsx` | `window.confirm` en delete / cancel / unpublish de eventos |
| Resto del repo        | Sin auditoría exhaustiva en este lote                      |

Migración de confirms de eventos → Lote 3 o issue dedicado.

## Validación automática

```bash
npm run lint && npm run format:check && npm test
```

## Checklist QA manual (PO)

Referencia: [`Product-UI-UX-Modernization-Audit.md`](./Product-UI-UX-Modernization-Audit.md) §10 (drawer).

| #   | Escenario          | Pasos                                                      | Esperado                                                                              |
| --- | ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Confirm baja       | Personas → listado → seleccionar persona → **Dar de baja** | Diálogo DS; copy ES; foco en **Cancelar**; Esc cierra; confirm ejecuta baja           |
| 2   | Drawer teclado     | Listado u organigrama → abrir drawer → Tab / Shift+Tab     | Foco permanece dentro del drawer; orden lógico (cerrar → acciones → tabs → contenido) |
| 3   | Drawer cerrar foco | Cerrar con ✕                                               | Foco vuelve a la fila/tarjeta que abrió el detalle                                    |
| 4   | Mapa acciones      | `/admin/mapa` → pin → panel lateral                        | **Editar persona** dentro de `AdminActionBar`; variante `outline`                     |
| 5   | Regresión Lote 1   | Eventos admin, sidebar, tokens                             | Sin pills legacy en `.admin-workspace`; una primaria por tarjeta evento               |

Preview local: `scripts/run-etapa1-qa-preview.sh` (mismas rutas que Lote 1 + mapa).
