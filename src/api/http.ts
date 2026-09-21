import {
  safeHttpErrorMessage,
  SESSION_EXPIRED_MESSAGE,
} from "@/lib/auth-messages";

export interface FastApiValidationIssue {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface ApiValidationError {
  message: string;
  type: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, ApiValidationError[]>;

  constructor(
    status: number,
    message: string,
    fields: Record<string, ApiValidationError[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

/** `admin` is retained for event endpoints; it means a Bearer-authenticated request. */
export type RequestAccess = "public" | "authenticated" | "admin";

export interface ApiRequestOptions extends Omit<
  RequestInit,
  "body" | "headers"
> {
  access?: RequestAccess;
  body?: unknown;
  headers?: HeadersInit;
}

export type UnauthorizedReason = "missing_token" | "rejected";

export interface ApiClientOptions {
  baseUrl?: string;
  getAccessToken?: () => string | null | undefined;
  fetchFn?: typeof fetch;
  /** Se invoca cuando una petición autenticada queda sin sesión válida (401). */
  onUnauthorized?: (reason: UnauthorizedReason) => void;
}

const defaultBaseUrl =
  import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

function toFieldErrors(detail: unknown): Record<string, ApiValidationError[]> {
  if (!Array.isArray(detail)) return {};

  return detail.reduce<Record<string, ApiValidationError[]>>(
    (fields, issue) => {
      if (!isValidationIssue(issue)) return fields;
      const field =
        issue.loc.filter((part) => part !== "body").join(".") || "form";
      (fields[field] ??= []).push({ message: issue.msg, type: issue.type });
      return fields;
    },
    {},
  );
}

function isValidationIssue(value: unknown): value is FastApiValidationIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    "loc" in value &&
    "msg" in value &&
    "type" in value &&
    Array.isArray(value.loc) &&
    typeof value.msg === "string" &&
    typeof value.type === "string"
  );
}

function errorMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (
    Array.isArray(detail) &&
    detail.length > 0 &&
    isValidationIssue(detail[0])
  )
    return detail[0].msg;
  return "La solicitud no pudo completarse.";
}

function shouldUseSafeAuthMessage(
  status: number,
  access: RequestAccess,
): boolean {
  return (
    (status === 401 || status === 403) &&
    (access === "authenticated" || access === "admin")
  );
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => string | null | undefined;
  private readonly fetchFn: typeof fetch;
  private readonly onUnauthorized?: (reason: UnauthorizedReason) => void;
  private readonly inFlightMutations = new Set<string>();

  constructor({
    baseUrl = defaultBaseUrl,
    getAccessToken,
    fetchFn = (input, init) => globalThis.fetch(input, init),
    onUnauthorized,
  }: ApiClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.getAccessToken = getAccessToken;
    this.fetchFn = fetchFn;
    this.onUnauthorized = onUnauthorized;
  }

  /** Presigned URLs (p. ej. S3) fuera de `baseUrl`; reutiliza `fetchFn` inyectable en tests. */
  fetchExternal(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return this.fetchFn(input, init);
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      access = "public",
      body,
      headers,
      method = "GET",
      ...init
    } = options;
    const requestHeaders = new Headers(headers);
    const normalizedMethod = method.toUpperCase();
    const mutationKey = `${normalizedMethod}:${path}`;
    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(normalizedMethod);

    if (access === "authenticated" || access === "admin") {
      const token = this.getAccessToken?.();
      if (!token) {
        this.onUnauthorized?.("missing_token");
        throw new ApiError(401, SESSION_EXPIRED_MESSAGE);
      }
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    if (body !== undefined)
      requestHeaders.set("Content-Type", "application/json");
    if (isMutation && this.inFlightMutations.has(mutationKey)) {
      throw new ApiError(409, "La misma operación ya está en curso.");
    }

    if (isMutation) this.inFlightMutations.add(mutationKey);
    try {
      const response = await this.fetchFn(`${this.baseUrl}${path}`, {
        ...init,
        method: normalizedMethod,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return await this.parseResponse<T>(response, access);
    } finally {
      if (isMutation) this.inFlightMutations.delete(mutationKey);
    }
  }

  private async parseResponse<T>(
    response: Response,
    access: RequestAccess,
  ): Promise<T> {
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type") ?? "";
    const payload: unknown = contentType.includes("application/json")
      ? await response.json()
      : undefined;

    if (!response.ok) {
      const detail =
        typeof payload === "object" && payload !== null && "detail" in payload
          ? payload.detail
          : undefined;
      if (response.status === 401 && access !== "public") {
        this.onUnauthorized?.("rejected");
      }
      const message = shouldUseSafeAuthMessage(response.status, access)
        ? safeHttpErrorMessage(response.status, access)
        : errorMessage(detail);
      throw new ApiError(response.status, message, toFieldErrors(detail));
    }
    return payload as T;
  }
}
