import { useCallback, useMemo, useState } from "react";

import { DomainApi } from "@/api/domain";
import { ApiClient } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import { HierarchyMasterDetail } from "@/components/admin/HierarchyMasterDetail";
import { HierarchyTreePanel } from "@/components/admin/HierarchyTree";
import { PersonDetailPanel } from "@/components/admin/PersonDetailPanel";
import { apiErrorMessage, roleLabel } from "@/components/admin/person-display";
import { capabilitiesFor } from "@/lib/capabilities";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { useHierarchyScope } from "@/hooks/useHierarchyScope";
import {
  emptyPersonFilter,
  filterPersonList,
  isPersonFilterActive,
  type PersonFilter,
} from "@/lib/person-filters";
import type { Person, PersonInput } from "@/types/domain";

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
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);
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
      setTreeSheetOpen(false);
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
        `Dar de baja a ${selected.nombre}? Esta operación es una baja lógica.`,
      )
    )
      return;
    try {
      await api.deletePerson(selected.id);
      removePersonFromTree(selected.id);
      resetSelectionToRoot();
    } catch (reason) {
      setError(apiErrorMessage(reason));
    }
  };

  if (!capabilities.canViewStructure)
    return (
      <main className="admin-page">
        <ErrorState message="Tu rol no tiene acceso a la estructura." />
      </main>
    );

  const treePanel =
    self &&
    (
      <HierarchyTreePanel
        self={self}
        selectedId={selected?.id ?? null}
        filter={filter}
        filterActive={filterActive}
        filteredChildren={filteredChildren}
        children={children}
        expanded={expanded}
        loadingNode={loadingNode}
        onFilterChange={setFilter}
        onClearFilter={() => setFilter(emptyPersonFilter)}
        onSelect={select}
        onToggle={toggle}
      />
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
        <HierarchyMasterDetail
          treePanel={treePanel}
          hasSelection={Boolean(selected)}
          treeSheetOpen={treeSheetOpen}
          onOpenTreeSheet={() => setTreeSheetOpen(true)}
          onCloseTreeSheet={() => setTreeSheetOpen(false)}
          detailPanel={
            selected ? (
              <PersonDetailPanel
                selected={selected}
                breadcrumb={breadcrumb}
                metrics={metrics}
                scopedMap={scopedMap}
                api={api}
                capabilities={capabilities}
                self={self}
                sessionPersonId={session.user.persona_id}
                canManageSelected={canManageSelected}
                creating={creating}
                editing={editing}
                onNavigateBreadcrumb={select}
                onStartCreate={() => setCreating(true)}
                onStartEdit={() => setEditing(true)}
                onCancelForm={() => {
                  setCreating(false);
                  setEditing(false);
                }}
                onCreate={createChild}
                onUpdate={updatePerson}
                onRemove={() => void remove()}
              />
            ) : null
          }
        />
      )}
    </main>
  );
}
