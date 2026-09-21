import { useCallback, useEffect, useMemo, useState } from "react";

import { DomainApi } from "@/api/domain";
import { EventsApi } from "@/api/events";
import { ApiClient } from "@/api/http";
import type { Event, EventInput } from "@/types/events";
import { getInstitutionConfig } from "@/config/institution";
import { adminUiCopy } from "@/content/admin-ui-es";
import { useAdminSessionGate } from "@/hooks/useAdminSessionGate";
import { adminRequestFailureMessage } from "@/lib/request-error-handling";
import { UnauthorizedRoleScreen } from "./UnauthorizedRoleScreen";
import { capabilitiesFor } from "@/lib/capabilities";
import { FormularioNuevoEvento } from "./FormularioNuevoEvento";
import { AdminEventsTable } from "./admin/AdminEventsTable";
import { AdminPageHeader } from "./admin/AdminPageHeader";
import { useOwnPersonDisplayName } from "@/hooks/useOwnPersonDisplayName";
import { AdminWorkspaceShell } from "./admin/AdminWorkspaceShell";
import { adminPageTitle } from "@/lib/admin-nav";
import { LoginPage } from "./LoginPage";
import { PublicAppShell } from "./PublicAppShell";
import { Button } from "./ui/button";
import { EmptyState, ErrorState, LoadingState } from "./ui/AsyncState";

import "@/components/events/public/events-public.css";

type EventAction =
  "publish" | "unpublish" | "start" | "finish" | "cancel" | "delete";

function actionsFor(
  event: Event,
): Array<{ action: EventAction; label: string; sensitive?: boolean }> {
  const labels = adminUiCopy.eventos.actions;
  switch (event.status) {
    case "BORRADOR":
      return [
        { action: "publish", label: labels.publish },
        { action: "cancel", label: labels.cancel, sensitive: true },
        { action: "delete", label: labels.delete, sensitive: true },
      ];
    case "PUBLICADO":
      return [
        { action: "unpublish", label: labels.unpublish, sensitive: true },
        { action: "start", label: labels.start },
        { action: "cancel", label: labels.cancel, sensitive: true },
      ];
    case "EN_CURSO":
      return [
        { action: "finish", label: labels.finish },
        { action: "cancel", label: labels.cancel, sensitive: true },
      ];
    case "CANCELADO":
      return [{ action: "delete", label: labels.delete, sensitive: true }];
    case "FINALIZADO":
      return [];
  }
}

function actionButtonVariant(
  action: EventAction,
): "default" | "outline" | "destructive" {
  if (action === "delete") return "destructive";
  if (action === "publish" || action === "start" || action === "finish") {
    return "default";
  }
  return "outline";
}

export function AdminEventsPage() {
  const institution = getInstitutionConfig();
  const {
    session,
    loginNotice,
    login,
    logout,
    handleUnauthorized: expireSession,
  } = useAdminSessionGate();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [editing, setEditing] = useState<Event | null | "new">(null);
  const handleUnauthorized = useCallback(() => {
    expireSession();
    setEvents([]);
    setEditing(null);
    setIsLoading(false);
    setActiveAction(null);
    setError(null);
  }, [expireSession]);
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
  const domainApi = useMemo(
    () =>
      new DomainApi(
        new ApiClient({
          getAccessToken: () => session?.access_token,
          onUnauthorized: handleUnauthorized,
        }),
      ),
    [handleUnauthorized, session?.access_token],
  );
  const userDisplayName = useOwnPersonDisplayName(domainApi, session);
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
        .catch((requestError) => {
          const message = adminRequestFailureMessage(requestError);
          if (message) setError(message);
        })
        .finally(() => setIsLoading(false));
    });
  }, [api, canManage, session]);

  const signOut = () => {
    logout();
    setEvents([]);
    setEditing(null);
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
        ? adminUiCopy.eventos.confirmDelete(event.name)
        : action === "cancel"
          ? adminUiCopy.eventos.confirmCancel(event.name)
          : action === "unpublish"
            ? adminUiCopy.eventos.confirmUnpublish(event.name)
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
      const message = adminRequestFailureMessage(requestError);
      if (message) setError(message);
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
      <UnauthorizedRoleScreen role={session.user.rol} onSignOut={signOut} />
    );

  return (
    <main className="admin-console-page">
      <AdminWorkspaceShell
        header={
          <AdminPageHeader
            eyebrow={institution.productName}
            title={adminPageTitle("/admin")}
            subtitle={adminUiCopy.eventos.pageSubtitle}
            onSignOut={signOut}
            showModuleNav={false}
            showSignOut={false}
            showEyebrow={false}
            actions={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing("new")}
              >
                {adminUiCopy.eventos.createButton}
              </Button>
            }
          />
        }
        userDisplayName={userDisplayName}
        userEmail={session.user.email}
        userRole={session.user.rol}
        onSignOut={signOut}
      >
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
              <LoadingState label={adminUiCopy.eventos.loadingList} />
            ) : error ? (
              <ErrorState message={error} />
            ) : events.length === 0 ? (
              <EmptyState>{adminUiCopy.eventos.emptyList}</EmptyState>
            ) : (
              <section className="admin-events-section" aria-live="polite">
                <AdminEventsTable
                  events={events}
                  actionsFor={actionsFor}
                  actionButtonVariant={actionButtonVariant}
                  activeAction={activeAction}
                  onEdit={(event) => setEditing(event)}
                  onRunAction={(event, action) => void runAction(event, action)}
                />
              </section>
            )}
          </>
        )}
      </AdminWorkspaceShell>
    </main>
  );
}
