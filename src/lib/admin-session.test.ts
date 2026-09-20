import assert from "node:assert/strict";
import test from "node:test";

import type { LoginResponse } from "@/api/auth";
import {
  adminSessionExpiresAt,
  isAdminSessionExpired,
  type AdminSession,
} from "./admin-session";

const baseSession: LoginResponse = {
  access_token: "token",
  token_type: "bearer",
  expires_in_seconds: 3600,
  user: {
    id: "00000000-0000-4000-8000-000000000001",
    email: "admin@example.com",
    persona_id: "00000000-0000-4000-8000-000000000002",
    rol: "ADMIN",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
};

test("isAdminSessionExpired respeta expires_in_seconds desde logged_in_at", () => {
  const active: AdminSession = {
    ...baseSession,
    logged_in_at: Date.now() - 1000,
  };
  const expired: AdminSession = {
    ...baseSession,
    logged_in_at: Date.now() - baseSession.expires_in_seconds * 1000 - 1,
  };
  assert.equal(isAdminSessionExpired(active), false);
  assert.equal(isAdminSessionExpired(expired), true);
});

test("sin logged_in_at no se asume expiración en cliente", () => {
  assert.equal(isAdminSessionExpired(baseSession), false);
  assert.equal(adminSessionExpiresAt(baseSession), null);
});
