import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "radix-ui";

import { DomainApi } from "@/api/domain";
import { ApiClient } from "@/api/http";
import type { LoginResponse } from "@/api/auth";
import { HierarchyMasterDetail } from "@/components/admin/HierarchyMasterDetail";
import { HierarchyTreePanel } from "@/components/admin/HierarchyTree";
import { PersonDetailPanel } from "@/components/admin/PersonDetailPanel";
import { PersonDirectoryTable } from "@/components/admin/PersonDirectoryTable";
import { PersonOrgChartView } from "@/components/admin/PersonOrgChartView";
import { apiErrorMessage } from "@/components/admin/person-display";
import { capabilitiesFor } from "@/lib/capabilities";
import { canRegisterDocuments } from "@/lib/document-access";
import type { PersonCreateOption } from "@/lib/person-provisioning";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/AsyncState";
import { useHierarchyScope } from "@/hooks/useHierarchyScope";
import {
  collectAncestorIds,
  emptyPersonFilter,
  filterChildMapForTree,
  filterPersonList,
  isPersonFilterActive,
  type PersonFilter,
} from "@/lib/person-filters";
import { collectPeopleInScope } from "@/lib/person-scope";
import type { Person, PersonInput, PersonProvisionInput } from "@/types/domain";

type StructureView = "arbol" | "listado" | "organigrama";

