#!/usr/bin/env bash
# E2E navegador contra API real (compose local). TRA-124 / TRA-125.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_ORIGIN="${E2E_API_ORIGIN:-http://127.0.0.1:8000}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-${API_ORIGIN}/api/v1}"
export VITE_API_BASE_URL
export VITE_USE_MOCK_API=false
export E2E_START_PREVIEW=1

echo "== Comprobando API (${API_ORIGIN}/health) =="
if ! curl --fail --silent "${API_ORIGIN}/health" >/dev/null; then
  echo "Error: la API no responde en ${API_ORIGIN}." >&2
  echo "Levante aditsystem-backend (docker compose) y seed development antes de E2E." >&2
  exit 1
fi

echo "== Build frontend (API real) =="
npm run build

echo "== Playwright (preview + pruebas) =="
npm run preview -- --host 127.0.0.1 --port 4173 &
PREVIEW_PID=$!
trap 'kill "${PREVIEW_PID}" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  if curl --fail --silent "http://127.0.0.1:4173/eventos" >/dev/null; then
    break
  fi
  sleep 1
done

export E2E_BASE_URL="http://127.0.0.1:4173"
npx playwright test "$@"
