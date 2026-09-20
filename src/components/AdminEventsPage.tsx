import { useCallback, useEffect, useMemo, useState } from "react";

import type { LoginResponse } from "@/api/auth";
import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import type { Event, EventInput } from "@/types/events";
import { getInstitutionConfig } from "@/config/institution";
import {
  clearAdminSession,
  isAdminSessionExpired,
  persistAdminSession,
  readAdminSession,
  type AdminSession,
} from "@/lib/admin-session";
import {
  requestFailureMessage,
  SESSION_EXPIRED_MESSAGE,
} from "@/lib/auth-messages";
import { UnauthorizedRoleScreen } from "./UnauthorizedRoleScreen";
import { capabilitiesFor } from "@/lib/capabilities";
import { FormularioNuevoEvento } from "./FormularioNuevoEvento";
import { AdminPageHeader } from "./admin/AdminPageHeader";
import { roleLabel } from "./admin/person-display";
import { adminPageTitle } from "@/lib/admin-nav";
import { LoginPage } from "./LoginPage";
import { PublicAppShell } from "./PublicAppShell";
import { EventStatusBadge } from "@/components/events/public/EventStatusBadge";
import { Button } from "./ui/button";
import { Card } from "./ui/Card";
import { EmptyState, ErrorState, LoadingState } from "./ui/AsyncState";

import "@/components/events/public/events-public.css";

function loadAdminSession(): {
  session: AdminSession | null;
  expiredNotice: string | null;
} {
  const stored = readAdminSession();
  if (!stored) return { session: null, expiredNotice: null };
  if (isAdminSessionExpired(stored)) {
    clearAdminSession();
    return { session: null, expiredNotice: SESSION_EXPIRED_MESSAGE };
  }
  return { session: stored, expiredNotice: null };
}

type EventAction =
  "publish" | "unpublish" | "start" | "finish" | "cancel" | "delete";

function actionsFor(
  event: Event,
): Array<{ action: EventAction; label: string; sensitive?: boolean }> {
  switch (event.status) {
    case "BORRADOR":
      return [
        { action: "publish", label: "Publicar" },
        { action: "cancel", label: "Cancelar", sensitive: true },
        { action: "delete", label: "Eliminar", sensitive: true },
      ];
    case "PUBLICADO":
      return [
        { action: "unpublish", label: "Despublicar", sensitive: true },
        { action: "start", label: "Iniciar" },
        { action: "cancel", label: "Cancelar", sensitive: true },
      ];
    case "EN_CURSO":
      return [
        { action: "finish", label: "Finalizar" },
        { action: "cancel", label: "Cancelar", sensitive: true },
      ];
    case "CANCELADO":
      return [{ action: "delete", label: "Eliminar", sensitive: true }];
    case "FINALIZADO":
      return [];
  }
}

function actionButtonVariant(
  action: EventAction,
  sensitive?: boolean,
): "default" | "outline" | "secondary" | "destructive" {
  if (action === "delete") return "destructive";
  if (sensitive) return "outline";
  if (action === "publish" || action === "start" || action === "finish") {
    return "default";
  }
  return "secondary";
}

