import { useCallback, useMemo, useState, type FormEvent } from "react";

import { DomainApi } from "@/api/domain";
import { ApiClient, ApiError } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import { capabilitiesFor } from "@/lib/capabilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/AsyncState";
import { Field } from "@/components/ui/Field";
import {
  HierarchyLayout,
  HierarchyTreeFilterBar,
  HierarchyTreePanel,
  HierarchyTreeRoot,
} from "@/components/ui/HierarchyTree";
import { MetricGrid } from "@/components/ui/MetricGrid";
import { RoleChip } from "@/components/ui/RoleChip";
import { roleLabel } from "@/lib/role-label";
import { useHierarchyScope } from "@/hooks/useHierarchyScope";
import {
  emptyPersonFilter,
  filterPersonList,
  isPersonFilterActive,
  type PersonFilter,
  type PersonStatusFilter,
} from "@/lib/person-filters";
import { PERSON_STATUSES, type Person, type PersonInput } from "@/types/domain";

const empty: PersonInput = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
};

function message(error: unknown): string {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

function nameOf(
  person: Pick<Person, "nombre" | "apellidoPaterno" | "apellidoMaterno">,
): string {
  return [person.nombre, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function PersonForm({
  role,
  parent,
  initialValues = empty,
  submitLabel = "Guardar",
  onSave,
  onCancel,
}: {
  role: Person["role"];
  parent: Person;
  initialValues?: PersonInput;
  submitLabel?: string;
  onSave: (input: PersonInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PersonInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      setValues(empty);
    } catch (reason) {
      setError(message(reason));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form
      className="domain-form"
      onSubmit={submit}
      aria-label={`Registrar ${roleLabel(role)}`}
    >
      <div>
        <h2>
          {submitLabel === "Guardar" ? "Registrar" : "Editar"} {roleLabel(role)}
        </h2>
        <p className="form-intro">
          Se agregará bajo {nameOf(parent)}. No necesitas capturar un
          identificador.
        </p>
      </div>
      <div className="form-section">
        <p className="eyebrow">Tipo de registro</p>
        <RoleChip role={role} />
      </div>
      <p className="eyebrow">Datos personales</p>
      <div className="event-form-grid">
        <Field label="Nombre">
          <input
            required
            maxLength={120}
            value={values.nombre}
            onChange={(e) => setValues({ ...values, nombre: e.target.value })}
          />
        </Field>
        <Field label="Apellido paterno">
          <input
            required
            maxLength={120}
            value={values.apellidoPaterno}
            onChange={(e) =>
              setValues({ ...values, apellidoPaterno: e.target.value })
            }
          />
        </Field>
        <Field label="Apellido materno">
          <input
            required
            maxLength={120}
            value={values.apellidoMaterno}
            onChange={(e) =>
              setValues({ ...values, apellidoMaterno: e.target.value })
            }
          />
        </Field>
        <Field label="Teléfono">
          <input
            required
            maxLength={30}
            value={values.telefono}
            onChange={(e) => setValues({ ...values, telefono: e.target.value })}
          />
        </Field>
      </div>
      {error && (
        <p className="request-message error" role="alert">
          {error}
        </p>
      )}
      <div className="event-form-actions">
        <Button status={saving ? "loading" : "idle"} type="submit">
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function DomainAdminPage({
  session,
  onBack,
}: {
  session: LoginResponse;
  onBack: () => void;
}) {
  const capabilities = capabilitiesFor(session.user.rol);
  const api = useMemo(
    () =>
      new DomainApi(
        new ApiClient({ getAccessToken: () => session.access_token }),
      ),
    [session.access_token],
  );
  const {
    self,
    selected,
    select: selectPerson,
    childrenById: children,
    expanded,
    loadingNode,
    metrics,
    scopedMap,
    error,
    setError,
    refreshDescendants,
    toggle,
    expandNode,
    applyPersonUpdate,
    removePersonFromTree,
    resetSelectionToRoot,
  } = useHierarchyScope(api, session.user.persona_id);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [filter, setFilter] = useState<PersonFilter>(emptyPersonFilter);
  const filterActive = isPersonFilterActive(filter);
  const filteredChildren = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(children).map(([id, list]) => [
          id,
          filterPersonList(list, filter),
        ]),
      ),
    [children, filter],
  );
  const breadcrumb = useMemo(() => {
    if (!self || !selected) return [];
    const byId = new Map(
      [self, ...Object.values(children).flat()].map((person) => [
        person.id,
        person,
      ]),
    );
    const path: Person[] = [];
    for (
      let current: Person | undefined = selected;
      current;
      current = current.parentId ? byId.get(current.parentId) : undefined
    )
      path.unshift(current);
    return path.length ? path : [selected];
  }, [children, selected, self]);

  const select = useCallback(
    (person: Person) => {
      selectPerson(person);
      setCreating(false);
      setEditing(false);
    },
    [selectPerson],
  );

  const createChild = async (input: PersonInput) => {
    if (!selected || !capabilities.childRole) return;
    await api.createPerson(
      input,
      capabilities.childRole,
      capabilities.childRole === "COORDINADOR_GENERAL" ? null : selected.id,
    );
    setCreating(false);
    await refreshDescendants(selected);
    expandNode(selected.id);
  };
  const updatePerson = async (input: PersonInput) => {
    if (!selected) return;
    const updated = await api.updatePerson(selected.id, input);
    applyPersonUpdate(updated);
    setEditing(false);
  };
  const canManageSelected = (person: Person) =>
    person.id === self?.id ||
    (capabilities.canCreateChild && person.role === capabilities.childRole);
  const remove = async () => {
    if (
      !selected ||
      selected.id === session.user.persona_id ||
      !window.confirm(
        `Dar de baja a ${nameOf(selected)}? Esta operación es una baja lógica.`,
      )
    )
      return;
    try {
      await api.deletePerson(selected.id);
      removePersonFromTree(selected.id);
      resetSelectionToRoot();
    } catch (reason) {
      setError(message(reason));
    }
  };

  if (!capabilities.canViewStructure)
    return (
      <main className="admin-page">
        <ErrorState message="Tu rol no tiene acceso a la estructura." />
      </main>
    );
  return (
    <main className="admin-page hierarchy-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">ADIT SYSTEM</p>
          <h1>Estructura de personas</h1>
          <p>
            {session.user.email} · alcance {roleLabel(session.user.rol)}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Eventos
        </Button>
      </header>
      <p className="request-message">
        Las acciones disponibles dependen de tu alcance. El backend valida rol y
        pertenencia en cada solicitud.
      </p>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => self && void refreshDescendants(self)}
        />
      )}
      {!self ? (
        <LoadingState label="Cargando estructura…" />
      ) : (
        <HierarchyLayout>
          <HierarchyTreePanel title="Tu estructura" titleId="structure-title">
            <HierarchyTreeRoot
              busy={loadingNode === self.id}
              filterBar={
                <HierarchyTreeFilterBar>
                  <Field label="Buscar por nombre">
                    <input
                      type="search"
                      value={filter.text}
                      placeholder="Nombre o apellido"
                      onChange={(event) =>
                        setFilter((current) => ({
                          ...current,
                          text: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Estado">
                    <select
                      value={filter.status}
                      onChange={(event) =>
                        setFilter((current) => ({
                          ...current,
                          status: event.target.value as PersonStatusFilter,
                        }))
                      }
                    >
                      <option value="TODOS">Todos</option>
                      {PERSON_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {filterActive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilter(emptyPersonFilter)}
                    >
                      Limpiar filtro
                    </Button>
                  )}
                </HierarchyTreeFilterBar>
              }
              root={{
                person: self,
                selectedId: selected?.id ?? null,
                expanded: Boolean(expanded[self.id]),
                children: filteredChildren[self.id],
                totalChildren: children[self.id]?.length,
                filterActive,
                loading: loadingNode === self.id,
                expandedById: expanded,
                childrenById: filteredChildren,
                totalChildrenById: children,
                loadingNode,
                onSelect: select,
                onToggle: toggle,
              }}
            />
          </HierarchyTreePanel>
          <section aria-live="polite">
            {selected ? (
              <Card className="person-detail">
                <nav aria-label="Ruta de la persona" className="breadcrumbs">
                  {breadcrumb.map((person, index) => (
                    <span key={person.id}>
                      {index > 0 && <span aria-hidden="true">› </span>}
                      {nameOf(person)}
                    </span>
                  ))}
                </nav>
                <p className="eyebrow">{selected.status}</p>
                <h2>{nameOf(selected)}</h2>
                <p>{selected.telefono}</p>
                <MetricGrid
                  items={[
                    {
                      label: "Descendientes",
                      value: metrics?.descendants ?? "—",
                    },
                    {
                      label: "Coordinadores",
                      value: metrics?.coordinators ?? "—",
                    },
                    { label: "Enlaces", value: metrics?.links ?? "—" },
                    { label: "Amigos", value: metrics?.friends ?? "—" },
                    { label: "Documentos", value: metrics?.documents ?? "—" },
                    { label: "Eventos", value: metrics?.createdEvents ?? "—" },
                  ]}
                />
                <section
                  aria-labelledby="scoped-map-title"
                  className="scoped-map"
                >
                  <h3 id="scoped-map-title">Territorio en tu alcance</h3>
                  <p className="form-intro">
                    Geocercas asignadas a personas dentro del subárbol
                    seleccionado. No incluye coordenadas personales ni datos
                    fuera de tu scope.
                  </p>
                  {!scopedMap ? (
                    <LoadingState label="Cargando mapa scoped…" />
                  ) : scopedMap.people.every(
                      (person) => person.geofences.length === 0,
                    ) ? (
                    <EmptyState>
                      No hay geocercas asignadas en este alcance.
                    </EmptyState>
                  ) : (
                    <ul className="scoped-map-list">
                      {scopedMap.people
                        .filter((person) => person.geofences.length > 0)
                        .map((person) => (
                          <li key={person.personId}>
                            <strong>{nameOf(person)}</strong>{" "}
                            <RoleChip role={person.role} />
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
                  )}
                </section>
                <div className="event-card-actions">
                  {capabilities.canCreateChild &&
                    selected.id === self.id &&
                    capabilities.childRole &&
                    selected.role !== "AMIGO" && (
                      <Button onClick={() => setCreating(true)}>
                        Registrar {roleLabel(capabilities.childRole)}
                      </Button>
                    )}
                  {canManageSelected(selected) && (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Editar datos
                    </Button>
                  )}
                  {selected.id !== session.user.persona_id &&
                    canManageSelected(selected) && (
                      <Button
                        variant="destructive"
                        onClick={() => void remove()}
                      >
                        Dar de baja
                      </Button>
                    )}
                </div>
              </Card>
            ) : (
              <EmptyState>Selecciona una persona de la estructura.</EmptyState>
            )}
            {creating && selected && capabilities.childRole && (
              <PersonForm
                role={capabilities.childRole}
                parent={selected}
                onSave={createChild}
                onCancel={() => setCreating(false)}
              />
            )}
            {editing && selected && (
              <PersonForm
                role={selected.role}
                parent={selected}
                initialValues={{
                  nombre: selected.nombre,
                  apellidoPaterno: selected.apellidoPaterno,
                  apellidoMaterno: selected.apellidoMaterno,
                  telefono: selected.telefono,
                }}
                submitLabel="Actualizar"
                onSave={updatePerson}
                onCancel={() => setEditing(false)}
              />
            )}
          </section>
        </HierarchyLayout>
      )}
    </main>
  );
}
