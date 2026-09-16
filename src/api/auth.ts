import { ApiClient } from "./http";

export const ADMIN_EVENT_ROLES = ["POLITICO", "GESTOR", "ADMIN"] as const;
export type UserRole = (typeof ADMIN_EVENT_ROLES)[number] | "INVITADO";

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  politico_id: string | null;
  gestor_id: string | null;
  invitado_id: string | null;
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
}
