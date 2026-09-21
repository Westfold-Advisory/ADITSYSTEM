# E2E en navegador (Playwright)

## Decisión (TRA-124)

| Herramienta    | Decisión                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| **Playwright** | Adoptada — trace/video en fallos, buen soporte en CI, alineada con el stack Vite. |
| Cypress        | Descartada por ahora — mayor costo en CI y duplicación de tooling.                |

Los escenarios de producto (público + admin con API real) viven en **TRA-125**. Este documento cubre la **infraestructura** E2E.

## Requisitos

- Node 22 (mismo que CI frontend).
- Para E2E con API real: backend en Docker Compose (`aditsystem-backend`) y variables de entorno documentadas abajo.

## Comandos

| Comando          | Uso                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------- |
| `npm run e2e`    | Build + Playwright contra `vite preview` (mock API por defecto en preview).           |
| `npm run e2e:ci` | Igual que CI: build con `VITE_USE_MOCK_API=true`, un worker, sin reutilizar servidor. |
| `npm run e2e:ui` | Modo interactivo de Playwright (depuración local).                                    |

## Variables de entorno

| Variable                                 | Descripción                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `E2E_BASE_URL`                           | URL del frontend (si ya corre preview/dev). Si se define, Playwright **no** arranca preview. |
| `E2E_START_PREVIEW`                      | `0` para no levantar preview (equivalente a fijar `E2E_BASE_URL`).                           |
| `VITE_API_BASE_URL`                      | API para el build de preview (p. ej. `http://127.0.0.1:8000/api/v1`).                        |
| `VITE_USE_MOCK_API`                      | `true` en CI smoke; `false` cuando el backend local está arriba.                             |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Reservadas para TRA-125 (login admin); usar seed local, **no** versionar secretos.           |

## Flujo local con API real

Desde la raíz de `ADITSYSTEM`:

```bash
./scripts/e2e-ui-local.sh
```

El script:

1. Comprueba que el backend responda en `/health` (falla con mensaje claro si no).
2. Ejecuta `npm run build` con `VITE_USE_MOCK_API=false`.
3. Lanza Playwright contra preview en el puerto 4173.

Levante antes el backend, por ejemplo:

```bash
cd ../aditsystem-backend
docker compose --env-file .env.compose up -d db migrations api
BOOTSTRAP_PASSWORD='…' docker compose --env-file .env.compose run --rm api aditsystem-seed-development
```

## CI

- **PR (`Frontend CI`)**: job **E2E smoke (Playwright)** — build con mock API + 3 pruebas de humo públicas.
- **API + seed completo**: ejecutar `./scripts/e2e-ui-local.sh` en máquina de desarrollo o workflow manual futuro (nightly).

Artefactos en fallo: trace y video bajo `test-results/` (subidos como artifact en GitHub Actions).

## Instalación de navegadores (primera vez local)

```bash
npx playwright install chromium
```