export function DomainAdminPage({ session }: { session: LoginResponse }) {
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
    clearSelection,
  } = useHierarchyScope(api, session.user.persona_id);
  const isAdmin = session.user.rol === "ADMIN";
  const [structureView, setStructureView] = useState<StructureView>(() =>
    isAdmin ? "listado" : "arbol",
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);
  const [filter, setFilter] = useState<PersonFilter>(emptyPersonFilter);
  const filterActive = isPersonFilterActive(filter);
  const filteredChildren = useMemo(
    () => (self ? filterChildMapForTree(self, children, filter) : children),
    [children, filter, self],
  );
  const peopleInScope = useMemo(
    () => (self ? collectPeopleInScope(self, children) : []),
    [children, self],
  );

  const adminListBootRef = useRef(false);
  useEffect(() => {
    if (!self || !isAdmin || adminListBootRef.current) return;
    if (structureView === "listado") {
      clearSelection();
      adminListBootRef.current = true;
    }
  }, [clearSelection, isAdmin, self, structureView]);

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
      setChangingPassword(false);
      setTreeSheetOpen(false);
    },
    [
      selectPerson,
      setCreating,
      setEditing,
      setChangingPassword,
      setTreeSheetOpen,
    ],
  );

  const filterSyncRef = useRef<string>("");
  useEffect(() => {
    if (!self || !filterActive) {
      filterSyncRef.current = "";
      return;
    }
    const key = `${filter.text}|${filter.status}`;
    if (filterSyncRef.current === key) return;
    filterSyncRef.current = key;

    const all = [self, ...Object.values(children).flat()];
    const byId = new Map(
      all.map((person) => [person.id.toLowerCase(), person]),
    );
    const matches = filterPersonList(all, filter);
    if (matches.length === 0) return;

    for (const match of matches) {
      for (const ancestorId of collectAncestorIds(match, byId)) {
        expandNode(ancestorId);
      }
    }

    const selectedStillVisible =
      selected &&
      (matches.some((person) => person.id === selected.id) ||
        matches.some((person) =>
          collectAncestorIds(person, byId).includes(selected.id),
        ));
    if (!selectedStillVisible) {
      select(matches[0]);
    }
  }, [children, expandNode, filter, filterActive, select, selected, self]);

  const createChild = async (
    input: PersonProvisionInput,
    option: PersonCreateOption,
  ) => {
    if (!selected) return;
    const parentForRefresh = option.parentPerson ?? selected;
    await api.createPerson(input, option.role, option.parentId);
    setCreating(false);
    await refreshDescendants(parentForRefresh);
    if (option.parentId) expandNode(option.parentId);
    else if (self) expandNode(self.id);
  };

  const updatePerson = async (input: PersonInput) => {
    if (!selected) return;
    const updated = await api.updatePerson(selected.id, input);
    applyPersonUpdate(updated);
    setEditing(false);
  };

  const changePassword = async (newPassword: string) => {
    if (!selected) return;
    await api.changePersonPassword(selected.id, newPassword);
    setChangingPassword(false);
  };

  const canManageSelected = (person: Person) =>
    person.id === self?.id ||
    (capabilities.canCreateChild && person.role === capabilities.childRole);

  const knownPersons = useMemo(() => {
    if (!self) return new Map<string, Person>();
    return new Map(
      [self, ...Object.values(children).flat()].map((person) => [
        person.id,
        person,
      ]),
    );
  }, [children, self]);
  const canRegisterDocumentsForSelected =
    self && selected
      ? canRegisterDocuments(
          session.user.rol,
          capabilities,
          self,
          selected,
          knownPersons,
        )
      : false;
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

  const treePanel = self && (
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
      hideRoot={isAdmin}
    />
  );

  const detailPanel = selected ? (
    <PersonDetailPanel
      selected={selected}
      breadcrumb={breadcrumb}
      metrics={metrics}
      scopedMap={scopedMap}
      api={api}
      actorRole={session.user.rol}
      sessionPersonId={session.user.persona_id}
      canManageSelected={canManageSelected}
      canRegisterDocuments={canRegisterDocumentsForSelected}
      creating={creating}
      editing={editing}
      changingPassword={changingPassword}
      onNavigateBreadcrumb={select}
      onStartCreate={() => {
        setCreating(true);
        setEditing(false);
        setChangingPassword(false);
      }}
      onStartEdit={() => {
        setEditing(true);
        setCreating(false);
        setChangingPassword(false);
      }}
      onStartChangePassword={() => {
        setChangingPassword(true);
        setCreating(false);
        setEditing(false);
      }}
      onCancelForm={() => {
        setCreating(false);
        setEditing(false);
        setChangingPassword(false);
      }}
      onCreate={createChild}
      onUpdate={updatePerson}
      onChangePassword={changePassword}
      onRemove={() => void remove()}
    />
  ) : null;

  return (
    <>
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
        <>
          <Tabs.Root
            className="hierarchy-tabs hierarchy-view-tabs"
            value={structureView}
            onValueChange={(value) => {
              const next = value as StructureView;
              setStructureView(next);
              if (next === "listado" && isAdmin) clearSelection();
            }}
          >
            <Tabs.List aria-label="Formato de personas">
              <Tabs.Trigger value="listado">Listado</Tabs.Trigger>
              <Tabs.Trigger value="arbol">Árbol y detalle</Tabs.Trigger>
              <Tabs.Trigger value="organigrama">Organigrama</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {structureView === "arbol" ? (
            <HierarchyMasterDetail
              treePanel={treePanel}
              hasSelection={Boolean(selected)}
              treeSheetOpen={treeSheetOpen}
              onOpenTreeSheet={() => setTreeSheetOpen(true)}
              onCloseTreeSheet={() => setTreeSheetOpen(false)}
              detailPanel={detailPanel}
            />
          ) : (
            <div className="hierarchy-alt-layout">
              <div className="hierarchy-alt-primary">
                {structureView === "listado" ? (
                  <PersonDirectoryTable
                    actor={self}
                    people={peopleInScope}
                    selectedId={selected?.id ?? null}
                    filter={filter}
                    onFilterChange={setFilter}
                    onClearFilter={() => setFilter(emptyPersonFilter)}
                    onSelect={select}
                  />
                ) : (
                  <PersonOrgChartView
                    root={self}
                    childrenById={children}
                    selectedId={selected?.id ?? null}
                    onSelect={select}
                  />
                )}
              </div>
              <section
                className="hierarchy-detail-section"
                aria-live="polite"
                aria-label="Detalle de la persona seleccionada"
              >
                {selected ? (
                  detailPanel
                ) : (
                  <EmptyState>
                    Selecciona una persona en el{" "}
                    {structureView === "listado" ? "listado" : "organigrama"}.
                  </EmptyState>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
