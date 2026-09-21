#!/usr/bin/env bash
# Preview local Etapa 1 Lote 1 contra API dev — docs/design-system/tra-140-etapa1-lote1-qa-dev.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://api.aditsystem-dev.ervic.pro/api/v1}"
PORT="${PREVIEW_PORT:-4173}"
HOST="${PREVIEW_HOST:-127.0.0.1}"
PID_FILE="${ROOT}/.qa-preview-etapa1.pid"
LOG_FILE="${ROOT}/.qa-preview-etapa1.log"
API_HEALTH="${VITE_API_BASE_URL%/api/v1}/health"

if [[ "${1:-}" == "stop" ]]; then
  if [[ -f "$PID_FILE" ]]; then
    pid="$(cat "$PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      echo "Preview detenido (PID $pid)."
    else
      echo "PID $pid ya no corre."
    fi
    rm -f "$PID_FILE"
  else
    echo "No hay preview registrado ($PID_FILE)."
  fi
  exit 0
fi

if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE")"
  if kill -0 "$old_pid" 2>/dev/null; then
    echo "Preview ya corre (PID $old_pid)."
    echo "URL: http://${HOST}:${PORT}/"
    echo "Log: $LOG_FILE"
    echo "Detener: $0 stop"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

echo "== Comprobando API (${API_HEALTH}) =="
if ! curl --fail --silent "$API_HEALTH" >/dev/null; then
  echo "Aviso: la API no respondió en ${API_HEALTH}. El build continúa; login puede fallar." >&2
fi

commit="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "== Build (HEAD ${commit}, VITE_API_BASE_URL=${VITE_API_BASE_URL}) =="
: >"$LOG_FILE"
npm run build >>"$LOG_FILE" 2>&1

echo "== Iniciando vite preview en http://${HOST}:${PORT}/ =="
nohup npx vite preview --host "$HOST" --port "$PORT" >>"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

for _ in $(seq 1 20); do
  if curl -sf -o /dev/null "http://${HOST}:${PORT}/"; then
    echo "Listo: http://${HOST}:${PORT}/"
    echo "Entra por / → login → sidebar (no pegues /admin/... en frío en preview)."
    echo "PID: $(cat "$PID_FILE") | Log: $LOG_FILE"
    echo "Detener: $0 stop"
    exit 0
  fi
  sleep 1
done

echo "Error: preview no respondió. Ver $LOG_FILE" >&2
kill "$(cat "$PID_FILE")" 2>/dev/null || true
rm -f "$PID_FILE"
exit 1
