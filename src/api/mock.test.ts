import assert from "node:assert/strict";
import test from "node:test";

import { mockFetch } from "./mock";

test("demo API authenticates only the documented fictional account", async () => {
  const response = await mockFetch("http://demo.local/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "demo@adit.local", password: "demo12345" }),
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.user.role, "ADMIN");

  const rejected = await mockFetch("http://demo.local/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "wrong@example.test", password: "wrong" }),
  });
  assert.equal(rejected.status, 401);
});

test("demo API exposes fictional public events and domain records", async () => {
  const events = await mockFetch("http://demo.local/api/v1/public/events");
  const politicos = await mockFetch("http://demo.local/api/v1/politicos");
  assert.equal((await events.json()).length, 1);
  assert.equal((await politicos.json())[0].nombre, "Andrea");
});
