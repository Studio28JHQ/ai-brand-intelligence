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
- **F6 — Pilot Readiness**: Client aggregate (`F6-S01`) — the top-level entity that owns Projects, enabling one workspace to serve multiple customers. Executive Dashboard (`F6-S02`) — a per-Project read view (`GET /projects/:id/dashboard`) composed entirely from existing Read Models: Project/Client/Audit repositories, the Finding/AI Visibility/Baseline History read repositories, the Optimization Planner, the Optimization Campaign, and the Impact Assessment service. Optimization Planner (`F6-S03`) — `apps/api/src/application/optimization/`: the Optimization Plan is a projection derived from Findings and Project/Audit context (never persisted), containing Optimization Items with a deterministic prioritization model (expected impact, estimated effort, confidence, and dependencies between Optimization Items based on the Workflow Runtime's fixed execution order); exposed through the Audit response (`optimizationPlan`) and the Dashboard's Priority Actions. Optimization Campaign (`F6-S04`) — `apps/api/src/domain/campaign/`, `application/campaign/`, `infrastructure/campaign/`, `presentation/campaign/`: a genuinely persisted aggregate (unlike the Plan) created from a Project's current Optimization Plan, tracking execution through `draft → active → completed → archived`, containing Optimization Actions (`pending → in-progress → completed → verified`), all transitions manual and agency-triggered. Impact Assessment (`F6-S05`) — `apps/api/src/application/impact-assessment/`: a projection built entirely on the existing Audit Comparison Service (`F4-S03`) that measures a Campaign's business impact by comparing the Project's Baseline Audit against a Verification Audit (explicit or auto-selected as the Project's latest completed Audit); exposed through `GET /campaigns/:id/impact-assessment` and the Dashboard's Campaign Impact section. Optimization Knowledge Base (`F6-S06`) — `apps/api/src/application/optimization-knowledge-base/`: a static, code-defined, versioned catalog of Optimization Rules (severity, business rationale, resolution strategy, expected impact, evidence references), one per Analysis Rule id; the Optimization Planner now resolves each Finding's rule from this catalog instead of embedding its own guidance, and every Optimization Item records which Rule (id + version) it came from. Reasoning Engine (`F6-S07`) — `apps/api/src/application/reasoning/`: every Optimization Item now carries a structured, deterministic `ReasoningModel` — triggering Findings, applied Optimization Rules, supporting evidence, Knowledge Graph facts, entity relationships when applicable, expected outcome, confidence, and assumptions — built entirely from data already computed elsewhere; no free-form text, no LLM.
- **F7 — AI Consultant**: AI Context Builder (`F7-S01`) — `apps/api/src/application/ai-context/`: `AiContextBuilderService.build(projectId)` composes a single frozen, versioned `AiContext` snapshot from every Read Model F4–F6 already built — Project, Client, latest Audit (business facts only, Workflow execution detail excluded), Baseline, Knowledge Graph, Findings, Optimization Plan (with nested Reasoning Models), Optimization Campaign, Impact Assessment, and the full enabled Optimization Rule catalog. Internal application service only — no HTTP endpoint, no persistence, no AI provider integration yet. AI Conversation Orchestrator (`F7-S02`) — `apps/api/src/application/ai-conversation/`: `AiConversationOrchestratorService.orchestrate(request)` resolves an `AiContext`, applies structural Conversation Policies, assembles a provider-ready `AiRequest`, and calls a provider-abstracted `AiProvider` port. AI Consultant Chat MVP (`F7-S03`) — `POST /projects/:id/consultant/ask` and a Next.js Chat page; `AI_PROVIDER` now bound to `StructuredFactAiProvider`, deriving Answer/Evidence/Confidence/Related Findings/Related Optimization Items deterministically from `AiContext`, no LLM. See `docs/03_PRODUCT/FUTURE_ROADMAP.md` for full sprint detail.

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

# AI Context

The complete business context for a Project, assembled on demand for future AI services (`F7-S01`, see `CTO-067`). `AiContext` is defined inside `apps/api` (`application/ai-context/ai-context.ts`), not exported from `packages/contracts` — unlike every prior Read Model, nothing yet consumes it across a system boundary, so there is no Contract Layer surface to build.

**Lifecycle**: generated fresh on every call to `AiContextBuilderService.build(projectId)` — never persisted, never cached. The returned object is `Object.freeze()`d (the same shallow-immutability convention `AuditSnapshot` established in `F2-S15`) and stamped with a static `contextVersion` (`AI_CONTEXT_VERSION`, currently `'1.0.0'`) describing the shape of `AiContext` itself, bumped by hand whenever that shape changes — distinct from, and compatible with, the individual version markers each nested fact already carries (`Finding.ruleVersion`, `OptimizationItem.optimizationRuleVersion`).

**Composition, not computation**: the Builder calls only already-existing repositories and services — it derives no new business logic. Project and Client become their existing `ProjectMetadata`/`ClientMetadata` shapes; the latest Audit becomes a dedicated `AiAuditFact` that deliberately excludes `AuditMetadata.executionHistory` (Workflow Runtime operational detail, not a business fact); Baseline becomes `Project.baselineAuditId`/`baselineSetAt`; Knowledge Graph, Findings, Optimization Plan (Reasoning Models included, nested per Item — no separate top-level field), Optimization Campaign, and Impact Assessment are their already-existing Read Model shapes; Optimization Rules is the full *enabled* Knowledge Base catalog (`CTO-065`), not only the Rules currently referenced by the Plan.

# AI Conversation Orchestrator

