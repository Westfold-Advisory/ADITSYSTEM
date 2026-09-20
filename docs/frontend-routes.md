## Rutas del frontend

La app no usa un router (no hay `react-router`); `src/App.tsx` decide qué
pantalla mostrar leyendo `window.location.pathname` (con un fallback a
`#/...` por compatibilidad). Sólo existen las rutas listadas abajo — cualquier
otra devuelve la página 404.

| Ruta                       | Componente          | Auth    | Descripción                                                                                                |
| -------------------------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `/` y `/eventos`           | `PublicEventsPage`  | Ninguna | Listado público de eventos **publicados**. Un evento en `BORRADOR` no aparece aquí.                        |
| `/mapa`                    | `MapPage`           | Ninguna | Explorador de mapa de eventos públicos (MapLibre), con capas territoriales y filtros por texto/tipo/fecha. |
| `/login`                   | `LoginPage`         | Ninguna | Acceso administrativo institucional. Tras login redirige a `/admin`.                                       |
| `/admin`                   | `AdminEventsPage`   | Login   | Consola administrativa. Sin sesión muestra el mismo login (compatibilidad; ver TRA-114).                   |
| `/privacidad`              | `PrivacyNoticePage` | Ninguna | Aviso de privacidad integral.                                                                              |
| `/privacidad/simplificado` | `PrivacyNoticePage` | Ninguna | Resumen simplificado.                                                                                      |
| cualquier otra             | `NotFoundPage`      | —       | 404 con link de regreso a `/eventos`.                                                                      |

### Dentro de `/admin`

`/admin` no tiene sub-rutas propias; cambia de vista con estado de React, no
con la URL. Un refresh del navegador siempre vuelve a la pantalla de login o
al listado de eventos, nunca conserva la vista de estructura.

1. **Sin sesión** → `LoginPage` (`POST /auth/login`). Enlace preferido: `/login`. Sólo aceptan
   sesión los roles `ADMIN`, `COORDINADOR_GENERAL`, `COORDINADOR` y `ENLACE`;
   `AMIGO` no tiene credenciales (es una persona administrada, no un usuario).
2. **Con sesión, sin `canManageEvents`** → mensaje "Acceso no autorizado" (no
   debería ocurrir con los cuatro roles autenticables actuales, pero la UI lo
   contempla).
3. **Con sesión autorizada** → administración de eventos (crear, editar,
   publicar/despublicar/iniciar/finalizar/cancelar/eliminar según el estado).
4. Botón **"Administrar perfiles"** en esa misma pantalla → cambia a
   `DomainAdminPage`: árbol expandible de la jerarquía
   (Coordinador General → Coordinador → Enlace → Amigo), con:
   - Filtro por nombre (sin distinguir mayúsculas/acentos) y por estado
     (Activo/Inactivo/Baja).
   - Alta contextual del siguiente rol permitido bajo tu propio nodo (botón
     "Registrar …").
   - "Editar datos" / "Dar de baja" sólo visibles sobre tu propio perfil o
     sobre el nivel que administras directamente (p. ej. un Coordinador no ve
     esas acciones sobre un Amigo, sólo sobre sus Enlaces).
   - Botón **"Eventos"** en el encabezado regresa a la administración de
     eventos (tampoco cambia la URL).

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
