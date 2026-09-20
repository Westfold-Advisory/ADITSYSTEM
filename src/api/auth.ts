import { ApiClient } from "./http";
import type { AuthenticatedRole } from "@/types/domain";
import type { UUID } from "@/types/events";

export const AUTHENTICATED_ROLES = [
  "ADMIN",
  "COORDINADOR_GENERAL",
  "COORDINADOR",
  "ENLACE",
] as const satisfies readonly AuthenticatedRole[];

export interface AuthenticatedUser {
  id: UUID;
  email: string;
  persona_id: UUID;
  rol: AuthenticatedRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in_seconds: number;
  user: AuthenticatedUser;
}

export class AuthApi {
  private readonly client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  login(email: string, password: string): Promise<LoginResponse> {
    return this.client.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  }

  me(): Promise<AuthenticatedUser> {
    return this.client.request<AuthenticatedUser>("/auth/me", {
      access: "authenticated",
    });
  }
}
