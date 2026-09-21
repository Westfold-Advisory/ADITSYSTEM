import { ApiError } from "@/api/http";
import { requestFailureMessage } from "@/lib/auth-messages";

/** Tras 401 el cliente ya redirige a login vía onUnauthorized; no mostrar error en canvas. */
export function adminRequestFailureMessage(error: unknown): string | null {
  if (error instanceof ApiError && error.status === 401) return null;
  return requestFailureMessage(error);
}
