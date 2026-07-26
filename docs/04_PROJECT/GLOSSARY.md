# Purpose

To define terms used across this project's documentation and code consistently. This is a reference document — it does not introduce rules of its own; where a term is governed by a normative document, that document is linked rather than repeated.

# Domain Terms

- **Client** — the top-level business entity; an agency's customer. Owns one or more Projects. Stores name, industry, primary domain, and status (`active`/`inactive`). See `docs/04_PROJECT/DECISION_LOG.md#cto-059`.
- **Project** — owns Audits for a single canonical website. Belongs to exactly one Client. Auto-provisioned from a URL's origin, or created explicitly.
- **Audit** — a single analysis run against a Project's URL. Progresses through a state machine: `pending → running → completed | failed | cancelled`.
- **Audit Snapshot** — the immutable, point-in-time result of one completed Audit: findings, entities, knowledge graph, and AI Visibility assessment.
- **Baseline** — the Audit Snapshot a Project designates as its reference point for comparison. Any completed Audit belonging to the Project can be set as its Baseline; changes are tracked in a Baseline history.
- **Finding** — the result of evaluating one Rule against an audit's engine output: an outcome (`pass`/`fail`), a severity, and supporting evidence.
- **Rule Set Version** — a version identifier computed deterministically from the currently registered rules, so it can never drift out of sync with what actually ran.

# Architecture Terms

Business Engine terminology (Engine, Business Module, Public Interface, Workflow Step) is governed by `docs/01_ARCHITECTURE/ENGINE_STANDARD.md` and `docs/01_ARCHITECTURE/MODULE_STANDARD.md` — defined there, not repeated here.

- **Business Engine** — an independent, framework-agnostic module under `services/*` implementing exactly one business capability. See `ENGINE_STANDARD.md`.
- **Workflow Runtime** — the orchestration engine (`packages/core`) that sequences Business Engines into an ordered Execution Plan and carries results from one step to the next.
- **Execution Plan** — an ordered list of Workflow Steps built by the `ExecutionPlanBuilder` from a Capability Catalog and a Capability Registry.
- **Interface Layer** — the delivery layer (`apps/api`, `apps/web`) that composes a workflow and presents its outcome. Owns the Client/Project/Audit domain hierarchy described in `docs/04_PROJECT/CURRENT_STATE.md`. See `docs/01_ARCHITECTURE/DEPENDENCY_MODEL.md`.
- **Telemetry Event** — a structured operational event (name, category, severity, correlation ID, source, timestamp, data) published through the `TelemetryEventPublisher` abstraction in `packages/shared/src/telemetry`.
- **Correlation ID** — a single identifier generated (or received via the `x-correlation-id` header) per HTTP request, threaded through the Audit lifecycle, the Workflow Runtime, and every Business Engine invocation so all telemetry and log lines for one request can be tied together.
- **Read Model** — a query-oriented projection of persisted data assembled specifically for a read use case (for example the Audit Comparison Service's result), as distinct from the write-side domain entities that produced the underlying data.
