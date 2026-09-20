import type { DomainApi } from "@/api/domain";
import type { Person, PersonMetrics, ScopedMap } from "@/types/domain";

export type ListDescendantsFn = (
  id: string,
  signal?: AbortSignal,
) => Promise<Person[]>;

function cacheKey(id: string): string {
  return id.toLowerCase();
}

export function isAbortError(reason: unknown): boolean {
  if (reason instanceof DOMException && reason.name === "AbortError")
    return true;
  if (
    typeof reason === "object" &&
    reason !== null &&
    "name" in reason &&
    reason.name === "AbortError"
  )
    return true;
  return false;
}

/** In-memory cache with in-flight deduplication per persona id. */
export class DescendantsCache {
  private readonly cache = new Map<string, Person[]>();
  private readonly inFlight = new Map<string, Promise<Person[]>>();
  private readonly listDescendants: ListDescendantsFn;

  constructor(listDescendants: ListDescendantsFn) {
    this.listDescendants = listDescendants;
  }

  peek(id: string): Person[] | undefined {
    return this.cache.get(cacheKey(id));
  }

  invalidate(id?: string): void {
    if (id === undefined) {
      this.cache.clear();
      return;
    }
    this.cache.delete(cacheKey(id));
  }

  async load(id: string, signal?: AbortSignal): Promise<Person[]> {
    const key = cacheKey(id);
    const cached = this.cache.get(key);
    if (cached) return cached;

    let pending = this.inFlight.get(key);
    if (!pending) {
      pending = this.listDescendants(id, signal)
        .then((result) => {
          this.cache.set(key, result);
          this.inFlight.delete(key);
          return result;
        })
        .catch((error) => {
          this.inFlight.delete(key);
          throw error;
        });
      this.inFlight.set(key, pending);
    }
    return pending;
  }
}

export type SelectionDetailsApi = Pick<DomainApi, "metrics" | "scopedMap">;

export interface PersonSelectionDetails {
  metrics: PersonMetrics;
  scopedMap: ScopedMap;
}

/** Loads metrics and scoped map in one parallel batch (deduped at the HTTP layer per call site). */
export async function loadPersonSelectionDetails(
  api: SelectionDetailsApi,
  personId: string,
  signal?: AbortSignal,
): Promise<PersonSelectionDetails> {
  const options = signal ? { signal } : undefined;
  const [metrics, scopedMap] = await Promise.all([
    api.metrics(personId, options),
    api.scopedMap(personId, options),
  ]);
  return { metrics, scopedMap };
}

/** Tracks root bootstrap fetches to detect accidental re-init loops in tests. */
export class RootBootstrapTracker {
  private count = 0;

  record(): number {
    this.count += 1;
    return this.count;
  }

  total(): number {
    return this.count;
  }
}
