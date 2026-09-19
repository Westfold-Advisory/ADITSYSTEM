export function normalizePathname(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}
