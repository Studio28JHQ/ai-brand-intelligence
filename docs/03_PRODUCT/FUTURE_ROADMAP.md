# Purpose

To hold ideas, architectural improvements, and capabilities that are outside current MVP scope, per `CLAUDE.md`'s Repository Rules and `docs/00_FOUNDATION/02_SYSTEM_PROMPT.md`. Nothing in this document is implemented until a sprint explicitly brings it into scope. This document does not redefine any approved standard — it only tracks what has been deliberately deferred and where the project currently stands.

# Sprint Status

- **F1.5 — Architecture Standards**: Delivered. `ENGINE_STANDARD.md`, `MODULE_STANDARD.md`, `DEPENDENCY_MODEL.md`, `ENGINE_EXECUTION_STANDARD.md`, `ARCHITECTURE_INDEX.md`.
- **F2 — Business Engines**: Delivered. Discovery, Crawler, Inventory, Analysis, Entity, Knowledge Graph, AI Visibility.
- **F3 — Audit Lifecycle & Workflow Runtime**: Delivered. Audit state machine, execution context isolation, repository/query layer, Audit Summary view, Audit Workspace, Workflow Progress, Workflow Execution History, Rule Set versioning, Capability Registry, Execution Plan/Workflow Runtime split, Product Capability Catalog.
- **F4 — Project Management**: Delivered. Project aggregate (`F4-S01`), Project Baselines (`F4-S02`), Audit Comparison Service (`F4-S03`).
- **F5 — Production Readiness**: Delivered. Health and Diagnostics module (`F5-S01`), unified Telemetry module (`F5-S02`).
- **F6 — Pilot Readiness**: Delivered. Client aggregate (`F6-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-059`). Executive Dashboard (`F6-S02`, see `docs/04_PROJECT/DECISION_LOG.md#cto-061`) — a per-Project read view (Project overview, Visibility overview, Priority Actions, Recent Activity) composed entirely from existing Read Models, with no new persistence and no Business Engine calls. Optimization Planner (`F6-S03`, see `docs/04_PROJECT/DECISION_LOG.md#cto-062`) — the Optimization Plan is a projection derived from Findings and Project/Audit context, with a deterministic prioritization model (expected impact, estimated effort, confidence, and dependencies between Optimization Items based on the Workflow Runtime's fixed execution order), exposed through the Audit response and the Executive Dashboard's Priority Actions; nothing persisted. Optimization Campaign (`F6-S04`, see `docs/04_PROJECT/DECISION_LOG.md#cto-063`) — a persisted aggregate (`draft → active → completed → archived`) created from a Project's current Optimization Plan, containing Optimization Actions (`pending → in-progress → completed → verified`) that track execution over time; the Dashboard shows the latest Campaign's progress. Impact Assessment (`F6-S05`, see `docs/04_PROJECT/DECISION_LOG.md#cto-064`) — a projection, built entirely on the existing Audit Comparison Service, that measures a Campaign's business impact by comparing the Project's Baseline Audit against a Verification Audit: AI Visibility change, findings resolved/introduced, entity coverage change, a structured improvement/regression summary, and which of the Campaign's own Optimization Actions are objectively confirmed resolved; exposed via `GET /campaigns/:id/impact-assessment` and the Dashboard's Campaign Impact section. Optimization Knowledge Base (`F6-S06`, see `docs/04_PROJECT/DECISION_LOG.md#cto-065`) — a static, code-defined, versioned catalog of Optimization Rules (one per Analysis Rule id) that the Optimization Planner now consumes instead of embedding its own guidance: severity, business rationale, resolution strategy, and expected impact all now come from a resolved Rule, and every Optimization Item records which Rule (id + version) it came from. Rule versions are immutable and append-only; a new version supersedes the previous one without deleting it. Rules can be enabled or disabled. Reasoning Engine (`F6-S07`, see `docs/04_PROJECT/DECISION_LOG.md#cto-066`) — every Optimization Item now carries a structured, deterministic `ReasoningModel` (triggering Findings, applied Optimization Rules, supporting evidence, Knowledge Graph facts, entity relationships when applicable, expected outcome, confidence, assumptions) built entirely from already-real data; no free-form text, no LLM, no generation.
- **F8-S03 — Local Development Bootstrap** (Pilot Hardening): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-076` and the root `README.md`. Backend now defaults to port `3001`, Frontend pinned to port `3000` (no more default port collision); `scripts/start-alpha.sh` boots the entire local environment — Docker infra, migrations, build, Backend, Frontend, and the `F8-S02` demo seed — with a single command; Swagger/OpenAPI added at `GET /docs`; a root `README.md` (Prerequisites, Installation, Startup, URLs, Demo Users, Troubleshooting) was created where none existed before. Directly resolves every gap identified by the prior Local Development Access Report audit; no new business capability.
- **F8-S02 — Pilot Readiness Assessment** (Pilot Hardening): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-075` and `docs/04_PROJECT/PILOT_CHECKLIST.md`. Demo Workspace seed script (`apps/api/scripts/seed-demo.js`, `pnpm --filter @ai-visibility/api run seed:demo`) — drives the real HTTP API to produce a Demo Client, Demo Project, and a full Optimization Cycle with real Findings, a completed Campaign, a Verification Audit, and an Impact Assessment, so the AI Daily Briefing and Executive Client Report both have genuine content. Every screen reviewed for empty/loading/error states and success feedback: a "Get Started" onboarding message on an empty workspace, `loading.tsx` route-level loading UI for Dashboard/Audit Detail/Executive Client Report, a fixed `DailyBriefing` bug that showed "nothing needs attention" when the API was actually unreachable, inline success confirmations for Client creation/Baseline set/Campaign/Action/Cycle transitions, and a global `error.tsx` boundary. No new business capability.
- **F8-S01 — End-to-End Pilot Workflow** (Pilot Hardening): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-073`. Validated the full `Client → Project → Baseline Audit → Findings → Optimization Plan → Optimization Campaign → Verification Audit → Impact Assessment → Optimization Cycle → AI Daily Briefing → AI Consultant Chat → Executive Client Report` sequence live, through both the API and the web UI. Fixed two real gaps: (1) Findings/Optimization Plan for a specific Audit were unreachable after creation — added `GET /audits/:id/analysis` and the Audit Detail page now renders them; (2) the `F7-S06` Executive Client Report had no HTTP endpoint or UI at all — added `GET /cycles/:id/report` and a report page, and the Dashboard's Optimization Cycle section is now interactive (`CycleManager`, mirroring `CampaignManager`) instead of read-only. No new business capability and no architectural change — both fixes only expose already-implemented computation through the product surface.
- **F7-S06 — Executive Client Report** (Pilot Readiness): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-072`. `ExecutiveClientReportBuilderService.build(cycleId)` (`apps/api/src/application/executive-client-report/`) — an internal application service, no HTTP endpoint yet — transforms one `F7-S05` Optimization Cycle into a structured `ExecutiveClientReport`: Executive Summary, Initial Situation, Key Findings, Actions Completed, Improvements Achieved, Impact Assessment Summary, AI Visibility Progress, Evidence, Risks, and Recommended Next Cycle Goals. Every conclusion (`ReportConclusion`) carries related Findings, related Optimization Rules, and a `ReasoningModel` where one naturally exists, plus flat evidence facts — composed entirely from existing Read Models (Findings, the Optimization Plan, `AuditComparisonService`, `ImpactAssessmentService`); nothing recomputed, no PDF/DOCX/slides, no branding, no email delivery, no export formatting.
- **F7-S05 — Optimization Cycle** (Pilot Readiness): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-071`. `OptimizationCycle` — a persisted aggregate (`Planned → Running → Verification → Completed`) grouping all optimization work for a Project during one measurable business period. Every Audit and every Optimization Campaign now references exactly one Cycle (`cycleId`); the computed Optimization Plan and Impact Assessment carry a `cycleId` too, without either becoming persisted. A Cycle is auto-provisioned and auto-started the first time a Project gets an Audit (mirroring Client/Project auto-provisioning, `CTO-059`) so `POST /audits { url }` keeps working unchanged; `POST /projects/:id/cycles` still allows deliberately planning one ahead of time, and `POST /cycles/:id/status` drives transitions explicitly. The Executive Dashboard now shows the Project's current Cycle status (`currentCycle`).
- **F7 — AI Consultant**: In progress. AI Context Builder delivered (`F7-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-067`) — an internal, apps/api-only application service (`AiContextBuilderService`) that composes a frozen, versioned `AiContext` snapshot for a Project entirely from Read Models every prior F4–F6 sprint already built (Project, Client, latest Audit, Baseline, Knowledge Graph, Findings, Optimization Plan with nested Reasoning Models, Optimization Campaign, Impact Assessment, the full enabled Optimization Rule catalog); no new logic, no persistence, no HTTP endpoint — nothing to consume it across a boundary exists yet. AI Conversation Orchestrator delivered (`F7-S02`, see `docs/04_PROJECT/DECISION_LOG.md#cto-068`) — `AiConversationOrchestratorService.orchestrate(request)`: a four-stage pipeline (`ConversationRequest → AiContext + Conversation Policies → AiRequest → AiProvider → AiResponse → ConversationResponse`) that resolves the AI Context Builder, applies two structural Conversation Policies, assembles a provider-ready `AiRequest`, and calls a provider-abstracted `AiProvider` port — bound today only to a `NoOpAiProvider` Null Object (not OpenAI/Anthropic/Gemini) so the pipeline is genuinely testable end-to-end before any real provider exists. No persistence, no Chat UI. AI Consultant Chat MVP delivered (`F7-S03`, see `docs/04_PROJECT/DECISION_LOG.md#cto-069`) — the first real HTTP + UI surface: `POST /projects/:id/consultant/ask` and a Next.js Chat page (`apps/web/app/projects/[id]/consultant/`) resolving Project context automatically and keeping conversation history client-side for the session. `AI_PROVIDER` is now bound to `StructuredFactAiProvider`, a deterministic answer-generator (`apps/api/src/application/ai-conversation/answers/build-answer.ts`) that derives every answer purely from `AiContext` fields — no LLM, no network call — supporting "Why?", "What should I do first?", "What changed?", and "What is blocking my AI Visibility?", each returning Answer/Evidence/Confidence/Related Findings/Related Optimization Items, with the UI visually separating Facts / AI interpretation / Suggested actions. AI Daily Briefing delivered (`F7-S04`, see `docs/04_PROJECT/DECISION_LOG.md#cto-070`) — `GET /briefing/daily` (`AiDailyBriefingQueryService`), a Read Model composed across every active Client's active Projects' `AiContext`, surfaced automatically on workspace load (`apps/web/app/daily-briefing.tsx`, no user action required). Summarizes Projects Requiring Immediate Attention, Critical Findings, Campaigns Awaiting Verification, AI Visibility Regressions, High-Impact Opportunities, and Recently Completed Improvements, prioritized by a fixed category ranking; every item carries Reason/Business Impact/Evidence/Recommended Next Action/Confidence. No LLM call — a pure, provider-independent `BriefingModel`.

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

**Optimization Planner** (deferred from `F6-S03`)
- AI-generated recommendations
- Task lifecycle
- Assignments
- Approval workflow
- Automatic implementation

**Optimization Campaign** (deferred from `F6-S04`)
- User assignments
- Comments
- Notifications
- Due dates
- Automation
- External integrations

**Impact Assessment** (deferred from `F6-S05`)
- PDF reports
- Email delivery
- AI narrative generation
- Trend analysis
- Multi-campaign comparisons

**Optimization Knowledge Base** (deferred from `F6-S06`)
- AI-generated rules
- Rule editor UI
- Rule marketplace
- External synchronization

**Reasoning Engine** (deferred from `F6-S07`)
- LLM integration
- Conversational interface
- Natural language generation
- AI explanations

**AI Context Builder** (deferred from `F7-S01`)
- OpenAI integration
- Anthropic integration
- Gemini integration
- Prompt generation
- Chat interface
- Streaming

**AI Conversation Orchestrator** (deferred from `F7-S02`)
- OpenAI
- Anthropic
- Gemini
- Streaming
- Chat UI
- Conversation persistence

**AI Consultant Chat** (deferred from `F7-S03`)
- Multi-project conversations
- Voice
- File uploads
- Tool calling
- Long-term memory

**AI Daily Briefing** (deferred from `F7-S04`)
- Notifications
- Emails
- Push alerts
- Scheduling
- Cross-account summaries

**Optimization Cycle** (deferred from `F7-S05`)
- Billing
- Contracts
- Invoices
- Recurring scheduling
- Automation

**Executive Client Report** (deferred from `F7-S06`)
- PDF generation
- DOCX generation
- Slide generation
- Branding
- Email delivery
- Scheduling
- Export formatting

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
