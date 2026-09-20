# Rutas públicas y entrada administrativa — propuesta incremental

**Issue:** TRA-114 · **Epic:** TRA-103 · **Matriz base:** TRA-104 (`docs/design-system/public-surfaces-audit.md`, ítems 1.1.5, 1.1.10, 1.1.12)  
**Repo:** ADITSYSTEM · **Revisión documentada:** `main` (router manual en `src/App.tsx`, sin `react-router`)  
**Relacionado:** `docs/frontend-routes.md` (referencia operativa actual), `docs/design-system/tra-114-admin-login-routing.md` (login vs admin)

## Objetivo

Documentar rutas **públicas** (sin autenticación), la **entrada administrativa** y parámetros de consulta compartidos, con una tabla **CURRENT → PROPOSED** que permita evaluar cambios **breaking** antes de implementarlos. Esta tarea **no** implementa redirects ni migraciones de URL (salvo aprobación explícita del PO).

## Modelo de enrutamiento actual

| Aspecto            | Comportamiento                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resolución         | `window.location.pathname` normalizado (`normalizePathname` en `src/lib/routing.ts`; quita `/` final).                                                                     |
| Legacy             | URLs `#/ruta` se reescriben a `/ruta` al cargar (`App.tsx`).                                                                                                               |
| Historial          | `popstate` actualiza la vista; filtros/detalle en eventos y mapa usan `history.pushState` / `replaceState` (`public-event-url.ts`, `PublicEventsPage.tsx`, `MapPage.tsx`). |
| Sub-rutas admin    | **No existen** en la URL; vistas internas (eventos vs jerarquía) son estado React dentro de `/admin`.                                                                      |
| Inventario público | `PUBLIC_PATHS` en `src/lib/public-routes.ts` (lista blanca documental; `/admin` no es pública).                                                                            |

## Parámetros de consulta (superficies públicas)

Aplican en **`/eventos`** y **`/mapa`** (misma convención para enlaces cruzados):

| Parámetro | Valores           | Propósito                                                                |
| --------- | ----------------- | ------------------------------------------------------------------------ |
| `q`       | texto             | Búsqueda por nombre/lugar.                                               |
| `tipo`    | catálogo de tipos | Filtro por tipo de evento (`all` omitido).                               |
| `fecha`   | `today`, `week`   | Filtro temporal (`all` omitido).                                         |
| `evento`  | UUID              | Detalle seleccionado (panel/modal); **no** es una ruta de path dedicada. |

Implementación: `src/lib/public-event-filters.ts`. Helpers de href: `publicEventsDetailHref`, `publicMapHref`, etc.

## Tabla de rutas — CURRENT | PROPOSED | REASON | BREAKING

Leyenda **BREAKING:** `Sí` = enlaces guardados o integraciones externas pueden dejar de funcionar sin redirect; `No` = compatible o sólo añade capacidad; `PO` = requiere decisión de producto antes de implementar.

### Rutas públicas (sin auth)

| CURRENT (implementado)                                                     | PROPOSED                                                                                                                   | REASON                                                                                                               | BREAKING                                                                                                        |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/` → `LoginPage` (vista de entrada institucional)                         | **Resuelto (TRA-126):** implementado — `/` y `/login` muestran el mismo formulario                                         | PO decidió priorizar el acceso administrativo como landing sobre el catálogo público                                 | No (ver nota debajo)                                                                                            |
| `/eventos` → listado de eventos públicos (`PublicEventsPage`)              | Mantener; accesible sólo desde el menú de navegación, ya **no** es la landing (`/`)                                        | URL principal del catálogo público; alineada con nav y 404                                                           | **Sí** para enlaces externos/bookmarks a `/` esperando el listado (ahora ven login) — sin redirect implementado |
| `/mapa` → explorador mapa + lista                                          | Mantener                                                                                                                   | Superficie territorial; debe seguir teniendo equivalente lista (`TRA-104` 1.1.7)                                     | No                                                                                                              |
| Detalle evento: `?evento=<uuid>` en `/eventos` o `/mapa` (con `pushState`) | **Fase A:** mantener query. **Fase B (SEO):** añadir `/eventos/<uuid>` (path) con **redirect 308/301** desde query antigua | Query compartible y funcional hoy; path dedicado mejora OG meta, URLs legibles e indexación futura (`TRA-104` 1.1.5) | **PO** — Fase B: **Sí** si se deja de aceptar `?evento=`; **No** si conviven path + query con redirect          |
| `/privacidad` → aviso integral                                             | Mantener; contenido legal definitivo fuera de alcance epic                                                                 | Cumplimiento UX LFPDPPP-oriented; enlazado desde `InstitutionConfig`                                                 | No                                                                                                              |
| `/privacidad/simplificado` → resumen                                       | Mantener                                                                                                                   | Acceso alternativo documentado en config institucional                                                               | No                                                                                                              |
| Cualquier otra ruta → `NotFoundPage` (404 UI in-app)                       | Mantener; opcional `/404` explícita **no** recomendada (confunde con HTTP 404 de hosting)                                  | SPA resuelve 404 en cliente tras cargar `index.html`                                                                 | No                                                                                                              |
| `#/…` hash legacy                                                          | Mantener normalización one-shot; **no** documentar para enlaces nuevos                                                     | Compatibilidad bookmarks antiguos                                                                                    | No (eliminar soporte hash sería **Sí**)                                                                         |

