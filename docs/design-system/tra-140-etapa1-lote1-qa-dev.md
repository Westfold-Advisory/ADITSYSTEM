# QA dev — Etapa 1 Lote 1 (#103 en `main`)

Checklist manual para validar **layout admin**, **drawer Personas** y **acciones homologadas** (`AdminActionBar`).

Referencia de alcance: [`tra-140-etapa1-lote1.md`](./tra-140-etapa1-lote1.md).

## Qué incluye el build actual

El [PR #103](https://github.com/Westfold-Advisory/ADITSYSTEM/pull/103) está **mergeado en `main`** (commit de referencia: `41570ad`).

| Entorno                     | Contenido                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`main` / dev desplegado** | Sidebar L1/L2, ancho `admin-workspace`, drawer `PersonSummary`, `AdminActionBar`, botones de eventos homologados, sin pills legacy en workspace |
| **Preview local**           | Mismo código que `main` si hiciste `git pull`; API configurable (por defecto **API dev**)                                                       |

Deploy: push a **`main`** → workflow **Deploy to S3** → **https://aditsystem-dev.ervic.pro/** (alias del frontend en dev).

---

## Checklist PO (1440×900 recomendado)

Viewport: Chrome DevTools → modo responsive → **1440 × 100%**.

### A. `/admin` — Eventos

- [ ] Sidebar izquierda: Personas · Mapa de cobertura · Eventos.
- [ ] Contenido usa casi todo el ancho (sin columna centrada ~960px).
- [ ] Cada tarjeta: **Editar** = outline.
- [ ] Cada tarjeta: **como mucho un** botón filled (`Publicar`, `Iniciar` o `Finalizar` según estado).
- [ ] `Cancelar` / `Despublicar` = outline; `Eliminar` = destructive (rojo).
- [ ] Header: acción **Crear evento** = outline (esquina superior).

### B. `/admin/personas`

- [ ] Subnav en sidebar: Listado · Árbol · Organigrama.
- [ ] **Listado u Organigrama** sin panel derecho hasta seleccionar fila/tarjeta.
- [ ] Al seleccionar: drawer con ✕, `PersonSummary`, tabs.
- [ ] Acciones (Registrar / Editar): **outline**, no pill azul legacy.

### C. Ancho canvas — Personas, Mapa, Eventos

- [ ] **Personas** → listado u organigrama ocupa el área principal (no “flotando” en ~960px).
- [ ] **Mapa de cobertura** → mapa + toolbar a ancho completo.
- [ ] **Eventos** → grid de tarjetas a ancho completo.

---

## Preview local (script recomendado)

Desde la raíz del repo, en **`main`** actualizado:

```bash
git fetch origin
git checkout main
git pull origin main
npm ci
./scripts/run-etapa1-qa-preview.sh
```

1. Abre **http://127.0.0.1:4173/** (entrada `/`).
2. Inicia sesión con tu cuenta **admin de dev**.
3. Navega con el **sidebar** a Personas / Mapa / Eventos.
4. Recorre el checklist A–C.

**Detener preview:**

```bash
./scripts/run-etapa1-qa-preview.sh stop
```

Variables opcionales: `VITE_API_BASE_URL`, `PREVIEW_HOST`, `PREVIEW_PORT`.

### Build manual (sin script)

```bash
VITE_API_BASE_URL=https://api.aditsystem-dev.ervic.pro/api/v1 npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Credenciales: las de tu entorno dev (no van en el repo).

---

## Validación en dev desplegado

1. Confirma que **Deploy to S3** terminó en verde en [Actions](https://github.com/Westfold-Advisory/ADITSYSTEM/actions) tras el merge a `main`.
2. Abre **https://aditsystem-dev.ervic.pro/** → login → mismo checklist A–C.

---

## Verificar commit en tu clon

```bash
git rev-parse --short HEAD
# Esperado en línea con main: 41570ad o posterior que incluya #103
git log -1 --oneline
```
