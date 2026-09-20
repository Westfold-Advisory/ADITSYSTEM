import { ApiError, type RequestAccess } from "@/api/http";

/** Mensaje único ante fallo de credenciales (anti-enumeración de cuentas). */
export const LOGIN_FAILURE_MESSAGE =
  "No pudimos iniciar sesión. Verifica tu correo y contraseña e inténtalo de nuevo.";

export const SESSION_EXPIRED_MESSAGE =
  "Tu sesión expiró. Vuelve a iniciar sesión para continuar.";

export const FORBIDDEN_ROLE_MESSAGE =
  "Tu cuenta no tiene permiso para acceder a esta sección administrativa.";

export const GENERIC_REQUEST_FAILURE_MESSAGE =
  "No fue posible completar la solicitud. Inténtalo de nuevo más tarde.";

export function loginFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return LOGIN_FAILURE_MESSAGE;
    }
    if (error.status >= 500) {
      return GENERIC_REQUEST_FAILURE_MESSAGE;
    }
    return LOGIN_FAILURE_MESSAGE;
  }
  return LOGIN_FAILURE_MESSAGE;
}

export function safeHttpErrorMessage(
  status: number,
  access: RequestAccess = "public",
): string {
  if (status === 401) {
    return access === "public"
      ? LOGIN_FAILURE_MESSAGE
      : SESSION_EXPIRED_MESSAGE;
  }
  if (status === 403) {
    return access === "public" ? LOGIN_FAILURE_MESSAGE : FORBIDDEN_ROLE_MESSAGE;
  }
  if (status >= 500) {
    return GENERIC_REQUEST_FAILURE_MESSAGE;
  }
  return GENERIC_REQUEST_FAILURE_MESSAGE;
}

export function requestFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return safeHttpErrorMessage(error.status, "authenticated");
    }
    if (error.status >= 500) {
      return GENERIC_REQUEST_FAILURE_MESSAGE;
    }
    return GENERIC_REQUEST_FAILURE_MESSAGE;
  }
  return error instanceof Error
    ? GENERIC_REQUEST_FAILURE_MESSAGE
    : GENERIC_REQUEST_FAILURE_MESSAGE;
}
