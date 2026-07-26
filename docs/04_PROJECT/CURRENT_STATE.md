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
- **F6 — Pilot Readiness**: Client aggregate (`F6-S01`) — the top-level entity that owns Projects, enabling one workspace to serve multiple customers. Executive Dashboard (`F6-S02`) — a per-Project read view (`GET /projects/:id/dashboard`) composed entirely from existing Read Models: Project/Client/Audit repositories, the Finding/AI Visibility/Baseline History read repositories, the Optimization Planner, the Optimization Campaign, and the Impact Assessment service. Optimization Planner (`F6-S03`) — `apps/api/src/application/optimization/`: the Optimization Plan is a projection derived from Findings and Project/Audit context (never persisted), containing Optimization Items with a deterministic prioritization model (expected impact, estimated effort, confidence, and dependencies between Optimization Items based on the Workflow Runtime's fixed execution order); exposed through the Audit response (`optimizationPlan`) and the Dashboard's Priority Actions. Optimization Campaign (`F6-S04`) — `apps/api/src/domain/campaign/`, `application/campaign/`, `infrastructure/campaign/`, `presentation/campaign/`: a genuinely persisted aggregate (unlike the Plan) created from a Project's current Optimization Plan, tracking execution through `draft → active → completed → archived`, containing Optimization Actions (`pending → in-progress → completed → verified`), all transitions manual and agency-triggered. Impact Assessment (`F6-S05`) — `apps/api/src/application/impact-assessment/`: a projection built entirely on the existing Audit Comparison Service (`F4-S03`) that measures a Campaign's business impact by comparing the Project's Baseline Audit against a Verification Audit (explicit or auto-selected as the Project's latest completed Audit); exposed through `GET /campaigns/:id/impact-assessment` and the Dashboard's Campaign Impact section. Optimization Knowledge Base (`F6-S06`) — `apps/api/src/application/optimization-knowledge-base/`: a static, code-defined, versioned catalog of Optimization Rules (severity, business rationale, resolution strategy, expected impact, evidence references), one per Analysis Rule id; the Optimization Planner now resolves each Finding's rule from this catalog instead of embedding its own guidance, and every Optimization Item records which Rule (id + version) it came from. Reasoning Engine (`F6-S07`) — `apps/api/src/application/reasoning/`: every Optimization Item now carries a structured, deterministic `ReasoningModel` — triggering Findings, applied Optimization Rules, supporting evidence, Knowledge Graph facts, entity relationships when applicable, expected outcome, confidence, and assumptions — built entirely from data already computed elsewhere; no free-form text, no LLM. See `docs/03_PRODUCT/FUTURE_ROADMAP.md` for full sprint detail.

# Domain Hierarchy

The Interface Layer's business domain is now organized as:

```
Client
 └── Project
      ├── Audit
      └── Optimization Campaign
           └── Optimization Action
```

- **Client** — the top-level entity (an agency's customer). Stores name, industry, primary domain, status (`active`/`inactive`), and creation date. Every Project belongs to exactly one Client.
- **Project** — owns Audits for a single canonical website. Auto-provisioned (find-or-create by canonical website, and by Client primary domain when no Client is specified) so the existing `POST /audits { url }` contract keeps working unchanged; a Client can also be created explicitly and passed as `clientId` so multiple Projects can share one Client.
- **Audit** — a single analysis run against a Project's URL, producing an immutable Audit Snapshot (findings, entities, knowledge graph, AI Visibility assessment).
- **Optimization Campaign** — belongs to exactly one Project; tracks execution of one Optimization Plan (itself a projection over one Audit's Findings, see `CTO-062`) through its own lifecycle. Contains Optimization Actions, each referencing the Optimization Item it came from, its Project, and the Audit Snapshot that originated it. See `CTO-063`.

This hierarchy lives entirely within the Interface Layer as defined by `docs/01_ARCHITECTURE/DEPENDENCY_MODEL.md`. It introduces no new layer and does not change any Business Engine, the Workflow Layer, or the allowed dependency directions — Client, Project, Audit, and Optimization Campaign are Interface Layer aggregates with their own domain/application/infrastructure/presentation slices in `apps/api/src/{domain,application,infrastructure,presentation}/{client,project,audit,campaign}`.

# Verification Workflow

Audit a Project → set its Baseline (`F4-S02`) → generate an Optimization Plan and create a Campaign from it (`F6-S03`/`F6-S04`) → work the Campaign's Optimization Actions → run a new Audit once fixes are live → request that Campaign's Impact Assessment (`F6-S05`, see `CTO-064`), which compares the original Baseline against the new Audit and reports measurable outcomes: AI Visibility change, findings resolved/introduced, entity coverage change, and how many of the Campaign's own Actions are objectively confirmed resolved. Every step is agency-triggered; nothing advances automatically.

# Optimization Knowledge Base

The canonical, code-defined repository of optimization knowledge (`F6-S06`, see `CTO-065`) the Optimization Planner (`CTO-062`) consumes instead of embedding its own guidance. One `OptimizationRuleDefinition` per Analysis Rule id (`ruleId`, `enabled`, an append-only list of `OptimizationRuleVersion` entries — category, severity, business rationale, resolution strategy, expected impact, evidence references). A rule's current version is always the last entry in its `versions` array; publishing a new version means appending, never editing an existing one, so every prior version stays permanently in the catalog even once superseded. A Finding whose Analysis Rule id has no matching enabled Optimization Rule produces no Optimization Item. Every Optimization Item records `optimizationRuleId` and `optimizationRuleVersion`, so which Rule (and which version of it) produced a given Item is always externally visible on the Read Model.

# Reasoning Engine

Produces the structured, deterministic `ReasoningModel` attached to every Optimization Item (`F6-S07`, see `CTO-066`) — never free-form text, never LLM-generated. Built from data the Planner already has when generating an Item:

- **Triggering Findings** and **Applied Optimization Rules** — direct references to the Finding and the Knowledge Base Rule (`CTO-065`) that produced the Item.
- **Evidence model**: the Rule's `evidenceReferences` resolved against the Finding's own `evidence` object into `{ field, value }` facts — a reference with no matching value is omitted, never invented.
- **Knowledge Graph facts** — the Audit's `graphCompleteness`/`entityCoverage`/`relationshipCoverage`, already computed by the AI Visibility Engine from the Knowledge Graph.
- **Entity relationships (when applicable)** — Knowledge Graph relationships whose connected node name appears in the Finding's evidence; honestly empty for today's execution-class rules, since none of their evidence names an entity.
- **Expected outcome**, **confidence**, and **assumptions** — the Rule's own impact rating, the Planner's existing confidence derivation, and a small fixed `AssumptionCode` vocabulary with a static (non-generated) description per code.

No new endpoint: `ReasoningModel` is exposed as a field of `OptimizationItem`, already returned by the Audit response and the Executive Dashboard's Priority Actions.

# Current Phase

F6 — Pilot Readiness, in progress. Client aggregate (`F6-S01`), Executive Dashboard (`F6-S02`), Optimization Planner (`F6-S03`), Optimization Campaign (`F6-S04`), Impact Assessment (`F6-S05`), Optimization Knowledge Base (`F6-S06`), and Reasoning Engine (`F6-S07`) delivered.

# Next Sprint

Not yet assigned.

# Blocking Issues

None.
