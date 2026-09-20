import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { DomainApi } from "@/api/domain";
import { buildChildMap, mergePersonScope } from "@/lib/hierarchy";
import type { Person } from "@/types/domain";

import {
  DescendantsCache,
  isAbortError,
  loadPersonSelectionDetails,
} from "./hierarchy-scope";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "No fue posible completar la solicitud.";
}

export function useHierarchyScope(api: DomainApi, rootPersonId: string) {
  const descendantsCache = useMemo(
    () =>
      new DescendantsCache((id, signal) =>
        api.listDescendants(id, signal ? { signal } : undefined),
      ),
    [api],
  );

  const anchorRef = useRef<Person | null>(null);
  const [self, setSelf] = useState<Person | null>(null);
  const [selected, setSelected] = useState<Person | null>(null);
  const [childrenById, setChildrenById] = useState<Record<string, Person[]>>(
    {},
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingNode, setLoadingNode] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Awaited<
    ReturnType<DomainApi["metrics"]>
  > | null>(null);
  const [scopedMap, setScopedMap] = useState<Awaited<
    ReturnType<DomainApi["scopedMap"]>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(
    async (person: Person, anchor?: Person) => {
      const treeRoot = anchor ?? anchorRef.current ?? person;
      setLoadingNode(person.id);
      setError(null);
      try {
        const descendants = await descendantsCache.load(person.id);
        setChildrenById((current) => ({
          ...current,
          ...buildChildMap(
            treeRoot,
            mergePersonScope(treeRoot, current, descendants),
          ),
        }));
      } catch (reason) {
        if (isAbortError(reason)) return;
        setError(errorMessage(reason));
      } finally {
        setLoadingNode((current) => (current === person.id ? null : current));
      }
    },
    [descendantsCache],
  );

  const refreshDescendants = useCallback(
    async (person: Person) => {
      descendantsCache.invalidate(person.id);
      await loadChildren(person);
    },
    [descendantsCache, loadChildren],
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void (async () => {
      setError(null);
      try {
        const current = await api.getPerson(rootPersonId, {
          signal: controller.signal,
        });
        if (!active) return;
        anchorRef.current = current;
        setSelf(current);
        setSelected(current);
        setExpanded({ [current.id]: true });
        await loadChildren(current, current);
      } catch (reason) {
        if (!active || isAbortError(reason)) return;
        setError(errorMessage(reason));
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, rootPersonId, loadChildren]);

  const selectedId = selected?.id ?? null;

  useEffect(() => {
    if (!selectedId) {
      setMetrics(null);
      setScopedMap(null);
      return;
    }
    const controller = new AbortController();
    setMetrics(null);
    setScopedMap(null);
    void loadPersonSelectionDetails(api, selectedId, controller.signal)
      .then(({ metrics: nextMetrics, scopedMap: nextMap }) => {
        if (controller.signal.aborted) return;
        setMetrics(nextMetrics);
        setScopedMap(nextMap);
      })
      .catch((reason) => {
        if (controller.signal.aborted || isAbortError(reason)) return;
        setError(errorMessage(reason));
      });
    return () => controller.abort();
  }, [api, selectedId]);

  const select = useCallback((person: Person) => {
    setSelected(person);
  }, []);

  const toggle = useCallback(
    (person: Person) => {
      const next = !expanded[person.id];
      setExpanded((current) => ({ ...current, [person.id]: next }));
      if (next && !childrenById[person.id]) void loadChildren(person);
    },
    [childrenById, expanded, loadChildren],
  );

  const applyPersonUpdate = useCallback((updated: Person) => {
    setSelected((current) =>
      current?.id === updated.id ? updated : current,
    );
    setChildrenById((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, items]) => [
          id,
          items.map((person) => (person.id === updated.id ? updated : person)),
        ]),
      ),
    );
    if (anchorRef.current?.id === updated.id) {
      anchorRef.current = updated;
      setSelf(updated);
    }
  }, []);

  const removePersonFromTree = useCallback((personId: string) => {
    setChildrenById((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, items]) => [
          id,
          items.filter((item) => item.id !== personId),
        ]),
      ),
    );
    descendantsCache.invalidate();
  }, [descendantsCache]);

  const resetSelectionToRoot = useCallback(() => {
    if (anchorRef.current) setSelected(anchorRef.current);
  }, []);

  const expandNode = useCallback((personId: string) => {
    setExpanded((current) => ({ ...current, [personId]: true }));
  }, []);

  return {
    self,
    selected,
    select,
    childrenById,
    expanded,
    expandNode,
    loadingNode,
    metrics,
    scopedMap,
    error,
    setError,
    loadChildren,
    refreshDescendants,
    toggle,
    applyPersonUpdate,
    removePersonFromTree,
    resetSelectionToRoot,
  };
}