### Entrada administrativa y consola (auth)

| CURRENT (implementado)                                                             | PROPOSED                                                                                                       | REASON                                                                                | BREAKING                                                                                                |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/login` → `LoginPage` en `PublicAppShell`; post-login `location.assign("/admin")` | Mantener como **URL canónica de acceso**                                                                       | Separar auth de consola; footer/nav institucional (`TRA-109`)                         | No                                                                                                      |
| `/admin` sin sesión → mismo `LoginPage` embebido en `AdminEventsPage`              | **PO pendiente:** redirigir a `/login?next=/admin` (o equivalente) y reservar `/admin` sólo para sesión activa | Elimina duplicación de login y clarifica semántica (`tra-114-admin-login-routing.md`) | **PO** — **Sí** para usuarios que bookmark `/admin` esperando ver formulario ahí (mitigar con redirect) |
| `/admin` con sesión → consola eventos + jerarquía (sin sub-URLs)                   | Mantener en MVP; **futuro opcional:** `/admin/eventos`, `/admin/personas`                                      | Refresh pierde vista interna; sub-rutas mejoran trazabilidad pero aumentan alcance    | **PO** — sub-rutas: **Sí** al cambiar URLs internas                                                     |
| Roles autenticables                                                                | Sin cambio de ruta (401/403 en API)                                                                            | `ADMIN`, `COORDINADOR_GENERAL`, `COORDINADOR`, `ENLACE`; `AMIGO` sin login            | No                                                                                                      |

### Rutas explícitamente fuera de alcance (propuesta)

| Ruta               | Notas                                                   |
| ------------------ | ------------------------------------------------------- |
| `/eventos/:id`     | Propuesta Fase B arriba; **no implementada** como path. |
| API `/api/v1/*`    | Backend distinto; no confundir con rutas del SPA.       |
| Assets `/assets/*` | Vite build; cache largo en S3 (ver hosting).            |

## SEO, indexación y privacidad

| Superficie                               | Recomendación                                                                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/eventos`, `/mapa`, `/privacidad*` | Indexables cuando exista estrategia de contenido; eventos **publicados** sólo vía API pública.                                                                    |
| `/login`, `/admin`                       | **No indexar** — añadir `<meta name="robots" content="noindex,nofollow">` en shell admin/login cuando PO apruebe (hoy **PO pendiente**, no implementado en repo). |
| Detalle `?evento=`                       | Compartible entre usuarios; crawlers pueden no ejecutar JS — path `/eventos/:id` + meta OG es motivación de Fase B.                                               |

## Hosting estático (S3 / CloudFront)

El frontend es un **SPA**: todas las rutas de path válidas deben servir `index.html` y dejar que `App.tsx` decida la vista.

### Desarrollo (Terraform `frontend_deploy_target`)

- Bucket S3 con **website hosting**: `index_document = index.html`, **`error_document = index.html`** (`aditsystem-infrastructure/modules/frontend_deploy_target/main.tf`).
- Efecto: peticiones directas a `/eventos`, `/mapa`, `/login`, etc. reciben el bundle React; rutas inexistentes en S3 devuelven `index.html` y el cliente muestra 404 in-app.
- Deploy CI (`.github/workflows/ci.yml`): assets con cache inmutable; `index.html` y `build-info.json` con `no-cache`.

### CloudFront (opcional, `enable_cloudfront`)

- Invalidación `/*` tras deploy cuando `CLOUDFRONT_DISTRIBUTION_ID` está configurado.
- **PO / infra pendiente:** al activar CloudFront delante del bucket, replicar comportamiento SPA con **Custom Error Response** (403/404 → `/index.html`, respuesta 200) si el origen no es website endpoint — documentar en Terraform antes de activar; hasta entonces el website endpoint S3 ya cumple.

### Implicaciones para cambios de ruta

- Añadir rutas nuevas en `App.tsx` **no** requiere objetos S3 por path.
- Eliminar o renombrar rutas **sí** requiere redirects client-side o reglas CloudFront si existen enlaces externos.
- Query `?evento=` no requiere configuración de hosting adicional.

## Recomendación incremental (orden sugerido)

1. **Documentación (esta tarea)** — baseline acordado; sin cambios de código.
2. **PO: login único en `/login`** — redirect desde `/admin` sin sesión; actualizar enlaces en `PublicAppShell` / docs (`tra-114-admin-login-routing.md`).
3. ~~**PO: canonical `/` vs `/eventos`**~~ — **Resuelto (TRA-126):** `/` es `LoginPage`; `/eventos` es una URL aparte, alcanzable sólo por enlace de menú.
4. **PO: Fase B detalle** — introducir `/eventos/:uuid` manteniendo redirect desde `?evento=` al menos un release.
5. **PO: noindex admin** — meta robots en shells restringidos.
6. **Opcional futuro** — sub-rutas `/admin/*` tras estabilizar shell público (TRA-105–TRA-110).

## Decisiones pendientes de Product Owner

| ID       | Decisión                                               | Opciones                                                                                                   | Impacto                                |
| -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| PO-114-1 | ¿Redirect `/admin` sin sesión → `/login`?              | A) Mantener login duplicado (actual) · B) Redirect (recomendado en `tra-114-admin-login-routing.md`)       | UX, bookmarks, enlaces institucionales |
| PO-114-2 | ~~¿URL canonical del listado?~~ **Resuelto (TRA-126)** | C) `/` es `LoginPage`; `/eventos` es ruta aparte accesible sólo por menú (opción no listada originalmente) | SEO, métricas                          |
| PO-114-3 | ¿Path `/eventos/:id` además de `?evento=`?             | A) Solo query · B) Path + compat query · C) Path y deprecar query                                          | Enlaces compartidos, OG, breaking      |
| PO-114-4 | ¿`noindex` en `/login` y `/admin`?                     | A) Sí · B) No                                                                                              | Visibilidad en buscadores              |
| PO-114-5 | ¿Implementar redirects en código en TRA-114?           | A) No (default issue) · B) Sí, subset aprobado                                                             | Alcance de desarrollo                  |

## Verificación manual (sin backend)

```bash
npm install
npm run dev   # http://localhost:5173
```

| URL                                       | Resultado esperado                                     |
| ----------------------------------------- | ------------------------------------------------------ |
| `/`                                       | Formulario institucional (igual que `/login`, TRA-126) |
| `/eventos`                                | Listado público                                        |
| `/eventos?q=test&evento=<uuid-publicado>` | Listado + detalle si UUID válido en API                |
| `/mapa?evento=<uuid>`                     | Mapa con selección                                     |
| `/login`                                  | Formulario institucional                               |
| `/admin`                                  | Login (hoy) o consola con sesión                       |
| `/privacidad`                             | Aviso integral (placeholder legal)                     |
| `/ruta-inexistente`                       | 404 in-app con enlace a `/eventos`                     |

## Definition of Done — TRA-114

- [x] Tabla completa rutas públicas + entrada auth (CURRENT | PROPOSED | REASON | BREAKING).
- [x] Decisiones PO marcadas explícitamente.
- [x] Notas de hosting S3 / CloudFront alineadas con infra y CI.
- [ ] Merge del documento en `main` (PR).
