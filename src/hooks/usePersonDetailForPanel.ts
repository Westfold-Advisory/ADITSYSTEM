import { useCallback, useEffect, useMemo, useState } from "react";

import type { DomainApi } from "@/api/domain";
import type { LoginResponse } from "@/api/auth";
import { capabilitiesFor } from "@/lib/capabilities";
import { canRegisterDocuments } from "@/lib/document-access";
import {
  buildKnownPersonsForDocumentAccess,
  buildPersonBreadcrumb,
  canManagePerson,
  loadPersonAncestorChain,
} from "@/lib/person-detail-context";
import type { Person, PersonMetrics, ScopedMap } from "@/types/domain";
import type { UUID } from "@/types/events";

import { isAbortError, loadPersonSelectionDetails } from "./hierarchy-scope";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "No fue posible completar la solicitud.";
}

export function usePersonDetailForPanel({
  api,
  session,
  personId,
}: {
  api: DomainApi;
  session: LoginResponse;
  personId: UUID | null;
}) {
  const capabilities = useMemo(
    () => capabilitiesFor(session.user.rol),
    [session.user.rol],
  );

  const [self, setSelf] = useState<Person | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [ancestors, setAncestors] = useState<Person[]>([]);
  const [selectionDetails, setSelectionDetails] = useState<{
    personId: string;
    metrics: PersonMetrics;
    scopedMap: ScopedMap;
  } | null>(null);
  const [personLoading, setPersonLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void api
      .getPerson(session.user.persona_id, { signal: controller.signal })
      .then((loaded) => {
        if (!controller.signal.aborted) setSelf(loaded);
      })
      .catch((reason) => {
        if (controller.signal.aborted || isAbortError(reason)) return;
        setError(errorMessage(reason));
      });
    return () => controller.abort();
  }, [api, session.user.persona_id]);

  useEffect(() => {
    if (!personId) return;

    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setPersonLoading(true);
      setError(null);
    });

    void (async () => {
      try {
        const loaded = await api.getPerson(personId, {
          signal: controller.signal,
        });
        const chain = await loadPersonAncestorChain(
          (id, options) => api.getPerson(id, options),
          loaded,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setPerson(loaded);
        setAncestors(chain);
      } catch (reason) {
        if (controller.signal.aborted || isAbortError(reason)) return;
        setError(errorMessage(reason));
        setPerson(null);
        setAncestors([]);
      } finally {
        if (!controller.signal.aborted) setPersonLoading(false);
      }
    })();

    return () => controller.abort();
  }, [api, personId, reloadToken]);

  useEffect(() => {
    if (!personId) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setDetailsLoading(true);
      void loadPersonSelectionDetails(api, personId, controller.signal)
        .then(({ metrics, scopedMap }) => {
          if (controller.signal.aborted) return;
          setSelectionDetails({ personId, metrics, scopedMap });
        })
        .catch((reason) => {
          if (controller.signal.aborted || isAbortError(reason)) return;
          setError(errorMessage(reason));
        })
        .finally(() => {
          if (!controller.signal.aborted) setDetailsLoading(false);
        });
    });
    return () => controller.abort();
  }, [api, personId, reloadToken]);

  const metrics = useMemo(() => {
    if (!personId || selectionDetails?.personId !== personId) return null;
    return selectionDetails.metrics;
  }, [personId, selectionDetails]);

  const scopedMap = useMemo(() => {
    if (!personId || selectionDetails?.personId !== personId) return null;
    return selectionDetails.scopedMap;
  }, [personId, selectionDetails]);

  const activePerson = personId && person?.id === personId ? person : null;
  const activeAncestors = useMemo(
    () => (activePerson ? ancestors : []),
    [activePerson, ancestors],
  );

  const breadcrumb = useMemo(() => {
    if (!activePerson) return [];
    const known = buildKnownPersonsForDocumentAccess(
      self,
      activePerson,
      activeAncestors,
    );
    return buildPersonBreadcrumb(activePerson, known);
  }, [activeAncestors, activePerson, self]);

  const canManageSelected = useCallback(
    (target: Person) => canManagePerson(target, self, capabilities),
    [capabilities, self],
  );

  const canRegisterDocumentsForSelected = useMemo(() => {
    if (!self || !activePerson) return false;
    const knownPersons = buildKnownPersonsForDocumentAccess(
      self,
      activePerson,
      activeAncestors,
    );
    return canRegisterDocuments(
      session.user.rol,
      capabilities,
      self,
      activePerson,
      knownPersons,
    );
  }, [
    activeAncestors,
    activePerson,
    capabilities,
    self,
    session.user.rol,
  ]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const loading = Boolean(personId) && (personLoading || detailsLoading);

  return {
    self,
    person: activePerson,
    metrics,
    scopedMap,
    breadcrumb,
    canManageSelected,
    canRegisterDocumentsForSelected,
    loading,
    personLoading,
    detailsLoading,
    error,
    refresh,
  };
}
