# Patrón — eventos públicos (`EventList` / `EventCard` / `EventDetail`)

**Issue:** TRA-107 · **Epic:** TRA-103  
**Ubicación:** `src/components/events/public/`

## Inventario DS

| Componente         | Archivo                |
| ------------------ | ---------------------- |
| `EventList`        | `EventList.tsx`        |
| `EventCard`        | `EventCard.tsx`        |
| `EventDetail`      | `EventDetail.tsx`      |
| `EventStatusBadge` | `EventStatusBadge.tsx` |

Estilos M3: `events-public.css` (sin `--cyber-*`).

## Contratos

- Filtrar con `isPublishedEvent` antes de renderizar.
- `Button` + `Card` del DS; estados async vía `ui/AsyncState`.
- URL de detalle: `?evento=<uuid>` con `history.pushState` (`public-event-url.ts`).

Ver también [`design-system.md`](../design-system.md).
