# AI Visibility Auditor

An AI Visibility Auditor platform for agencies: audit a Client's website, track Findings and an Optimization Plan through an Optimization Campaign and Optimization Cycle, measure Impact Assessments, and surface an AI Daily Briefing, AI Consultant Chat, and Executive Client Report — all backed by structured, deterministic data (no LLM calls anywhere in the platform today).

See `docs/00_FOUNDATION/00_CONSTITUTION.md` and `docs/04_PROJECT/CURRENT_STATE.md` for the governing product definition and current build status.

## Prerequisites

- Node.js (v22.x recommended — no version is formally pinned in this repository)
- pnpm `11.10.0` (pinned via the root `package.json`'s `packageManager` field; run `corepack enable` or `npm install -g pnpm@11.10.0` if you don't have it)
- Docker and Docker Compose (for PostgreSQL, Redis, and MinIO)

## Installation

```
pnpm install
```

## Startup

### One command (recommended)

```
./scripts/start-alpha.sh
```

This single script starts Docker infrastructure, waits for PostgreSQL to be ready, runs Prisma migrations, builds the whole workspace, starts the Backend and Frontend, and seeds a demo workspace automatically. It prints a summary banner (see "URLs" below) once everything is up, then stays attached — press `Ctrl+C` to stop the Backend and Frontend (the Docker infrastructure keeps running; stop it separately with `docker compose -f docker/docker-compose.yml down` if you want to tear it down too).

### Manual steps

If you'd rather run each step yourself:

```
docker compose -f docker/docker-compose.yml up -d
pnpm --filter @ai-visibility/database run migrate:deploy
pnpm -r build
pnpm --filter @ai-visibility/api run start:prod     # in one terminal
pnpm --filter @ai-visibility/web run start           # in another terminal
pnpm --filter @ai-visibility/api run seed:demo        # optional — loads demo data
```

For active development, use `pnpm --filter @ai-visibility/api run start:dev` and `pnpm --filter @ai-visibility/web run dev` instead, and `pnpm --filter @ai-visibility/database run migrate:dev` instead of `migrate:deploy`.

### Environment variables

All configuration is env-var driven (`packages/config`, validated with zod — every variable has a working default, so no `.env` file is strictly required). Copy `.env.example` to `.env` to override anything:

| Variable | Default |
|---|---|
| `PORT` | `3001` (Backend) |
| `API_URL` | `http://localhost:3001` (used by the Frontend to reach the Backend) |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/app` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | `postgres` / `postgres` / `app` / `5432` |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` |
| `MINIO_HOST` / `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` / `MINIO_API_PORT` / `MINIO_CONSOLE_PORT` | `localhost` / `minioadmin` / `minioadmin` / `9000` / `9001` |
| `CORS_ORIGIN` / `RATE_LIMIT_TTL_MS` / `RATE_LIMIT_LIMIT` / `REQUEST_TIMEOUT_MS` / `LOG_LEVEL` | `http://localhost:3000` / `60000` / `120` / `30000` / unset (`debug` in development, `info` in production) |
| `JWT_SECRET` / `JWT_SESSION_EXPIRATION_MINUTES` / `JWT_REMEMBER_ME_EXPIRATION_DAYS` / `OTP_EXPIRATION_MINUTES` / `EMAIL_FROM` | dev-only default / `60` / `30` / `10` / `no-reply@ai-visibility-auditor.local` |

**In production** (`NODE_ENV=production`), the Backend additionally *requires* `DATABASE_URL`, `POSTGRES_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, and `JWT_SECRET` to be set explicitly and refuses to start otherwise — see `docs/04_PROJECT/PRODUCTION_READINESS.md`.

No SMTP/transactional-email provider is configured in this environment — OTP verification codes (registration, password reset) are written to the Backend's own log instead of a real inbox; see `docs/04_PROJECT/AUTHENTICATION.md`.

## URLs

```
Frontend:       http://localhost:3000
Backend:        http://localhost:3001
Swagger:        http://localhost:3001/docs
MinIO Console:  http://localhost:9001
Database:       localhost:5432
Redis:          localhost:6379
```

Health checks: `GET /health`, `GET /health/live`, `GET /health/ready` (the last checks Database/Redis/Object Storage/Workflow Runtime connectivity and returns HTTP 503 if anything is down).

## Demo Users

**No demo users exist.** This platform has no authentication system yet (no login, no OAuth, no JWT, no sessions) — every endpoint is open. There is nothing to log in with.

`./scripts/start-alpha.sh` (or `pnpm --filter @ai-visibility/api run seed:demo` on its own) seeds a demo **workspace** instead: a Demo Client ("Acme Digital (Demo)"), a Demo Project, and a full Optimization Cycle with real Findings, a completed Optimization Campaign, a Verification Audit, and an Impact Assessment — visible immediately on the Frontend's home page and Dashboard once seeded. See `docs/04_PROJECT/PILOT_CHECKLIST.md` for the full demo data strategy.

## Troubleshooting

- **`./scripts/start-alpha.sh` hangs on "Waiting for PostgreSQL to be ready..."** — Docker is likely not running, or the `postgres` container failed to start. Run `docker compose -f docker/docker-compose.yml ps` and `docker compose -f docker/docker-compose.yml logs postgres` to check.
- **Port already in use (3000 or 3001)** — a previous run of the Backend or Frontend is still bound to the port. Find and stop it (`lsof -ti:3001 | xargs kill`), or stop the previous `start-alpha.sh` with `Ctrl+C` before starting a new one.
- **Frontend loads but shows no data / "Dashboard not available"** — confirm the Backend is actually reachable at the `API_URL` the Frontend is using (default `http://localhost:3001`); check `GET http://localhost:3001/health`.
- **`pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`** — a new dependency introduced a postinstall script pnpm doesn't yet have a policy for. Run `pnpm approve-builds`, or add an explicit `true`/`false` entry under `allowBuilds` in `pnpm-workspace.yaml`.
- **Prisma migration errors** — confirm `DATABASE_URL` points at a reachable Postgres instance and that no other process is holding conflicting schema locks; `pnpm --filter @ai-visibility/database run migrate:deploy` is safe to re-run.
- **Want a clean slate** — `docker compose -f docker/docker-compose.yml down -v` removes all containers and volumes (this deletes all local data, including the demo workspace); re-run `./scripts/start-alpha.sh` afterward to rebuild everything from scratch.

## Production

The Backend applies security headers (`helmet`), response compression, CORS restricted to `CORS_ORIGIN`, request-body validation, a global rate limit, and a per-request timeout by default — see `docs/04_PROJECT/PRODUCTION_READINESS.md` for the full checklist and rationale. Deployment orchestration (containers, CI/CD, infrastructure-as-code) is out of this repository's current scope; this section covers only what the application itself does to behave safely once deployed.

## Documentation

Governing product/architecture documentation lives under `docs/` — see `docs/04_PROJECT/CURRENT_STATE.md` for what has been built, `docs/04_PROJECT/DECISION_LOG.md` for why, and `docs/03_PRODUCT/FUTURE_ROADMAP.md` for what's deferred. `CLAUDE.md` is the entry point for how this repository is worked on.
