# TRA-111 — Mensajes de autenticación y expiración de sesión

**Estado:** implementado en frontend (sin cambios de contrato API).

## Objetivos

- Evitar filtración de detalle del backend en login y errores auth (anti-enumeración).
- Homologar copy de sesión expirada y acceso denegado por rol.
- Documentar el uso de `expires_in_seconds` en cliente.

## Capa de mensajes

| Módulo                                      | Responsabilidad                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/lib/auth-messages.ts`                  | Catálogo y funciones `loginFailureMessage`, `safeHttpErrorMessage`, `requestFailureMessage` |
| `src/api/http.ts`                           | Sustituye mensajes 401/403 en peticiones `authenticated`/`admin`; callback `onUnauthorized` |
| `src/components/LoginPage.tsx`              | Muestra errores vía `Alert` (`role=alert` en tono error)                                    |
| `src/components/UnauthorizedRoleScreen.tsx` | Pantalla DS para rol sin permiso en admin de eventos                                        |

### Login fallido

Siempre se muestra `LOGIN_FAILURE_MESSAGE`, independientemente del texto en `detail` del backend (p. ej. «credenciales inválidas»). No se confirma si el correo existe.

### Sesión expirada

1. **Cliente:** al persistir login se guarda `logged_in_at` junto con `expires_in_seconds` (`admin-session.ts`). Si `Date.now() >= logged_in_at + expires_in_seconds * 1000`, la sesión se descarta al cargar `/admin` y se muestra `SESSION_EXPIRED_MESSAGE` en el formulario.
2. **Servidor / JWT:** cualquier 401 en petición autenticada dispara `onUnauthorized`, limpia `sessionStorage` y muestra el mismo mensaje. El backend sigue siendo la autoridad final del token.
3. **Sin `logged_in_at`:** sesiones anteriores a TRA-111 no expiran en cliente hasta recibir 401 o cerrar sesión.

### Rol sin permiso (403 / capabilities)

Usuarios autenticados sin `canManageEvents` ven `UnauthorizedRoleScreen` (shell institucional + `Alert` + «Cerrar sesión»), no el markup legacy `.request-message`.

## Pruebas

- `src/lib/auth-messages.test.ts` — mapping login/401/403.
- `src/lib/admin-session.test.ts` — cálculo de expiración local.

## Auditoría

Actualizar ítem **1.1.11** en `docs/design-system/public-surfaces-audit.md` tras merge.
