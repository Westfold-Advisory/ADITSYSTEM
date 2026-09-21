# Etapa 1 — Lote 1 (implementación acotada)

**Aprobación PO:** priorizar layout admin + sistema de acciones.  
**PR objetivo:** un solo lote mergeable; sin mapa público ni routing.

## Incluido en este lote

- [x] Documento [`admin-actions.md`](./admin-actions.md).
- [x] Componente `AdminActionBar` para agrupar acciones DS.
- [x] Excluir `.admin-workspace` de estilos legacy `App.css` (botones nativos admin).
- [x] Estilos workspace para barras de acción en `admin-layout.css`.
- [x] Homologar variantes en tarjetas de eventos (una primaria por tarjeta).
- [x] `PersonDetailPanel` usa `AdminActionBar` (drawer y panel embebido).
- [x] Publicar auditoría FASE 1 en repo.

## Fuera de alcance (lotes siguientes)

- Mapa público / cyber migration.
- Dialog confirm institucional (sigue `window.confirm` donde ya existía).
- DataTable primitivo.
- Focus trap drawer (P1 a11y).

## Validación

```bash
npm run lint && npm run format:check && npm test
```

Manual: Eventos admin → una acción filled por tarjeta; Personas → drawer acciones outline; sin botones pill legacy en workspace.
