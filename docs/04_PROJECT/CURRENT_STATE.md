# Bootstrap Status

Complete. Repository structure, quality tooling, and local infrastructure configuration are in place and validated.

# Completed Phases

- **Foundation**: Constitution, Manifesto, System Prompt, Discovery Protocol, Execution Engine, CLAUDE.md.
- **Bootstrap**: repository directory structure, quality tooling (`.editorconfig`, `.gitattributes`, `.gitignore`, PR template), local development infrastructure (`docker/docker-compose.yml`, `.env.example`).
- **F1.5 — Architecture Standards**: `ENGINE_STANDARD.md`, `MODULE_STANDARD.md`, `DEPENDENCY_MODEL.md`, `ENGINE_EXECUTION_STANDARD.md`, and `ARCHITECTURE_INDEX.md` approved as the normative standards governing every Business Engine.
- **F2 — Business Engines**: Discovery, Crawler, Inventory, Analysis (with the generic Rule Engine), Entity, Knowledge Graph, and AI Visibility engines implemented as independent, framework-agnostic modules under `services/*`. Severity classification folded into the Analysis Engine rather than a standalone Classification Engine. Recommendation generation introduced as a Presentation-layer function, not persisted, not a Business Engine — since formalized as the Optimization Planner in `F6-S03` below.
- **F3 — Audit Lifecycle & Workflow Runtime**: Audit state machine (pending → running → completed/failed/cancelled), execution context isolation, Audit repository/query layer, Audit Summary read view, Audit Workspace (`apps/web`), Workflow Progress tracking, Workflow Execution History persistence, Rule Set versioning, Capability Registry, Execution Plan/Workflow Runtime split (`packages/core`), and the Product Capability Catalog.
- **F4 — Project Management**: Project aggregate (owns Audits, auto-provisioned from a URL's origin), Project Baselines (a designated reference Audit Snapshot per Project, with tracked baseline-change history), and the Audit Comparison Service (on-demand diff of two completed Audit Snapshots — new/resolved/unchanged findings, entity changes, AI Visibility changes; nothing persisted).
- **F5 — Production Readiness**: Health and Diagnostics module (`/health`, `/health/live`, `/health/ready` — liveness, readiness, dependency status for database/Redis/object storage, Workflow Runtime availability, application version), and the unified Telemetry module (`packages/shared/src/telemetry`) — a Standard Telemetry Event model with an Event Publisher abstraction, correlation ID propagated end-to-end from the HTTP request through the Workflow Runtime into every Business Engine invocation.
- **F6 — Pilot Readiness**: Client aggregate (`F6-S01`) — the top-level entity that owns Projects, enabling one workspace to serve multiple customers. Executive Dashboard (`F6-S02`) — a per-Project read view (`GET /projects/:id/dashboard`) composed entirely from existing Read Models: Project/Client/Audit repositories, the Finding/AI Visibility/Baseline History read repositories, and the Optimization Planner. Optimization Planner (`F6-S03`) — `apps/api/src/application/optimization/`: the Optimization Plan is a projection derived from Findings and Project/Audit context (never persisted), containing Optimization Items with a deterministic prioritization model (expected impact, estimated effort, confidence, and dependencies between Optimization Items based on the Workflow Runtime's fixed execution order); exposed through the Audit response (`optimizationPlan`) and the Dashboard's Priority Actions. See `docs/03_PRODUCT/FUTURE_ROADMAP.md` for full sprint detail.

# Domain Hierarchy

The Interface Layer's business domain is now organized as:

```
Client
 └── Project
      └── Audit
```

- **Client** — the top-level entity (an agency's customer). Stores name, industry, primary domain, status (`active`/`inactive`), and creation date. Every Project belongs to exactly one Client.
- **Project** — owns Audits for a single canonical website. Auto-provisioned (find-or-create by canonical website, and by Client primary domain when no Client is specified) so the existing `POST /audits { url }` contract keeps working unchanged; a Client can also be created explicitly and passed as `clientId` so multiple Projects can share one Client.
- **Audit** — a single analysis run against a Project's URL, producing an immutable Audit Snapshot (findings, entities, knowledge graph, AI Visibility assessment).

This hierarchy lives entirely within the Interface Layer as defined by `docs/01_ARCHITECTURE/DEPENDENCY_MODEL.md`. It introduces no new layer and does not change any Business Engine, the Workflow Layer, or the allowed dependency directions — Client, Project, and Audit are Interface Layer aggregates with their own domain/application/infrastructure/presentation slices in `apps/api/src/{domain,application,infrastructure,presentation}/{client,project,audit}`.

# Current Phase

F6 — Pilot Readiness, in progress. Client aggregate (`F6-S01`), Executive Dashboard (`F6-S02`), and Optimization Planner (`F6-S03`) delivered.

# Next Sprint

Not yet assigned.

# Blocking Issues

None.
