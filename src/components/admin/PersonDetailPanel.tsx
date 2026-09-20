import { useEffect, useState } from "react";
import { Tabs } from "radix-ui";

import type { DomainApi } from "@/api/domain";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/AsyncState";
import type { Capabilities } from "@/lib/capabilities";
import type {
  Documento,
  Person,
  PersonInput,
  PersonMetrics,
  ScopedMap,
} from "@/types/domain";

import { HierarchyBreadcrumbs } from "./HierarchyBreadcrumbs";
import { PersonForm } from "./PersonForm";
import { apiErrorMessage, nameOf, roleLabel } from "./person-display";

const TAB_IDS = ["resumen", "persona", "territorio", "documentos"] as const;
type DetailTab = (typeof TAB_IDS)[number];

function SummaryTab({ metrics }: { metrics: PersonMetrics | null }) {
  return (
    <dl className="person-metrics">
      <div>
        <dt>Descendientes</dt>
        <dd>{metrics?.descendants ?? "—"}</dd>
      </div>
      <div>
        <dt>Coordinadores</dt>
        <dd>{metrics?.coordinators ?? "—"}</dd>
      </div>
      <div>
        <dt>Enlaces</dt>
        <dd>{metrics?.links ?? "—"}</dd>
      </div>
      <div>
        <dt>Amigos</dt>
        <dd>{metrics?.friends ?? "—"}</dd>
      </div>
      <div>
        <dt>Documentos</dt>
        <dd>{metrics?.documents ?? "—"}</dd>
      </div>
      <div>
        <dt>Eventos</dt>
        <dd>{metrics?.createdEvents ?? "—"}</dd>
      </div>
    </dl>
  );
}

function PersonaTab({ person }: { person: Person }) {
  return (
    <dl className="person-profile-dl">
      <div>
        <dt>Estado</dt>
        <dd>{person.status}</dd>
      </div>
      <div>
        <dt>Rol</dt>
        <dd>
          <span className="role-chip" data-role={person.role}>
            {roleLabel(person.role)}
          </span>
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
          <strong>{nameOf(person)}</strong>{" "}
          <span className="role-chip" data-role={person.role}>
            {roleLabel(person.role)}
          </span>
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

function DocumentsTab({
  api,
  personId,
  active,
}: {
  api: DomainApi;
  personId: string;
  active: boolean;
}) {
  const [documents, setDocuments] = useState<Documento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void api
      .listDocuments(personId)
      .then((items) => {
        if (!cancelled) setDocuments(items);
      })
      .catch((reason) => {
        if (!cancelled) setError(apiErrorMessage(reason));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, api, personId]);

  if (loading && documents === null) {
    return <LoadingState label="Cargando documentos…" />;
  }
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setDocuments(null);
          setError(null);
          setLoading(true);
          void api
            .listDocuments(personId)
            .then(setDocuments)
            .catch((reason) => setError(apiErrorMessage(reason)))
            .finally(() => setLoading(false));
        }}
      />
    );
  }
  if (!documents || documents.length === 0) {
    return (
      <EmptyState>
        Esta persona aún no tiene documentos registrados en el sistema.
      </EmptyState>
    );
  }
  return (
    <ul className="document-list">
      {documents.map((doc) => (
        <li key={doc.id}>
          <strong>{doc.title}</strong>
          <span className="document-meta">
            {doc.type} · v{doc.version} ·{" "}
            {(doc.sizeBytes / 1024).toFixed(1)} KB
            {doc.isCurrent ? " · vigente" : ""}
          </span>
        </li>
      ))}
    </ul>
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
  const [tab, setTab] = useState<DetailTab>("resumen");

  useEffect(() => {
    setTab("resumen");
  }, [selected.id]);

  const showForm = creating || editing;
  const canRegisterChild =
    capabilities.canCreateChild &&
    selected.id === self.id &&
    capabilities.childRole &&
    selected.role !== "AMIGO";

  const primaryAction = (() => {
    if (showForm) return null;
    if (tab === "resumen" && canRegisterChild && capabilities.childRole) {
      return (
        <Button onClick={onStartCreate}>
          Registrar {roleLabel(capabilities.childRole)}
        </Button>
      );
    }
    if (tab === "persona" && canManageSelected(selected)) {
      return (
        <Button onClick={onStartEdit}>Editar datos</Button>
      );
    }
    return null;
  })();

  const secondaryActions =
    !showForm &&
    selected.id !== sessionPersonId &&
    canManageSelected(selected) ? (
      <Button variant="destructive" onClick={onRemove}>
        Dar de baja
      </Button>
    ) : null;

  return (
    <Card className="person-detail hierarchy-detail-panel">
      <HierarchyBreadcrumbs path={breadcrumb} onNavigate={onNavigateBreadcrumb} />
      <div className="person-detail-heading">
        <div>
          <p className="eyebrow">{selected.status}</p>
          <h2>{nameOf(selected)}</h2>
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="detail-primary-actions">
            {primaryAction}
            {secondaryActions}
          </div>
        )}
      </div>

      {showForm ? (
        <PersonForm
          role={creating && capabilities.childRole ? capabilities.childRole : selected.role}
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
      ) : (
        <Tabs.Root
          className="hierarchy-tabs"
          value={tab}
          onValueChange={(value) => setTab(value as DetailTab)}
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
              Geocercas asignadas a personas dentro del subárbol seleccionado.
              No incluye coordenadas personales ni datos fuera de tu alcance.
            </p>
            <TerritoryTab scopedMap={scopedMap} selected={selected} />
          </Tabs.Content>
          <Tabs.Content value="documentos" className="hierarchy-tab-panel">
            <DocumentsTab
              api={api}
              personId={selected.id}
              active={tab === "documentos"}
            />
          </Tabs.Content>
        </Tabs.Root>
      )}
    </Card>
  );
}
