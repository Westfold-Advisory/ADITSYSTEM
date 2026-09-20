# Theming institucional (ADITSYSTEM / DIF)

**Issue:** TRA-113  
**Código:** `src/config/institution.ts`

## Propósito

Centralizar nombre de producto, institución, logotipo, contacto y enlaces legales para que un despliegue (ADITSYSTEM, DIF u otra dependencia) cambie identidad **sin modificar componentes core**.

Los componentes de layout público (`PublicAppShell`, `PublicLegalFooter`, `LoginPage`) consumen `getInstitutionConfig()`.

## Tema por defecto

Sin variables de entorno, el build usa `ADITSYSTEM_INSTITUTION_THEME` (producto «ADIT SYSTEM»).

## Variables de entorno

| Variable                                 | Descripción                                          |
| ---------------------------------------- | ---------------------------------------------------- |
| `VITE_INSTITUTION_PRODUCT_NAME`          | Nombre corto del producto en UI                      |
| `VITE_INSTITUTION_NAME`                  | Razón social o dependencia responsable               |
| `VITE_INSTITUTION_LOGO_URL`              | URL absoluta del logotipo (opcional)                 |
| `VITE_INSTITUTION_LOGO_ALT`              | Texto alternativo del logo (obligatorio si hay logo) |
| `VITE_INSTITUTION_CONTACT_EMAIL`         | Contacto en pie legal (opcional)                     |
| `VITE_INSTITUTION_CONTACT_PHONE`         | Teléfono en pie legal (opcional)                     |
| `VITE_INSTITUTION_PRIVACY_INTEGRAL_PATH` | Ruta aviso integral                                  |
| `VITE_INSTITUTION_PRIVACY_SUMMARY_PATH`  | Ruta resumen LFPDPPP                                 |
| `VITE_INSTITUTION_TERMS_PATH`            | Ruta términos de uso (opcional)                      |

Ver también `.env.example`.

## Crear un tema DIF (ejemplo)

1. Copiar `.env.example` a `.env.local` en el pipeline o entorno de build del frontend.
2. Definir variables (sin lógica partidista en código):

```env
VITE_INSTITUTION_PRODUCT_NAME=Portal DIF
VITE_INSTITUTION_NAME=Sistema Estatal DIF — [Entidad federativa]
VITE_INSTITUTION_LOGO_URL=https://cdn.ejemplo.gob.mx/dif/logo.svg
VITE_INSTITUTION_LOGO_ALT=Logotipo del DIF estatal
VITE_INSTITUTION_CONTACT_EMAIL=contacto@dif.ejemplo.gob.mx
VITE_INSTITUTION_PRIVACY_INTEGRAL_PATH=/aviso-privacidad
VITE_INSTITUTION_PRIVACY_SUMMARY_PATH=/aviso-privacidad/resumen
```

3. Ejecutar `npm run build` — Vite inlined las variables en el bundle.
4. Validar login y shell público: logo con `alt`, enlaces legales y contacto en footer.

**Fuera de alcance (TRA-113):** multi-tenant en runtime, CMS de contenido legal, swap de tokens de color (fase posterior del Design System).

## API para pruebas

`buildInstitutionTheme(envRecord)` permite simular un tema en tests sin `import.meta.env`.

## Auditoría de hardcodes

Lista de componentes core verificados: [`institution-core-audit.md`](./institution-core-audit.md).