export function AdminEventsPage() {
  const institution = getInstitutionConfig();
  const [loginNotice, setLoginNotice] = useState<string | null>(() => {
    const loaded = loadAdminSession();
    return loaded.expiredNotice;
  });
  const [session, setSession] = useState<LoginResponse | null>(() => {
    return loadAdminSession().session;
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [editing, setEditing] = useState<Event | null | "new">(null);
  const handleUnauthorized = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setLoginNotice(SESSION_EXPIRED_MESSAGE);
    setEvents([]);
  }, []);
  const api = useMemo(
    () =>
      new EventsApi(
        new ApiClient({
          getAccessToken: () => session?.access_token,
          onUnauthorized: handleUnauthorized,
        }),
      ),
    [handleUnauthorized, session?.access_token],
  );
  const canManage = session
    ? capabilitiesFor(session.user.rol).canManageEvents
    : false;

  useEffect(() => {
    if (!session || !canManage) return;
    void Promise.resolve().then(() => {
      setIsLoading(true);
      setError(null);
      return api
        .listAdmin()
        .then(setEvents)
        .catch((requestError) => setError(requestFailureMessage(requestError)))
        .finally(() => setIsLoading(false));
    });
  }, [api, canManage, session]);

  const login = (nextSession: LoginResponse) => {
    persistAdminSession(nextSession);
    setLoginNotice(null);
    setSession(nextSession);
  };
  const logout = () => {
    clearAdminSession();
    setSession(null);
    setLoginNotice(null);
    setEvents([]);
  };
  const save = async (input: EventInput) => {
    const saved =
      editing === "new"
        ? await api.create(input)
        : await api.update((editing as Event).id, input);
    setEvents((current) =>
      editing === "new"
        ? [saved, ...current]
        : current.map((item) => (item.id === saved.id ? saved : item)),
    );
    setEditing(null);
  };
  const runAction = async (event: Event, action: EventAction) => {
    const confirmation =
      action === "delete"
        ? `Eliminar el evento “${event.name}”? Esta es una baja lógica y solo se permite para borradores o cancelados.`
        : action === "cancel"
          ? `Cancelar el evento “${event.name}”? Esta acción cambia su estado y deja de estar disponible públicamente.`
          : action === "unpublish"
            ? `Despublicar el evento “${event.name}”? Volverá a borrador y dejará de verse públicamente.`
            : null;
    if (confirmation && !window.confirm(confirmation)) return;
    setActiveAction(`${event.id}:${action}`);
    setError(null);
    try {
      if (action === "delete") {
        await api.remove(event.id);
        setEvents((current) => current.filter((item) => item.id !== event.id));
      } else {
        const saved = await api.transition(event.id, action);
        setEvents((current) =>
          current.map((item) => (item.id === saved.id ? saved : item)),
        );
      }
    } catch (requestError) {
      setError(requestFailureMessage(requestError));
    } finally {
      setActiveAction(null);
    }
  };

  if (!session) {
    return (
      <PublicAppShell variant="auth">
        <LoginPage initialNotice={loginNotice} onLogin={login} />
      </PublicAppShell>
    );
  }
  if (!canManage)
    return (
      <UnauthorizedRoleScreen roleLabel={session.user.rol} onSignOut={logout} />
    );

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow={institution.productName}
        title={adminPageTitle("/admin")}
        subtitle={
          <>
            {session.user.email} · alcance {roleLabel(session.user.rol)}
          </>
        }
        onSignOut={logout}
        actions={
          <Button size="sm" onClick={() => setEditing("new")}>
            Crear evento
          </Button>
        }
      />
      {editing ? (
        <FormularioNuevoEvento
          event={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={save}
        />
      ) : (
        <>
          {error && (
            <p className="request-message error" role="alert">
              {error}
            </p>
          )}
          {isLoading ? (
            <LoadingState label="Cargando eventos…" />
          ) : error ? (
            <ErrorState message={error} />
          ) : events.length === 0 ? (
            <EmptyState>
              No hay eventos administrativos todavía. Crea un borrador para
              comenzar.
            </EmptyState>
          ) : (
            <section className="admin-events" aria-live="polite">
              {events.map((event) => (
                <Card key={event.id} className="admin-event-card">
                  <header className="admin-event-card__head">
                    <h2>{event.name}</h2>
                    <EventStatusBadge status={event.status} />
                  </header>
                  <p className="admin-event-card__meta">
                    {event.type} · {event.locationText}
                  </p>
                  <div className="admin-event-card__actions">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(event)}
                    >
                      Editar
                    </Button>
                    {actionsFor(event).map(({ action, label, sensitive }) => {
                      const busy = activeAction === `${event.id}:${action}`;
                      return (
                        <Button
                          key={action}
                          size="sm"
                          variant={actionButtonVariant(action, sensitive)}
                          status={busy ? "loading" : "idle"}
                          onClick={() => void runAction(event, action)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
