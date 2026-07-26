# Purpose

To hold ideas, architectural improvements, and capabilities that are outside current MVP scope, per `CLAUDE.md`'s Repository Rules and `docs/00_FOUNDATION/02_SYSTEM_PROMPT.md`. Nothing in this document is implemented until a sprint explicitly brings it into scope. This document does not redefine any approved standard — it only tracks what has been deliberately deferred and where the project currently stands.

# Sprint Status

- **F1.5 — Architecture Standards**: Delivered. `ENGINE_STANDARD.md`, `MODULE_STANDARD.md`, `DEPENDENCY_MODEL.md`, `ENGINE_EXECUTION_STANDARD.md`, `ARCHITECTURE_INDEX.md`.
- **F2 — Business Engines**: Delivered. Discovery, Crawler, Inventory, Analysis, Entity, Knowledge Graph, AI Visibility.
- **F3 — Audit Lifecycle & Workflow Runtime**: Delivered. Audit state machine, execution context isolation, repository/query layer, Audit Summary view, Audit Workspace, Workflow Progress, Workflow Execution History, Rule Set versioning, Capability Registry, Execution Plan/Workflow Runtime split, Product Capability Catalog.
- **F4 — Project Management**: Delivered. Project aggregate (`F4-S01`), Project Baselines (`F4-S02`), Audit Comparison Service (`F4-S03`).
- **F5 — Production Readiness**: Delivered. Health and Diagnostics module (`F5-S01`), unified Telemetry module (`F5-S02`).
- **F6 — Pilot Readiness**: In progress. Client aggregate delivered (`F6-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-059`). Executive Dashboard delivered (`F6-S02`, see `docs/04_PROJECT/DECISION_LOG.md#cto-061`) — a per-Project read view (Project overview, Visibility overview, Priority Actions, Recent Activity) composed entirely from existing Read Models, with no new persistence and no Business Engine calls.

# Deferred Ideas

Ideas explicitly routed here by a sprint rather than implemented, grouped by the area they'd extend:

**Client management** (deferred from `F6-S01`)
- Contacts
- Billing
- Organizations
- Teams
- Permissions

**Audit comparison** (deferred from `F4-S03`)
- Trend analysis across more than two Audits
- Multi-audit comparison
- Charts
- PDF export
- Notifications

**Executive Dashboard** (deferred from `F6-S02`)
- Charts
- Filters
- PDF export
- Dashboard widget customization
- Multi-project dashboard view

**Health & diagnostics** (deferred from `F5-S01`)
- Metrics
- Distributed tracing
- Alerting
- Authentication
- Monitoring dashboards

**Telemetry** (deferred from `F5-S02`)
- OpenTelemetry exporters
- Prometheus
- Grafana
- Distributed tracing
- External log aggregation

**Cross-cutting** (deferred by `docs/01_ARCHITECTURE/`)
- A dedicated event or messaging system (see `ENGINE_EXECUTION_STANDARD.md`)
- A metrics system (see `ENGINE_STANDARD.md`)
