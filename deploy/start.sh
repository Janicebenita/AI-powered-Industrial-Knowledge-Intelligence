#!/bin/sh
set -eu

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://127.0.0.1:8000}"
export INTERNAL_API_URL="${INTERNAL_API_URL:-http://127.0.0.1:8000}"
export PORT="${PORT:-3000}"

cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
backend_pid="$!"

sleep 3

cd /app/frontend
node ./node_modules/next/dist/bin/next start -H 0.0.0.0 -p "$PORT" &
frontend_pid="$!"

trap 'kill "$backend_pid" "$frontend_pid" 2>/dev/null || true' INT TERM
wait "$frontend_pid"
