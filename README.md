# AI Visibility Auditor

An AI Visibility Auditor platform for agencies: audit a Client's website, track Findings and an Optimization Plan through an Optimization Campaign and Optimization Cycle, measure Impact Assessments, and surface an AI Daily Briefing, AI Consultant Chat, and Executive Client Report — all backed by structured, deterministic data (no LLM calls anywhere in the platform today).

See `docs/00_FOUNDATION/00_CONSTITUTION.md` and `docs/04_PROJECT/CURRENT_STATE.md` for the governing product definition and current build status.

## Development

### Prerequisites

- Node.js (v22.x recommended — no version is formally pinned in this repository)
- pnpm `11.10.0` (pinned via the root `package.json`'s `packageManager` field; run `corepack enable` or `npm install -g pnpm@11.10.0` if you don't have it)
- Docker and Docker Compose (for PostgreSQL, Redis, and MinIO)

### Installation

```
pnpm install
```

All configuration is env-var driven (`packages/config`, validated with zod) and every variable has a working default — no `.env` file is required to start locally. Copy `.env.example` to `.env` only if you need to override something (e.g. `JWT_SECRET`/`POSTGRES_PASSWORD` for a production-like run — see `docs/04_PROJECT/PRODUCTION_READINESS.md`).

### Starting the platform

```
pnpm dev
```

This single command is the only supported way to start the platform locally. It starts Docker infrastructure (PostgreSQL, Redis, MinIO), waits for PostgreSQL to be ready, runs Prisma migrations, builds the whole workspace, starts the Backend and Frontend, waits for both to respond to health checks, and seeds a demo workspace. It prints a summary banner once everything is up, then stays attached — press `Ctrl+C` to stop the Backend and Frontend (Docker infrastructure keeps running; tear it down separately with `docker compose -f docker/docker-compose.yml down` if needed). A demo-seed failure logs a warning but does not stop the Backend/Frontend from running; any other startup failure (Docker not running, a port already in use, a failed migration) prints an actionable message and exits non-zero rather than leaving a half-started environment.

### URLs

```
Frontend:       http://localhost:3000
Backend:        http://localhost:3001
Health:         http://localhost:3001/health
Swagger:        http://localhost:3001/docs
MinIO Console:  http://localhost:9001
Database:       localhost:5432
Redis:          localhost:6379
```

Email delivery is env-driven (`EMAIL_PROVIDER=console`, the default, or `resend` + `RESEND_API_KEY`; both loaded automatically from `.env` — no code change needed to switch). No real provider account exists in this environment, so `EMAIL_PROVIDER` defaults to `console`: OTP verification codes (registration, password reset) are written to the Backend's own log instead of a real inbox. See `docs/04_PROJECT/AUTHENTICATION.md`.

**No demo users exist.** `pnpm dev` seeds a demo **workspace** instead (Client/Project/Optimization Cycle with real Findings, Campaign, Verification Audit, and Impact Assessment) — see `docs/04_PROJECT/PILOT_CHECKLIST.md`.

### Troubleshooting

- **`pnpm dev` hangs on "Waiting for PostgreSQL to be ready..."** — Docker is likely not running, or the `postgres` container failed to start. Run `docker compose -f docker/docker-compose.yml ps` and `docker compose -f docker/docker-compose.yml logs postgres` to check.
- **Port already in use (3000 or 3001)** — a previous run of the Backend or Frontend is still bound to the port. Find and stop it (`lsof -ti:3001 | xargs kill`), or stop the previous `pnpm dev` with `Ctrl+C` before starting a new one.
- **Frontend loads but shows no data / "Dashboard not available"** — confirm the Backend is actually reachable at the `API_URL` the Frontend is using (default `http://localhost:3001`); check `GET http://localhost:3001/health`.
- **`pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`** — a new dependency introduced a postinstall script pnpm doesn't yet have a policy for. Run `pnpm approve-builds`, or add an explicit `true`/`false` entry under `allowBuilds` in `pnpm-workspace.yaml`.
- **Prisma migration errors** — confirm `DATABASE_URL` points at a reachable Postgres instance and that no other process is holding conflicting schema locks; the migration step is safe to re-run.
- **Want a clean slate** — `docker compose -f docker/docker-compose.yml down -v` removes all containers and volumes (this deletes all local data, including the demo workspace); re-run `pnpm dev` afterward to rebuild everything from scratch.
- **Frontend can't reach the Backend at all (`ECONNREFUSED` on port 3001)** — the Backend process itself isn't running. Check `pnpm dev`'s own output for the actual failure (see `docs/04_PROJECT/DECISION_LOG.md#cto-086`/`#cto-087`); confirm with `lsof -i :3001` / `curl http://localhost:3001/health`.

## Production

The Backend applies security headers (`helmet`), response compression, CORS restricted to `CORS_ORIGIN`, request-body validation, a global rate limit, and a per-request timeout by default — see `docs/04_PROJECT/PRODUCTION_READINESS.md` for the full checklist and rationale. Deployment orchestration (containers, CI/CD, infrastructure-as-code) is out of this repository's current scope; this section covers only what the application itself does to behave safely once deployed.

## Documentation

Governing product/architecture documentation lives under `docs/` — see `docs/04_PROJECT/CURRENT_STATE.md` for what has been built, `docs/04_PROJECT/DECISION_LOG.md` for why, and `docs/03_PRODUCT/FUTURE_ROADMAP.md` for what's deferred. `CLAUDE.md` is the entry point for how this repository is worked on.
