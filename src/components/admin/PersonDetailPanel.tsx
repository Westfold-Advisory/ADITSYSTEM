import { useMemo, useRef, useState, type RefObject } from "react";
import { X } from "lucide-react";
import { Tabs } from "radix-ui";

import type { DomainApi } from "@/api/domain";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { EmptyState, LoadingState } from "@/components/ui/AsyncState";
import {
  canChangeCredentials,
  createOptionsForSelection,
  isAuthenticatableRole,
  type PersonCreateOption,
} from "@/lib/person-provisioning";
import type {
  AuthenticatedRole,
  Person,
  PersonInput,
  PersonMetrics,
  PersonProvisionInput,
  ScopedMap,
} from "@/types/domain";

import { MetricGrid } from "@/components/ui/MetricGrid";
import { RoleChip } from "@/components/ui/RoleChip";

import { AdminActionBar } from "./AdminActionBar";
import { HierarchyBreadcrumbs } from "./HierarchyBreadcrumbs";
import { PersonSummary } from "./PersonSummary";
import { PersonChangePasswordForm } from "./PersonChangePasswordForm";
import { PersonDocumentsTab } from "./PersonDocumentsTab";
import { PersonForm } from "./PersonForm";
import { useModalFocus } from "@/hooks/useModalFocus";

import { nameOf, roleLabel } from "./person-display";
import { PersonStatusBadge } from "./PersonStatusBadge";

type DetailTab = "resumen" | "persona" | "territorio" | "documentos";

function SummaryTab({ metrics }: { metrics: PersonMetrics | null }) {
  return (
    <MetricGrid
      items={[
        { label: "Descendientes", value: metrics?.descendants ?? "—" },
        { label: "Coordinadores", value: metrics?.coordinators ?? "—" },
        { label: "Enlaces", value: metrics?.links ?? "—" },
        { label: "Amigos", value: metrics?.friends ?? "—" },
        { label: "Documentos", value: metrics?.documents ?? "—" },
        { label: "Eventos", value: metrics?.createdEvents ?? "—" },
      ]}
    />
  );
}

function PersonaTab({ person }: { person: Person }) {
  return (
    <dl className="person-profile-dl">
      <div>
        <dt>Estado</dt>
        <dd>
          <PersonStatusBadge status={person.status} />
        </dd>
      </div>
      <div>
        <dt>Rol</dt>
        <dd>
          <RoleChip role={person.role} />
        </dd>
      </div>
      <div>
        <dt>Teléfono</dt>
        <dd>{person.telefono}</dd>
      </div>
      <div>
        <dt>Registro</dt>
        <dd>{person.registeredAt.toLocaleDateString("es-MX")}</dd>
      </div>
    </dl>
  );
}

