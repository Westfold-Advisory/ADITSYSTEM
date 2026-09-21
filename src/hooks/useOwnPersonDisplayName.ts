import { useEffect, useState } from "react";

import type { LoginResponse } from "@/api/auth";
import type { DomainApi } from "@/api/domain";
import { adminUserDisplayName } from "@/lib/admin-user-display";
import type { Person } from "@/types/domain";

import { isAbortError } from "./hierarchy-scope";

/**
 * Nombre completo del admin autenticado para el sidebar. `AuthenticatedUser`
 * no trae nombre/apellidos (solo email/rol/persona_id): se resuelve pidiendo
 * su propia persona; mientras carga (o si la sesión cambió de usuario), cae
 * al heurístico basado en el email.
 */
export function useOwnPersonDisplayName(
  api: DomainApi,
  session: LoginResponse | null,
): string {
  const [person, setPerson] = useState<Person | null>(null);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    void api
      .getPerson(session.user.persona_id, { signal: controller.signal })
      .then((loaded) => {
        if (!controller.signal.aborted) setPerson(loaded);
      })
      .catch((reason) => {
        if (controller.signal.aborted || isAbortError(reason)) return;
      });
    return () => controller.abort();
  }, [api, session]);

  if (!session) return "";
  const resolved =
    person && person.id === session.user.persona_id ? person : null;
  return adminUserDisplayName(session.user.email, resolved);
}