Prepares deterministic AI conversations without calling any external LLM (`F7-S02`, see `CTO-068`), at `apps/api/src/application/ai-conversation/`. A four-stage pipeline, each stage a distinct model:

- **Conversation Session** / **Conversation Request** — what a caller provides: a `ConversationSession` (`sessionId`, `projectId`, `startedAt` — a caller-supplied value object, never persisted server-side; `createConversationSession(projectId)` is a convenience constructor) plus a `UserIntent` (`type` from `ConversationIntentType` — `'why' | 'what-should-i-do-first' | 'what-changed' | 'what-is-blocking-visibility' | 'general-question'`, renamed in `F7-S03` from `F7-S02`'s placeholder values to the Chat's actual supported questions — and a `question`).
- **AI Context resolution** — `AiConversationOrchestratorService` resolves the request's Project through `AiContextBuilderService` (`F7-S01`), never accessing a repository directly.
- **Conversation Policies** — a fixed list of structural gates evaluated against the resolved `AiContext`: `SupportedIntentPolicy` (intent type is in the supported enum) and `RequireCompletedAuditPolicy` (`context.latestAudit` is not `null`). Either can reject the request before an `AiRequest` is ever assembled; a rejection is a `ConversationResponse` with `status: 'rejected'` and a structured `PolicyRejection`, not a thrown error.
- **AI Request** — the assembled, provider-ready payload (`requestId`, `contextVersion`, `intentType`, `question`, the full `AiContext`), built only if every Policy allows.
- **Provider abstraction** — `AiProvider` (`complete(request): Promise<AiResponse>`) is the port. `NoOpAiProvider` (`apps/api/src/infrastructure/ai-conversation/`) remains in the codebase as a deterministic `{ status: 'unavailable', content: null }` Null Object, but as of `F7-S03` (see `CTO-069`) `AI_PROVIDER` is bound to `StructuredFactAiProvider` instead — still not OpenAI, Anthropic, or Gemini; it derives every answer deterministically from `AiContext` fields already computed by prior sprints, no network call or text generation involved. Swapping providers is still just one class plus one DI rebinding in `ProjectModule`; the Orchestrator itself has never changed.
- **AI Response** / **Conversation Response** — what a Provider returns (`AiResponse`, extended in `F7-S03` to carry `facts`, `suggestedActions`, `confidence`, `relatedFindings`, `relatedOptimizationItems` alongside `content`) is wrapped, alongside the session id, into the `ConversationResponse` the Orchestrator ultimately returns.

# AI Consultant Chat

The first Chat surface over the AI Consultant Orchestrator (`F7-S02`), delivered `F7-S03` (see `CTO-069`): `POST /projects/:id/consultant/ask` (`apps/api/src/presentation/project/project.controller.ts`) and a Next.js page at `apps/web/app/projects/[id]/consultant/` (`ConsultantChat` client component).

**Conversation flow**: the Controller resolves the Project (404 if missing), validates `intentType` against the supported set and that `question` is non-empty (400 otherwise), builds a fresh `ConversationSession` via `createConversationSession(projectId)` — no session persistence, one new session per question — and calls `AiConversationOrchestratorService.orchestrate`. The internal `ConversationResponse` is mapped to the public `ConsultantAnswer` contract (`toConsultantAnswer`, `apps/api/src/presentation/project/consultant-answer.mapper.ts`) before crossing the HTTP boundary. On the client, `ConsultantChat` keeps conversation history in local React state (`useState<ConversationTurn[]>`) for the current browser session only — no server-side store, satisfying "Do not implement: Long-term memory."

**Response model**: `ConsultantAnswer` (`packages/contracts/src/ai-consultant.ts`) is the public contract — `sessionId`, `requestId`, `status` (`'completed' | 'unavailable' | 'rejected'`), `question`, `answer` (the templated interpretation string), `facts` (`ConsultantFact[]`, label/value pairs), `suggestedActions` (`string[]`), `confidence` (`OptimizationLevel | null`), `relatedFindings` (`ConsultantFindingReference[]`), `relatedOptimizationItems` (`ConsultantOptimizationItemReference[]`), and `rejectionReason` (populated only when a Conversation Policy rejected the request). Every field the ticket requires — Answer, Evidence, Confidence, Related Findings, Related Optimization Items — is a distinct field, not embedded prose.

**Supported questions**: the four the ticket requires — "Why?", "What should I do first?", "What changed?", "What is blocking my AI Visibility?" (`ConversationIntentType` values `why`, `what-should-i-do-first`, `what-changed`, `what-is-blocking-visibility`) — plus a `general-question` fallback for free-text input. Each is answered by a dedicated pure function in `apps/api/src/application/ai-conversation/answers/build-answer.ts`, reading only already-computed `AiContext` fields (the top-priority `OptimizationItem` and its `ReasoningModel` for "Why?"/"What should I do first?"; `ImpactAssessment` for "What changed?"; Findings with `severity !== 'none'` for "What is blocking my AI Visibility?").

**UI**: `ConsultantChat` renders each answered turn with four visually separate sections — "AI Interpretation" (with Confidence), "Facts (Evidence)", "Suggested Actions", "Related Findings", "Related Optimization Items" — so Facts, AI interpretation, and Suggested actions are never visually merged, per the ticket's explicit requirement.

# Current Phase

F7 — AI Consultant, in progress. F6 — Pilot Readiness fully delivered (`F6-S01` through `F6-S07`). AI Context Builder (`F7-S01`), AI Conversation Orchestrator (`F7-S02`), and AI Consultant Chat MVP (`F7-S03`) delivered.

# Next Sprint

Not yet assigned.

# Blocking Issues

None.
