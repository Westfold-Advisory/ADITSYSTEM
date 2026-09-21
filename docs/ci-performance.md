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

## Auditoría TRA-145 (2026-09-21)

### Inventario actual

| Job                | Evento             | Dependencias                      | Función                                                             |
| ------------------ | ------------------ | --------------------------------- | ------------------------------------------------------------------- |
| `Secret scan`      | PR, `main`, manual | Ninguna                           | Gitleaks sobre el checkout.                                         |
| `Quality gates`    | PR, manual         | Ninguna                           | Formato, lint, unit tests, audit alto y build.                      |
| `Semgrep SAST`     | PR                 | Ninguna                           | SAST obligatorio para la PR.                                        |
| `E2E smoke`        | PR, manual         | `Quality gates` hasta TRA-145     | Chromium contra `vite preview`.                                     |
| `Production build` | `main`             | `Secret scan`                     | Build con configuración de desarrollo y artefacto validado por SHA. |
| `Deploy to S3`     | `main`             | `Secret scan`, `Production build` | OIDC, sincronización y verificación de revisión.                    |

`concurrency` ya está correctamente delimitado por `github.ref`: cancela sólo
ejecuciones obsoletas de la misma PR y nunca cancela un despliegue de `main`.

### Medición reciente

Fuente: cuatro PR exitosas y un fallo de formato consultados el 2026-09-21.
Las duraciones son por job; el total es desde creación a finalización del run.

| Run         | Quality | Semgrep | Secret scan |  E2E | Total PR |
| ----------- | ------: | ------: | ----------: | ---: | -------: |
| 35561251804 |    39 s |    28 s |        10 s | 46 s |     90 s |
| 35558914287 |    33 s |    24 s |        10 s | 49 s |     89 s |
| 35558512581 |    34 s |    23 s |         9 s | 44 s |     84 s |
| 35556866070 |    44 s |    22 s |        10 s | 46 s |     96 s |

El `needs: quality` hace que los 44–49 s de E2E queden enteramente después de
los 33–44 s de calidad: son el camino crítico de los PR. El fallo 35561158159
fue exclusivamente `format:check` (archivo sin formatear); se detectó en 23 s
y el E2E no arrancó.

### Recomendaciones

| Decisión                      | Recomendación                                                                                                       | Impacto y trade-off                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adoptar ahora**             | Eliminar `needs: quality` de E2E.                                                                                   | Reduce la ruta crítica esperada de ~84–96 s a ~44–49 s (aprox. 40–50 %). Todos los gates permanecen requeridos por protección de rama. Si formato/lint falla, se habrá consumido un job E2E que ya no era necesario. |
| **Adoptar ahora**             | Mantener `concurrency` actual y los tres análisis PR en paralelo.                                                   | Evita gasto en commits obsoletos sin cancelar despliegues. No requiere cambio.                                                                                                                                       |
| **Diferir: medir primero**    | Añadir caché de `~/.cache/ms-playwright` con clave por SO y lockfile.                                               | Puede reducir descargas de Chromium, pero `playwright install --with-deps` seguirá comprobando dependencias del sistema; medir 10 runs antes/después y conservarla sólo si ahorra tiempo de forma consistente.       |
| **Diferir: definir política** | Ejecutar una matriz/sharding E2E sólo cuando haya más de un proyecto o el smoke supere la calidad en más de ~2 min. | El único proyecto Chromium y 44–49 s actuales no justifican la complejidad ni el mayor consumo de runners. Una suite de regresión nocturna requerirá aprobación del PO/infra sobre retención, costo y ownership.     |
| **Rechazar**                  | Filtros de rutas que omitan calidad, SAST o E2E para cambios aparentemente documentales.                            | Un cambio de configuración, lockfile o workflow puede alterar el producto; los pocos segundos ahorrados no compensan perder barreras.                                                                                |
| **Rechazar**                  | Dividir format/lint/test/audit/build en varios jobs por ahora.                                                      | Exigiría múltiples `npm ci`, más runners y más checks. La ganancia no supera el ahorro directo de paralelizar E2E.                                                                                                   |

### Fallos evitables de formato

El fallo reciente se debe corregir localmente antes de subir cambios, no
suprimiendo `format:check`: ejecutar `npm run format` antes de cada commit y,
antes de PR, la secuencia de `docs/frontend-definition-of-done.md`. Como mejora
posterior opcional, el equipo puede habilitar un hook local que ejecute Prettier
sólo sobre archivos staged; no debe reemplazar el gate de CI.
