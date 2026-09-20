import { useState } from "react";
import { Tabs } from "radix-ui";

import type { DomainApi } from "@/api/domain";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { EmptyState, LoadingState } from "@/components/ui/AsyncState";
import type { Capabilities } from "@/lib/capabilities";
import type {
  Person,
  PersonInput,
  PersonMetrics,
  PersonRole,
  ScopedMap,
} from "@/types/domain";

import { MetricGrid } from "@/components/ui/MetricGrid";
import { RoleChip } from "@/components/ui/RoleChip";

import { HierarchyBreadcrumbs } from "./HierarchyBreadcrumbs";
import { PersonDocumentsTab } from "./PersonDocumentsTab";
import { PersonForm } from "./PersonForm";
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
  canRegisterChild,
  childRole,
  canEdit,
  canRegisterDocuments,
  showRemove,
  onStartCreate,
  onStartEdit,
  onRemove,
}: {
  selected: Person;
  metrics: PersonMetrics | null;
  scopedMap: ScopedMap | null;
  api: DomainApi;
  canRegisterChild: boolean;
  childRole: PersonRole | null;
  canEdit: boolean;
  canRegisterDocuments: boolean;
  showRemove: boolean;
  onStartCreate: () => void;
  onStartEdit: () => void;
  onRemove: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("resumen");
  const [registerDocumentOpen, setRegisterDocumentOpen] = useState(false);

  const primaryAction = (() => {
    if (tab === "resumen" && canRegisterChild && childRole) {
      return (
        <Button onClick={onStartCreate}>
          Registrar {roleLabel(childRole)}
        </Button>
      );
    }
    if (tab === "persona" && canEdit) {
      return <Button onClick={onStartEdit}>Editar datos</Button>;
    }
    if (tab === "documentos" && canRegisterDocuments && !registerDocumentOpen) {
      return (
        <Button onClick={() => setRegisterDocumentOpen(true)}>
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

  return (
    <>
      <div className="person-detail-heading">
        <div className="person-detail-heading__title">
          <PersonStatusBadge status={selected.status} />
          <h2>{nameOf(selected)}</h2>
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="detail-primary-actions">
            {primaryAction}
            {secondaryActions}
          </div>
        )}
      </div>
      <Tabs.Root
        className="hierarchy-tabs"
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
  capabilities,
  self,
  sessionPersonId,
  canManageSelected,
  canRegisterDocuments,
  creating,
  editing,
  onNavigateBreadcrumb,
  onStartCreate,
  onStartEdit,
  onCancelForm,
  onCreate,
  onUpdate,
  onRemove,
}: {
  selected: Person;
  breadcrumb: Person[];
  metrics: PersonMetrics | null;
  scopedMap: ScopedMap | null;
  api: DomainApi;
  capabilities: Capabilities;
  self: Person;
  sessionPersonId: string;
  canManageSelected: (person: Person) => boolean;
  canRegisterDocuments: boolean;
  creating: boolean;
  editing: boolean;
  onNavigateBreadcrumb: (person: Person) => void;
  onStartCreate: () => void;
  onStartEdit: () => void;
  onCancelForm: () => void;
  onCreate: (input: PersonInput) => Promise<void>;
  onUpdate: (input: PersonInput) => Promise<void>;
  onRemove: () => void;
}) {
  const showForm = creating || editing;
  const canRegisterChild =
    capabilities.canCreateChild &&
    selected.id === self.id &&
    capabilities.childRole &&
    selected.role !== "AMIGO";

  return (
    <Card className="person-detail hierarchy-detail-panel">
      <HierarchyBreadcrumbs
        path={breadcrumb}
        onNavigate={onNavigateBreadcrumb}
      />

      {showForm ? (
        <>
          <div className="person-detail-heading">
            <div className="person-detail-heading__title">
              <PersonStatusBadge status={selected.status} />
              <h2>{nameOf(selected)}</h2>
            </div>
          </div>
          <PersonForm
            role={
              creating && capabilities.childRole
                ? capabilities.childRole
                : selected.role
            }
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
            onSave={editing ? onUpdate : onCreate}
            onCancel={onCancelForm}
          />
        </>
      ) : (
        <PersonDetailTabs
          key={selected.id}
          selected={selected}
          metrics={metrics}
          scopedMap={scopedMap}
          api={api}
          canRegisterChild={Boolean(canRegisterChild)}
          childRole={capabilities.childRole}
          canEdit={canManageSelected(selected)}
          canRegisterDocuments={canRegisterDocuments}
          showRemove={
            selected.id !== sessionPersonId && canManageSelected(selected)
          }
          onStartCreate={onStartCreate}
          onStartEdit={onStartEdit}
          onRemove={onRemove}
        />
      )}
    </Card>
  );
}
