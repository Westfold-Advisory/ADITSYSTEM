## Rutas del frontend

La app no usa un router (no hay `react-router`); `src/App.tsx` decide qué
pantalla mostrar leyendo `window.location.pathname` (con un fallback a
`#/...` por compatibilidad). Sólo existen las rutas listadas abajo — cualquier
otra devuelve la página 404.

| Ruta                       | Componente             | Auth    | Descripción                                                                                                                                                                                                     |
| -------------------------- | ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` y `/login`             | `LoginPage`            | Ninguna | Vista de entrada institucional. Acceso administrativo; tras login redirige a `/admin`.                                                                                                                          |
| `/eventos`                 | `PublicEventsPage`     | Ninguna | Listado público de eventos **publicados, en curso, o finalizados en los últimos 7 días**. Accesible solo desde el menú de navegación (no es la landing). Un evento en `BORRADOR` o `CANCELADO` no aparece aquí. |
| `/mapa`                    | `MapPage`              | Ninguna | Explorador de mapa de eventos públicos (MapLibre), con capas territoriales y filtros por texto/tipo/fecha.                                                                                                      |
| `/admin`                   | `AdminEventsPage`      | Login   | Consola administrativa. Sin sesión muestra el mismo login (compatibilidad; ver TRA-114).                                                                                                                        |
| `/admin/mapa`              | `AdminCoverageMapPage` | Login   | Mapa de cobertura jerárquico (pines, capas, heatmap de necesidades).                                                                                                                                            |
| `/admin/personas`          | `AdminStructurePage`   | Login   | Personas: sub-vistas **Listado** (tabla), **Árbol y detalle** y **Organigrama** (prototipo TRA-140).                                                                                                            |
| `/privacidad`              | `PrivacyNoticePage`    | Ninguna | Aviso de privacidad integral.                                                                                                                                                                                   |
| `/privacidad/simplificado` | `PrivacyNoticePage`    | Ninguna | Resumen simplificado.                                                                                                                                                                                           |
| cualquier otra             | `NotFoundPage`         | —       | 404 con link de regreso a `/eventos`.                                                                                                                                                                           |

### Administración autenticada

Las rutas `/admin`, `/admin/mapa` y `/admin/personas` comparten el mismo
menú (`AdminNav`: Personas · Mapa de cobertura · Eventos) y
encabezado (`AdminPageHeader`).

1. **Sin sesión** → `LoginPage` (`POST /auth/login`). Enlace preferido: `/login`. Sólo aceptan
   sesión los roles `ADMIN`, `COORDINADOR_GENERAL`, `COORDINADOR` y `ENLACE`;
   `AMIGO` no tiene credenciales (es una persona administrada, no un usuario).
2. **Con sesión, sin permisos** → mensaje "Acceso no autorizado" cuando aplica.
3. **`/admin`** → administración de eventos (crear, editar,
   publicar/despublicar/iniciar/finalizar/cancelar/eliminar según el estado).
4. **`/admin/personas`** → `DomainAdminPage`: listado tabular, árbol expandible u
   organigrama (validación UX); jerarquía CG → Coordinador → Enlace → Amigo;
   filtros, alta contextual y acciones acotadas al alcance del rol. Ver
   `docs/tra-140-personas-prototype.md`.

### Cómo probar

**Contra el ambiente de desarrollo ya desplegado (sin instalar nada):**

`http://aditsystem-dev-mx-central-1-810626480386-frontend.s3-website.mx-central-1.amazonaws.com/`

Agrega `/admin`, `/eventos` o `/mapa` a esa URL base. Este build ya incluye
las correcciones de árbol/permisos/filtros de TRA-90 (deploy verificado tras
el merge de la PR #49).

**En local:**

```bash
npm install
npm run dev            # http://localhost:5173
```

Por defecto el cliente HTTP apunta a `http://localhost:8000/api/v1`
(`VITE_API_BASE_URL` en `.env`, ver `.env.example`). Sin un backend real
respondiendo ahí, el login y toda la administración jerárquica fallarán con
errores de red — eso es esperado mientras TRA-88 (API/autorización
jerárquica final) siga en progreso.

Para iniciar sesión necesitas una cuenta ya creada en ese backend con uno de
los cuatro roles autenticables; el bootstrap del primer `ADMIN` está descrito
en TRA-77 (la contraseña se entrega por canal protegido, no vive en este
repo).
