# Purpose

To hold ideas, architectural improvements, and capabilities that are outside current MVP scope, per `CLAUDE.md`'s Repository Rules and `docs/00_FOUNDATION/02_SYSTEM_PROMPT.md`. Nothing in this document is implemented until a sprint explicitly brings it into scope. This document does not redefine any approved standard — it only tracks what has been deliberately deferred and where the project currently stands.

# Sprint Status

- **F1.5 — Architecture Standards**: Delivered. `ENGINE_STANDARD.md`, `MODULE_STANDARD.md`, `DEPENDENCY_MODEL.md`, `ENGINE_EXECUTION_STANDARD.md`, `ARCHITECTURE_INDEX.md`.
- **F2 — Business Engines**: Delivered. Discovery, Crawler, Inventory, Analysis, Entity, Knowledge Graph, AI Visibility.
- **F3 — Audit Lifecycle & Workflow Runtime**: Delivered. Audit state machine, execution context isolation, repository/query layer, Audit Summary view, Audit Workspace, Workflow Progress, Workflow Execution History, Rule Set versioning, Capability Registry, Execution Plan/Workflow Runtime split, Product Capability Catalog.
- **F4 — Project Management**: Delivered. Project aggregate (`F4-S01`), Project Baselines (`F4-S02`), Audit Comparison Service (`F4-S03`).
- **F5 — Production Readiness**: Delivered. Health and Diagnostics module (`F5-S01`), unified Telemetry module (`F5-S02`).
- **F6 — Pilot Readiness**: Delivered. Client aggregate (`F6-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-059`). Executive Dashboard (`F6-S02`, see `docs/04_PROJECT/DECISION_LOG.md#cto-061`) — a per-Project read view (Project overview, Visibility overview, Priority Actions, Recent Activity) composed entirely from existing Read Models, with no new persistence and no Business Engine calls. Optimization Planner (`F6-S03`, see `docs/04_PROJECT/DECISION_LOG.md#cto-062`) — the Optimization Plan is a projection derived from Findings and Project/Audit context, with a deterministic prioritization model (expected impact, estimated effort, confidence, and dependencies between Optimization Items based on the Workflow Runtime's fixed execution order), exposed through the Audit response and the Executive Dashboard's Priority Actions; nothing persisted. Optimization Campaign (`F6-S04`, see `docs/04_PROJECT/DECISION_LOG.md#cto-063`) — a persisted aggregate (`draft → active → completed → archived`) created from a Project's current Optimization Plan, containing Optimization Actions (`pending → in-progress → completed → verified`) that track execution over time; the Dashboard shows the latest Campaign's progress. Impact Assessment (`F6-S05`, see `docs/04_PROJECT/DECISION_LOG.md#cto-064`) — a projection, built entirely on the existing Audit Comparison Service, that measures a Campaign's business impact by comparing the Project's Baseline Audit against a Verification Audit: AI Visibility change, findings resolved/introduced, entity coverage change, a structured improvement/regression summary, and which of the Campaign's own Optimization Actions are objectively confirmed resolved; exposed via `GET /campaigns/:id/impact-assessment` and the Dashboard's Campaign Impact section. Optimization Knowledge Base (`F6-S06`, see `docs/04_PROJECT/DECISION_LOG.md#cto-065`) — a static, code-defined, versioned catalog of Optimization Rules (one per Analysis Rule id) that the Optimization Planner now consumes instead of embedding its own guidance: severity, business rationale, resolution strategy, and expected impact all now come from a resolved Rule, and every Optimization Item records which Rule (id + version) it came from. Rule versions are immutable and append-only; a new version supersedes the previous one without deleting it. Rules can be enabled or disabled. Reasoning Engine (`F6-S07`, see `docs/04_PROJECT/DECISION_LOG.md#cto-066`) — every Optimization Item now carries a structured, deterministic `ReasoningModel` (triggering Findings, applied Optimization Rules, supporting evidence, Knowledge Graph facts, entity relationships when applicable, expected outcome, confidence, assumptions) built entirely from already-real data; no free-form text, no LLM, no generation.
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
