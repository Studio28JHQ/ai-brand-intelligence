#!/usr/bin/env bash
# Boots the complete local Alpha environment with a single command:
# Docker infrastructure -> wait for PostgreSQL -> Prisma migrations -> workspace build
# -> Backend -> Frontend -> demo seed. See README.md for prerequisites and troubleshooting.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

API_PORT="${PORT:-3001}"
WEB_PORT="3000"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

if docker compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
else
  DOCKER_COMPOSE=(docker-compose)
fi

log() {
  echo "[start-alpha] $1"
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local attempts=0
  until curl -sf "$url" > /dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 60 ]; then
      log "Timed out waiting for $label at $url"
      exit 1
    fi
    sleep 1
  done
}

API_PID=""
WEB_PID=""

cleanup() {
  log "Shutting down..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

log "Starting Docker infrastructure (PostgreSQL, Redis, MinIO)..."
"${DOCKER_COMPOSE[@]}" -f docker/docker-compose.yml up -d

log "Waiting for PostgreSQL to be ready..."
until "${DOCKER_COMPOSE[@]}" -f docker/docker-compose.yml exec -T postgres pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
  sleep 1
done
log "PostgreSQL is ready."

log "Running Prisma migrations..."
pnpm --filter @ai-visibility/database run migrate:deploy

log "Building workspace..."
pnpm -r build

log "Starting Backend on port $API_PORT..."
PORT="$API_PORT" pnpm --filter @ai-visibility/api run start:prod > "$ROOT_DIR/.alpha-api.log" 2>&1 &
API_PID=$!
wait_for_http "http://localhost:$API_PORT/health" "Backend"

log "Starting Frontend on port $WEB_PORT..."
API_URL="http://localhost:$API_PORT" pnpm --filter @ai-visibility/web run start > "$ROOT_DIR/.alpha-web.log" 2>&1 &
WEB_PID=$!
wait_for_http "http://localhost:$WEB_PORT" "Frontend"

log "Seeding demo data..."
# Demo data is a convenience, not a requirement for the Backend/Frontend to be considered
# "running" — under `set -e`, letting this fail would trigger the cleanup trap and kill the two
# servers that just started successfully, even though they themselves are perfectly healthy.
if ! API_URL="http://localhost:$API_PORT" node "$ROOT_DIR/apps/api/scripts/seed-demo.js"; then
  log "Demo seed failed — continuing anyway; the Backend and Frontend are still up. See the error above."
fi

cat <<'BANNER'

AI Visibility Auditor - Alpha Ready

Frontend:
http://localhost:3000

Backend:
http://localhost:3001

Swagger:
http://localhost:3001/docs

MinIO Console:
http://localhost:9001

Database:
localhost:5432

Redis:
localhost:6379
BANNER

log "Press Ctrl+C to stop the Backend and Frontend (Docker infrastructure keeps running)."
wait "$API_PID" "$WEB_PID"
