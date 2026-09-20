# Auditoría — strings institucionales en componentes core

**Issue:** TRA-113 · **Fecha:** 2026-09-20

## Componentes core (deben usar `getInstitutionConfig()`)

| Componente             | Estado | Notas                                                       |
| ---------------------- | ------ | ----------------------------------------------------------- |
| `PublicAppShell`       | OK     | Marca vía `InstitutionBrandMark`; footer legal configurable |
| `PublicLegalFooter`    | OK     | Rutas y contacto desde tema                                 |
| `LoginPage`            | OK     | Marca, institución y enlaces legales                        |
| `InstitutionBrandMark` | OK     | Solo presentación; no contiene copy fijo                    |

## Superficies de dominio (consumen config, no son core DS)

| Componente               | Estado                                    |
| ------------------------ | ----------------------------------------- |
| `PublicEventsPage`       | OK — `institution.productName` en eyebrow |
| `UnauthorizedRoleScreen` | OK                                        |
| `AdminEventsPage`        | OK — eyebrow admin                        |
| `DomainAdminPage`        | OK — eyebrow admin                        |
| `App.tsx`                | OK — sin copy institucional               |

## Excepciones permitidas

| Ubicación                      | Motivo                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| `src/config/institution.ts`    | Fuente única del tema ADITSYSTEM por defecto                 |
| `src/content/legal/*`          | Placeholders `[PO — …]` para revisión jurídica; no son shell |
| Tests con string «ADIT SYSTEM» | Datos de prueba de `AppBar`, no producción                   |

## Verificación

```bash
rg 'ADIT SYSTEM' src --glob '!**/*.test.ts' --glob '!**/institution.ts' --glob '!**/content/**'
```

Resultado esperado: sin coincidencias en componentes TSX de producción.
