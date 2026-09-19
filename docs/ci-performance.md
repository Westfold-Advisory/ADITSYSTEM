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

## Concurrencia y seguimiento

Las nuevas actualizaciones de una PR cancelan sólo la validación anterior de
esa PR. Los pushes a `main` se serializan sin cancelar un despliegue que ya es
válido. Tras merge, registrar aquí la duración del run de `main` resultante y
compararla contra 56 s (promedio de la línea base).
