import assert from "node:assert/strict";
import test from "node:test";

import type { Person, PersonMetrics, ScopedMap } from "@/types/domain";

import {
  DescendantsCache,
  loadPersonSelectionDetails,
  RootBootstrapTracker,
} from "./hierarchy-scope";

function person(id: string): Person {
  return {
    id,
    role: "COORDINADOR_GENERAL",
    parentId: null,
    nombre: "Ana",
    apellidoPaterno: "López",
    apellidoMaterno: "Pérez",
    telefono: "5555555555",
    status: "ACTIVO",
    registeredAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
}

test("DescendantsCache deduplicates parallel loads for the same persona", async () => {
  let calls = 0;
  const cache = new DescendantsCache(async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return [person("child")];
  });

  const [first, second] = await Promise.all([
    cache.load("ROOT"),
    cache.load("root"),
  ]);

  assert.equal(calls, 1);
  assert.equal(first, second);
});

test("DescendantsCache serves cached descendants without refetching", async () => {
  let calls = 0;
  const cache = new DescendantsCache(async () => {
    calls += 1;
    return [person("child")];
  });

  await cache.load("person-1");
  await cache.load("person-1");
  assert.equal(calls, 1);
});

test("DescendantsCache invalidate forces a new fetch", async () => {
  let calls = 0;
  const cache = new DescendantsCache(async () => {
    calls += 1;
    return [person("child")];
  });

  await cache.load("person-1");
  cache.invalidate("person-1");
  await cache.load("person-1");
  assert.equal(calls, 2);
});

test("loadPersonSelectionDetails batches metrics and scoped map", async () => {
  let metricsCalls = 0;
  let mapCalls = 0;
  const metrics: PersonMetrics = {
    descendants: 1,
    coordinators: 0,
    links: 0,
    friends: 0,
    documents: 0,
    createdEvents: 0,
    invitations: 0,
    attendances: 0,
  };
  const scopedMap: ScopedMap = { rootPersonId: "root", people: [] };

  const result = await loadPersonSelectionDetails(
    {
      metrics: async () => {
        metricsCalls += 1;
        return metrics;
      },
      scopedMap: async () => {
        mapCalls += 1;
        return scopedMap;
      },
    },
    "root",
  );

  assert.equal(metricsCalls, 1);
  assert.equal(mapCalls, 1);
  assert.deepEqual(result, { metrics, scopedMap });
});

test("loadPersonSelectionDetails forwards abort signal to both requests", async () => {
  const controller = new AbortController();
  const seen: AbortSignal[] = [];
  const api = {
    metrics: async (_id: string, options?: { signal?: AbortSignal }) => {
      if (options?.signal) seen.push(options.signal);
      await new Promise((resolve) => setTimeout(resolve, 20));
      if (options?.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      return {
        descendants: 0,
        coordinators: 0,
        links: 0,
        friends: 0,
        documents: 0,
        createdEvents: 0,
        invitations: 0,
        attendances: 0,
      };
    },
    scopedMap: async (_id: string, options?: { signal?: AbortSignal }) => {
      if (options?.signal) seen.push(options.signal);
      await new Promise((resolve) => setTimeout(resolve, 20));
      if (options?.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      return { rootPersonId: "root", people: [] };
    },
  };

  const pending = loadPersonSelectionDetails(api, "root", controller.signal);
  controller.abort();
  await assert.rejects(pending, (error: unknown) => {
    return error instanceof DOMException && error.name === "AbortError";
  });
  assert.equal(seen.length, 2);
  assert.equal(seen[0], controller.signal);
  assert.equal(seen[1], controller.signal);
});

test("regression TRA-98: anchor updates must not imply repeated root bootstrap", async () => {
  const tracker = new RootBootstrapTracker();
  let getPersonCalls = 0;
  const cache = new DescendantsCache(async () => []);

  const loadChildren = async (node: Person) => {
    await cache.load(node.id);
  };

  const bootstrap = async () => {
    tracker.record();
    getPersonCalls += 1;
    const root = person("root");
    await loadChildren(root);
    return root;
  };

  await bootstrap();
  const root = person("root");
  await loadChildren(root);
  assert.equal(getPersonCalls, 1);
  assert.equal(tracker.total(), 1);
});
