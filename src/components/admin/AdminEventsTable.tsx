import { EventStatusBadge } from "@/components/events/public/EventStatusBadge";
import { adminUiCopy } from "@/content/admin-ui-es";
import {
  adminEventRowSummary,
  formatAdminEventCapacity,
} from "@/lib/admin-event-display";
import type { Event } from "@/types/events";
import { Button } from "@/components/ui/button";

type EventAction =
  "publish" | "unpublish" | "start" | "finish" | "cancel" | "delete";

export function AdminEventsTable({
  events,
  actionsFor,
  actionButtonVariant,
  activeAction,
  onEdit,
  onRunAction,
}: {
  events: Event[];
  actionsFor: (
    event: Event,
  ) => Array<{ action: EventAction; label: string; sensitive?: boolean }>;
  actionButtonVariant: (
    action: EventAction,
  ) => "default" | "outline" | "destructive";
  activeAction: string | null;
  onEdit: (event: Event) => void;
  onRunAction: (event: Event, action: EventAction) => void;
}) {
  const copy = adminUiCopy.eventos.table;

  return (
    <div className="admin-events-table-wrap">
      <table
        className="admin-events-table"
        aria-labelledby="admin-events-title"
      >
        <caption id="admin-events-title" className="sr-only">
          {copy.caption}
        </caption>
        <thead>
          <tr>
            <th scope="col">{copy.columns.name}</th>
            <th scope="col">{copy.columns.status}</th>
            <th scope="col">{copy.columns.type}</th>
            <th scope="col">{copy.columns.schedule}</th>
            <th scope="col">{copy.columns.capacity}</th>
            <th scope="col">{copy.columns.location}</th>
            <th scope="col">
              <span className="sr-only">{copy.columns.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const { schedule, capacity } = adminEventRowSummary(event);
            const actions = actionsFor(event);
            return (
              <tr key={event.id}>
                <th scope="row" className="admin-events-table__name">
                  {event.name}
                </th>
                <td>
                  <EventStatusBadge status={event.status} />
                </td>
                <td>{event.type}</td>
                <td className="admin-events-table__schedule">{schedule}</td>
                <td>{capacity}</td>
                <td className="admin-events-table__location">
                  {event.locationText}
                </td>
                <td>
                  <div
                    className="admin-events-table__actions"
                    role="group"
                    aria-label={adminUiCopy.eventos.actionsGroup(event.name)}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(event)}
                    >
                      {copy.edit}
                    </Button>
                    {actions.map(({ action, label }) => {
                      const busy = activeAction === `${event.id}:${action}`;
                      return (
                        <Button
                          key={action}
                          size="sm"
                          variant={actionButtonVariant(action)}
                          status={busy ? "loading" : "idle"}
                          onClick={() => onRunAction(event, action)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ul className="admin-events-cards" aria-label={copy.caption}>
        {events.map((event) => {
          const { schedule } = adminEventRowSummary(event);
          const actions = actionsFor(event);
          return (
            <li key={event.id} className="admin-events-cards__item">
              <div className="admin-events-cards__head">
                <strong>{event.name}</strong>
                <EventStatusBadge status={event.status} />
              </div>
              <dl className="admin-events-cards__meta">
                <div>
                  <dt>{copy.columns.type}</dt>
                  <dd>{event.type}</dd>
                </div>
                <div>
                  <dt>{copy.columns.schedule}</dt>
                  <dd>{schedule}</dd>
                </div>
                <div>
                  <dt>{copy.columns.capacity}</dt>
                  <dd>{formatAdminEventCapacity(event.maximumCapacity)}</dd>
                </div>
                <div>
                  <dt>{copy.columns.location}</dt>
                  <dd>{event.locationText}</dd>
                </div>
              </dl>
              <div
                className="admin-events-cards__actions"
                role="group"
                aria-label={adminUiCopy.eventos.actionsGroup(event.name)}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(event)}
                >
                  {copy.edit}
                </Button>
                {actions.map(({ action, label }) => {
                  const busy = activeAction === `${event.id}:${action}`;
                  return (
                    <Button
                      key={action}
                      size="sm"
                      variant={actionButtonVariant(action)}
                      status={busy ? "loading" : "idle"}
                      onClick={() => onRunAction(event, action)}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
