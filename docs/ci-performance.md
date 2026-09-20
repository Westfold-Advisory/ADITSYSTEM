# Medición del pipeline de frontend

## Línea base

Fuente: cinco ejecuciones exitosas inmediatamente anteriores a TRA-83, consultadas
el 2026-09-19. Las duraciones se calculan desde el inicio hasta el fin de cada job;
la duración de la ejecución incluye la espera entre jobs.

| Ejecución                                                                               | Evento         | Quality gates | Semgrep SAST | Deploy to S3 | Total |
| --------------------------------------------------------------------------------------- | -------------- | ------------: | -----------: | -----------: | ----: |
| [35440519912](https://github.com/Westfold-Advisory/ADITSYSTEM/actions/runs/35440519912) | `push`         |          38 s |         25 s |         12 s |  54 s |
| [35440481868](https://github.com/Westfold-Advisory/ADITSYSTEM/actions/runs/35440481868) | `pull_request` |          36 s |         25 s |            — |  40 s |
| [35440216691](https://github.com/Westfold-Advisory/ADITSYSTEM/actions/runs/35440216691) | `push`         |          39 s |         24 s |         12 s |  58 s |
| [35440170863](https://github.com/Westfold-Advisory/ADITSYSTEM/actions/runs/35440170863) | `pull_request` |          36 s |         25 s |            — |  39 s |
| [35439777090](https://github.com/Westfold-Advisory/ADITSYSTEM/actions/runs/35439777090) | `push`         |          38 s |         25 s |         12 s |  57 s |

El promedio es 37 s para `Quality gates`, 25 s para Semgrep, 12 s para
despliegue y 40 s/56 s para ejecuciones de PR/push, respectivamente.

## Cambios y motivo

- El escaneo de secretos no consume `node_modules` ni el resultado del build.
  Ahora es un job independiente y se ejecuta en paralelo con calidad y Semgrep;
  sigue siendo una dependencia obligatoria de `deploy`.
- El checkout profundo de calidad era redundante: Gitleaks usa `--no-git` y los
  demás comandos no leen el historial. Los checkouts son superficiales.
- `actions/setup-node` conserva la caché de descargas de npm con clave basada
  explícitamente en `package-lock.json`. `npm ci` mantiene una instalación
  reproducible bloqueada por el lockfile.
- Semgrep ya fallaba ante hallazgos; el archivo SARIF local no se publicaba ni
  era consumido por un job posterior, por lo que se elimina su generación.
- El build de `main` se publica una vez como artefacto de un día y el despliegue
  descarga ese mismo artefacto. `build-info.json` exige que su SHA sea el
  `GITHUB_SHA` del run, así que no se puede desplegar un artefacto de una PR u
  otro commit.

No se aplicaron filtros por rutas: un cambio de configuración, dependencia,
workflow o código debe continuar validando el resultado completo.

## Push a `main` sin repetir quality gates de la PR

Tras merge, el commit en `main` tiene SHA distinto al head de la PR, por lo que
GitHub Actions no puede “reutilizar” el workflow de la PR. Para no duplicar
~30 s de `format:check`, `lint`, `test` y `npm audit` en cada deploy:

| Evento          | Jobs                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| `pull_request`  | Secret scan ∥ Quality gates (completo) ∥ Semgrep                       |
| `push` → `main` | Secret scan → Production build (`npm ci` + build + artefacto) → Deploy |

**Requisito:** `main` protegida exige que la PR haya pasado **Quality gates** (y
Semgrep si aplica) antes del merge. El push a `main` confía en esa barrera y
solo reconstruye con `VITE_API_BASE_URL` de producción y publica el artefacto
validado por SHA en `build-info.json`.

`workflow_dispatch` sigue ejecutando **Quality gates** completos (sin deploy salvo
push a `main`).

## Resultado de validación y concurrencia

La [ejecución de esta PR](https://github.com/Westfold-Advisory/ADITSYSTEM/actions/runs/35440768070)
finalizó correctamente en **34 s**: `Quality gates` tomó 30 s, Semgrep 28 s y
el escaneo de secretos 7 s, en paralelo. Frente al promedio de PR de la línea
base (40 s), esto reduce el tiempo de validación en **6 s (15 %)**. El cambio
del historial profundo no domina la mejora; el ahorro verificable viene de
sacar el escaneo de secretos del camino crítico.

Las nuevas actualizaciones de una PR cancelan sólo la validación anterior de
esa PR. Los pushes a `main` se serializan sin cancelar un despliegue que ya es
válido. Tras merge, comparar la duración de despliegue contra 56 s, el promedio
de `push` de la línea base.