function TerritoryTab({
  scopedMap,
  selected,
}: {
  scopedMap: ScopedMap | null;
  selected: Person;
}) {
  if (!scopedMap) {
    return <LoadingState label="Cargando territorio en tu alcance…" />;
  }
  const withGeofences = scopedMap.people.filter(
    (person) => person.geofences.length > 0,
  );
  if (withGeofences.length === 0) {
    return (
      <EmptyState>
        No hay geocercas asignadas en el alcance de {nameOf(selected)}.
      </EmptyState>
    );
  }
  return (
    <ul className="scoped-map-list">
      {withGeofences.map((person) => (
        <li key={person.personId}>
          <strong>{nameOf(person)}</strong> <RoleChip role={person.role} />
          <ul>
            {person.geofences.map((geofence) => (
              <li key={`${person.personId}-${geofence.id}`}>
                {geofence.type}: {geofence.name}
                {geofence.code ? ` (${geofence.code})` : ""}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function PersonDetailTabs({
  selected,
  metrics,
  scopedMap,
  api,
  createOptions,
  canEdit,
  canChangePassword,
  canRegisterDocuments,
  showRemove,
  onStartCreate,
  onStartEdit,
  onStartChangePassword,
  onRemove,
  layout = "embedded",
}: {
  selected: Person;
  metrics: PersonMetrics | null;
  scopedMap: ScopedMap | null;
  api: DomainApi;
  createOptions: PersonCreateOption[];
  canEdit: boolean;
  canChangePassword: boolean;
  canRegisterDocuments: boolean;
  showRemove: boolean;
  onStartCreate: () => void;
  onStartEdit: () => void;
  onStartChangePassword: () => void;
  onRemove: () => void;
  layout?: "drawer" | "embedded";
}) {
  const [tab, setTab] = useState<DetailTab>("resumen");
  const [registerDocumentOpen, setRegisterDocumentOpen] = useState(false);

  const primaryAction = (() => {
    if (tab === "resumen" && createOptions.length > 0) {
      const label =
        createOptions.length === 1
          ? `Registrar ${roleLabel(createOptions[0]!.role)}`
          : "Registrar persona";
      return (
        <Button variant="outline" onClick={onStartCreate}>
          {label}
        </Button>
      );
    }
    if (tab === "persona" && (canEdit || canChangePassword)) {
      return (
        <>
          {canEdit ? (
            <Button variant="outline" onClick={onStartEdit}>
              Editar datos
            </Button>
          ) : null}
          {canChangePassword ? (
            <Button variant="outline" onClick={onStartChangePassword}>
              Cambiar contraseña
            </Button>
          ) : null}
        </>
      );
    }
    if (tab === "documentos" && canRegisterDocuments && !registerDocumentOpen) {
      return (
        <Button variant="outline" onClick={() => setRegisterDocumentOpen(true)}>
          Registrar documento
        </Button>
      );
    }
    return null;
  })();

  const secondaryActions = showRemove ? (
    <Button variant="destructive" onClick={onRemove}>
      Dar de baja
    </Button>
  ) : null;

  const tabsClassName =
    layout === "drawer"
      ? "person-drawer-tabs hierarchy-tabs"
      : "hierarchy-tabs";

  return (
    <>
      {layout === "drawer" ? (
        <>
          <PersonSummary person={selected} metrics={metrics} />
          {(primaryAction || secondaryActions) && (
            <AdminActionBar
              className="person-drawer__actions"
              ariaLabel="Acciones sobre la persona"
            >
              {primaryAction}
              {secondaryActions}
            </AdminActionBar>
          )}
        </>
      ) : (
        <div className="person-detail-heading">
          <div className="person-detail-heading__title">
            <PersonStatusBadge status={selected.status} />
            <h2>{nameOf(selected)}</h2>
          </div>
          {(primaryAction || secondaryActions) && (
            <AdminActionBar ariaLabel="Acciones sobre la persona">
              {primaryAction}
              {secondaryActions}
            </AdminActionBar>
          )}
        </div>
      )}
      <Tabs.Root
        className={tabsClassName}
        value={tab}
        onValueChange={(value) => {
          setTab(value as DetailTab);
          setRegisterDocumentOpen(false);
        }}
      >
        <Tabs.List aria-label="Detalle de persona">
          <Tabs.Trigger value="resumen">Resumen</Tabs.Trigger>
          <Tabs.Trigger value="persona">Persona</Tabs.Trigger>
          <Tabs.Trigger value="territorio">Territorio</Tabs.Trigger>
          <Tabs.Trigger value="documentos">Documentos</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="resumen" className="hierarchy-tab-panel">
          <SummaryTab metrics={metrics} />
        </Tabs.Content>
        <Tabs.Content value="persona" className="hierarchy-tab-panel">
          <PersonaTab person={selected} />
        </Tabs.Content>
        <Tabs.Content value="territorio" className="hierarchy-tab-panel">
          <p className="form-intro">
            Geocercas asignadas a personas dentro del subárbol seleccionado. No
            incluye coordenadas personales ni datos fuera de tu alcance.
          </p>
          <TerritoryTab scopedMap={scopedMap} selected={selected} />
        </Tabs.Content>
        <Tabs.Content value="documentos" className="hierarchy-tab-panel">
          {tab === "documentos" ? (
            <PersonDocumentsTab
              key={selected.id}
              api={api}
              personId={selected.id}
              canRegister={canRegisterDocuments}
              registerOpen={registerDocumentOpen}
              onRegisterOpenChange={setRegisterDocumentOpen}
            />
          ) : null}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export function PersonDetailPanel({
  selected,
  breadcrumb,
  metrics,
  scopedMap,
  api,
  actorRole,
  sessionPersonId,
  canManageSelected,
  canRegisterDocuments,
  creating,
  editing,
  changingPassword,
  onNavigateBreadcrumb,
  onStartCreate,
  onStartEdit,
  onStartChangePassword,
  onCancelForm,
  onCreate,
  onUpdate,
  onChangePassword,
  onRemove,
  onDismiss,
  returnFocusRef,
}: {
  selected: Person;
  breadcrumb: Person[];
  metrics: PersonMetrics | null;
  scopedMap: ScopedMap | null;
  api: DomainApi;
  actorRole: AuthenticatedRole;
  sessionPersonId: string;
  canManageSelected: (person: Person) => boolean;
  canRegisterDocuments: boolean;
  creating: boolean;
  editing: boolean;
  changingPassword: boolean;
  onNavigateBreadcrumb: (person: Person) => void;
  onStartCreate: () => void;
  onStartEdit: () => void;
  onStartChangePassword: () => void;
  onCancelForm: () => void;
  onCreate: (
    input: PersonProvisionInput,
    option: PersonCreateOption,
  ) => Promise<void>;
  onUpdate: (input: PersonInput) => Promise<void>;
  onChangePassword: (newPassword: string) => Promise<void>;
  onRemove: () => void;
  onDismiss?: () => void;
  /** Elemento que abrió el drawer; recibe foco al cerrar. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const createOptions = useMemo(
    () => createOptionsForSelection(actorRole, selected, sessionPersonId),
    [actorRole, selected, sessionPersonId],
  );

  const showForm = creating || editing || changingPassword;
  const canChangePassword =
    canChangeCredentials(actorRole) &&
    isAuthenticatableRole(selected.role) &&
    canManageSelected(selected);
  const isDrawer = Boolean(onDismiss);

  useModalFocus({
    containerRef: drawerRef,
    returnFocusRef,
    onClose: onDismiss ?? (() => undefined),
    initialFocusRef: closeButtonRef,
    enabled: isDrawer,
  });

  const formBlock = (
    <>
      {!isDrawer ? (
        <div className="person-detail-heading">
          <div className="person-detail-heading__title">
            <PersonStatusBadge status={selected.status} />
            <h2>{nameOf(selected)}</h2>
          </div>
        </div>
      ) : (
        <PersonSummary person={selected} metrics={metrics} />
      )}
      {changingPassword ? (
        <PersonChangePasswordForm
          personName={nameOf(selected)}
          onSubmit={onChangePassword}
          onCancel={onCancelForm}
        />
      ) : (
        <PersonForm
          mode={editing ? "edit" : "create"}
          createOptions={createOptions}
          initialCreateOption={createOptions[0]}
          parent={selected}
          initialValues={
            editing
              ? {
                  nombre: selected.nombre,
                  apellidoPaterno: selected.apellidoPaterno,
                  apellidoMaterno: selected.apellidoMaterno,
                  telefono: selected.telefono,
                }
              : undefined
          }
          submitLabel={editing ? "Actualizar" : "Guardar"}
          onSaveCreate={onCreate}
          onSaveUpdate={onUpdate}
          onCancel={onCancelForm}
        />
      )}
    </>
  );

  const tabsBlock = (
    <PersonDetailTabs
      key={selected.id}
      layout={isDrawer ? "drawer" : "embedded"}
      selected={selected}
      metrics={metrics}
      scopedMap={scopedMap}
      api={api}
      createOptions={createOptions}
      canEdit={canManageSelected(selected)}
      canChangePassword={canChangePassword}
      canRegisterDocuments={canRegisterDocuments}
      showRemove={
        selected.id !== sessionPersonId && canManageSelected(selected)
      }
      onStartCreate={onStartCreate}
      onStartEdit={onStartEdit}
      onStartChangePassword={onStartChangePassword}
      onRemove={onRemove}
    />
  );

  if (isDrawer) {
    return (
      <div
        ref={drawerRef}
        className="person-drawer"
        aria-label={`Detalle de ${nameOf(selected)}`}
      >
        <div className="person-drawer__top">
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="sm"
            className="person-drawer__close"
            onClick={onDismiss}
            aria-label="Cerrar detalle"
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        {showForm ? formBlock : tabsBlock}
      </div>
    );
  }

  return (
    <Card className="person-detail hierarchy-detail-panel">
      <HierarchyBreadcrumbs
        path={breadcrumb}
        onNavigate={onNavigateBreadcrumb}
      />
      {showForm ? formBlock : tabsBlock}
    </Card>
  );
}
