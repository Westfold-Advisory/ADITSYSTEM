# Versionado del aviso de privacidad (frontend)

## Objetivo

Mantener trazabilidad de cambios al aviso de privacidad publicado en rutas públicas (`/privacidad`, `/privacidad/simplificado`) mientras el contenido vive en el repositorio del frontend (sin CMS en backend).

## Campos de versión

Cada documento en `src/content/legal/` expone:

| Campo | Uso |
| --- | --- |
| `version` | Semver o etiqueta de borrador (`0.1.0-draft`) |
| `effectiveDate` | Fecha ISO (solo día) en que entra en vigor la versión mostrada |

Ambas variantes (integral y simplificado) deben actualizarse de forma coordinada cuando el PO publique un cambio material.

## Flujo recomendado

1. **Redacción / revisión legal** — sustituir placeholders marcados `LEGAL REVIEW REQUIRED`.
2. **Bump de versión** — incrementar `version` y fijar `effectiveDate` al día de publicación.
3. **Registro histórico** — copiar el contenido anterior a `docs/legal/archive/YYYY-MM-DD-vX.Y.Z-integral.ts` (o export Markdown) antes de sobrescribir el TS activo.
4. **Despliegue** — merge a `main` y despliegue del frontend; la URL pública no cambia.
5. **Comunicación** — si el cambio es sustancial, notificar a usuarios registrados según indique legal (fuera de alcance de este repositorio).

## Historial en Git

El historial de Git sobre `src/content/legal/` actúa como respaldo adicional. Para auditorías, preferir copias archivadas con fecha en `docs/legal/archive/` además del diff en Git.

## Futuro (fuera de alcance TRA-108)

- CMS o endpoint de solo lectura para versiones firmadas.
- Hash o firma digital del texto publicado.
- Banner “aviso actualizado” en login tras cambios de versión.
