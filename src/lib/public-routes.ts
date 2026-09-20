import { normalizePathname } from "./routing";

/** Rutas accesibles sin autenticación (router manual en App.tsx). */
export const PUBLIC_PATHS = [
  "/",
  "/eventos",
  "/mapa",
  "/login",
  "/privacidad",
  "/privacidad/simplificado",
] as const;

export type PublicPath = (typeof PUBLIC_PATHS)[number];

export function isPublicPath(path: string): path is PublicPath {
  const normalized = normalizePathname(path);
  return (PUBLIC_PATHS as readonly string[]).includes(normalized);
}

export function privacyNoticeKindFromPath(
  path: string,
): "integral" | "simplificado" | null {
  const normalized = normalizePathname(path);
  if (normalized === "/privacidad") return "integral";
  if (normalized === "/privacidad/simplificado") return "simplificado";
  return null;
}
