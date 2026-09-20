# TRA-114 — Propuesta de rutas: `/login` vs `/admin`

**Estado:** propuesta para revisión PO (implementación parcial en TRA-109).

## Contexto

La administración vive en `/admin`, que alterna entre **login** y **consola** según `sessionStorage`, sin sub-rutas.

## Recomendación

| Ruta     | Propósito                                       | Auth             |
| -------- | ----------------------------------------------- | ---------------- |
| `/login` | Entrada institucional (formulario + privacidad) | Ninguna          |
| `/admin` | Consola administrativa (eventos, jerarquía)     | Sesión requerida |

### Fase 2 (TRA-114)

1. Enlaces públicos sólo a `/login`; tras login, redirigir a `/admin`.
2. `/admin` sin sesión → redirigir a `/login` (eliminar duplicación).

### Compatibilidad (TRA-109)

- `/login` implementado con `LoginPage` + `PublicAppShell`.
- `/admin` sin sesión sigue mostrando el mismo login hasta aprobación PO.

## Dependencias

- TRA-109 — `LoginPage`, `InstitutionConfig`, privacidad.
- TRA-111 — mensajes de error seguros.
