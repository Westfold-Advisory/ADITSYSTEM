import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "@/api/http";
import {
  FORBIDDEN_ROLE_MESSAGE,
  LOGIN_FAILURE_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  loginFailureMessage,
  requestFailureMessage,
  safeHttpErrorMessage,
} from "./auth-messages";

test("loginFailureMessage no expone detalle del backend en 401", () => {
  const message = loginFailureMessage(
    new ApiError(401, "credenciales inválidas"),
  );
  assert.equal(message, LOGIN_FAILURE_MESSAGE);
  assert.doesNotMatch(message, /credenciales/i);
});

test("loginFailureMessage trata 403 igual que 401 en login", () => {
  assert.equal(
    loginFailureMessage(new ApiError(403, "usuario inactivo")),
    LOGIN_FAILURE_MESSAGE,
  );
});

test("safeHttpErrorMessage distingue sesión expirada de login público", () => {
  assert.equal(safeHttpErrorMessage(401, "public"), LOGIN_FAILURE_MESSAGE);
  assert.equal(
    safeHttpErrorMessage(401, "authenticated"),
    SESSION_EXPIRED_MESSAGE,
  );
  assert.equal(safeHttpErrorMessage(403, "admin"), FORBIDDEN_ROLE_MESSAGE);
});

test("requestFailureMessage oculta mensajes técnicos de ApiError", () => {
  assert.equal(
    requestFailureMessage(new ApiError(422, "field required")),
    "No fue posible completar la solicitud. Inténtalo de nuevo más tarde.",
  );
});
