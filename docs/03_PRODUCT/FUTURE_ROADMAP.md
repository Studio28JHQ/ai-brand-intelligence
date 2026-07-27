# Purpose

To hold ideas, architectural improvements, and capabilities that are outside current MVP scope, per `CLAUDE.md`'s Repository Rules and `docs/00_FOUNDATION/02_SYSTEM_PROMPT.md`. Nothing in this document is implemented until a sprint explicitly brings it into scope. This document does not redefine any approved standard — it only tracks what has been deliberately deferred and where the project currently stands.

# Sprint Status

- **F1.5 — Architecture Standards**: Delivered. `ENGINE_STANDARD.md`, `MODULE_STANDARD.md`, `DEPENDENCY_MODEL.md`, `ENGINE_EXECUTION_STANDARD.md`, `ARCHITECTURE_INDEX.md`.
- **F2 — Business Engines**: Delivered. Discovery, Crawler, Inventory, Analysis, Entity, Knowledge Graph, AI Visibility.
- **F3 — Audit Lifecycle & Workflow Runtime**: Delivered. Audit state machine, execution context isolation, repository/query layer, Audit Summary view, Audit Workspace, Workflow Progress, Workflow Execution History, Rule Set versioning, Capability Registry, Execution Plan/Workflow Runtime split, Product Capability Catalog.
- **F4 — Project Management**: Delivered. Project aggregate (`F4-S01`), Project Baselines (`F4-S02`), Audit Comparison Service (`F4-S03`).
- **F5 — Production Readiness**: Delivered. Health and Diagnostics module (`F5-S01`), unified Telemetry module (`F5-S02`).
- **F6 — Pilot Readiness**: Delivered. Client aggregate (`F6-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-059`). Executive Dashboard (`F6-S02`, see `docs/04_PROJECT/DECISION_LOG.md#cto-061`) — a per-Project read view (Project overview, Visibility overview, Priority Actions, Recent Activity) composed entirely from existing Read Models, with no new persistence and no Business Engine calls. Optimization Planner (`F6-S03`, see `docs/04_PROJECT/DECISION_LOG.md#cto-062`) — the Optimization Plan is a projection derived from Findings and Project/Audit context, with a deterministic prioritization model (expected impact, estimated effort, confidence, and dependencies between Optimization Items based on the Workflow Runtime's fixed execution order), exposed through the Audit response and the Executive Dashboard's Priority Actions; nothing persisted. Optimization Campaign (`F6-S04`, see `docs/04_PROJECT/DECISION_LOG.md#cto-063`) — a persisted aggregate (`draft → active → completed → archived`) created from a Project's current Optimization Plan, containing Optimization Actions (`pending → in-progress → completed → verified`) that track execution over time; the Dashboard shows the latest Campaign's progress. Impact Assessment (`F6-S05`, see `docs/04_PROJECT/DECISION_LOG.md#cto-064`) — a projection, built entirely on the existing Audit Comparison Service, that measures a Campaign's business impact by comparing the Project's Baseline Audit against a Verification Audit: AI Visibility change, findings resolved/introduced, entity coverage change, a structured improvement/regression summary, and which of the Campaign's own Optimization Actions are objectively confirmed resolved; exposed via `GET /campaigns/:id/impact-assessment` and the Dashboard's Campaign Impact section. Optimization Knowledge Base (`F6-S06`, see `docs/04_PROJECT/DECISION_LOG.md#cto-065`) — a static, code-defined, versioned catalog of Optimization Rules (one per Analysis Rule id) that the Optimization Planner now consumes instead of embedding its own guidance: severity, business rationale, resolution strategy, and expected impact all now come from a resolved Rule, and every Optimization Item records which Rule (id + version) it came from. Rule versions are immutable and append-only; a new version supersedes the previous one without deleting it. Rules can be enabled or disabled. Reasoning Engine (`F6-S07`, see `docs/04_PROJECT/DECISION_LOG.md#cto-066`) — every Optimization Item now carries a structured, deterministic `ReasoningModel` (triggering Findings, applied Optimization Rules, supporting evidence, Knowledge Graph facts, entity relationships when applicable, expected outcome, confidence, assumptions) built entirely from already-real data; no free-form text, no LLM, no generation.
- **F9-S02 — Authentication & Email Verification** (Product Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-084` and `docs/04_PROJECT/AUTHENTICATION.md`. A new, fully isolated `User`/`OtpCode` domain (no foreign key to or from any business model) implements real email/password registration with `bcryptjs` password hashing, mandatory six-digit OTP email verification (SHA-256 hashed, single-use, configurable expiration), login (verified accounts only, with a working "resend verification code" affordance for unverified ones), and a full forgot/reset-password flow reusing the same OTP screen. Sessions are stateless signed JWTs set as httpOnly cookies by `apps/web`, never verified client-side. Email delivery goes through an `EmailSender` port (mirroring `AI_PROVIDER`'s Null-Object pattern) bound to a console-logging default, since no SMTP provider is configured in this environment. Rate limiting applied per-endpoint on all five endpoints the ticket named. Existing routes remain unauthenticated — this sprint delivers the complete auth *experience*, not a retrofit of every existing screen, per its own "Do not couple business modules to authentication." Verified live end-to-end (registration through OTP auto-submit through login through forgot/reset password), including confirming the session cookie is genuinely httpOnly and that a consumed OTP is correctly rejected on reuse.
- **F9-S01 (second use of this sprint id) — Marketing Landing Page** (Product Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-083` and `docs/04_PROJECT/DESIGN_SYSTEM.md`'s "Public Marketing Site" section. This ticket self-identified as `F9-S01`, already used by "Product Experience Polish" (`CTO-077`) — resolved by proceeding on this ticket's actual content and labeling it explicitly as a second use rather than overwriting the prior entry; see `CTO-083` for the full reasoning. A public landing page now lives at `/` (all 8 required sections: Hero, Trusted Value, Product Workflow, Platform Capabilities, Why AI Visibility Matters, Executive Dashboard Preview, Final CTA, Footer); the pre-existing Workspace moved to `/workspace` with every internal link updated to match. `AppHeader` became pathname-aware (one marketing nav on `/`, the existing internal brand bar everywhere else) rather than restructuring routes into route groups. "Start Free Audit" reuses the existing Onboarding wizard (`F12-S01`); `/login` is a literal placeholder per the ticket ("Authentication is coming in the next sprint"), no real auth. Verified live: responsive at 390px, semantic landmarks/heading hierarchy/SEO metadata all present, one real CSS flex-stretch bug caught and fixed. No business logic changed.
- **F13-S01 — Knowledge Graph Evolution** (Intelligence Platform): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-082` and `docs/04_PROJECT/CURRENT_STATE.md`'s "Optimization Patterns" section. A new `OptimizationPattern` aggregate (`apps/api/src/domain/optimization-pattern/`) identifies Optimization Rules that recur across ≥2 distinct Projects platform-wide, keyed only by the static `optimizationRuleId` — the `optimization_patterns` table has no foreign key to Project/Client/Audit anywhere, making cross-tenant leakage structurally impossible rather than merely convention-enforced. Confidence is a simple, explainable recurrence count (distinct-Project count), not a fabricated outcome-correlation model, given the Rule catalog's current 3-rule, execution-status-only scope. Lifecycle: `candidate → active → invalidated`, discovery explicitly triggered via `POST /patterns/discover` (no background jobs), invalidation terminal and never silently overridden by a later recompute. `generateOptimizationPlan` gained one optional, default-empty parameter so 4 of its 6 call sites are byte-identical to before; `AiContextBuilderService` and `AuditAnalysisQueryService` were updated to attach `PatternReference`s (aggregate counts only) to `OptimizationItem.reasoning` when an active Pattern matches. A real DI wiring bug (missing `DatabaseModule` import) was caught at first boot and fixed; the full lifecycle was verified live against real data before all test artifacts were reverted.
- **F12-S01 — Self-Service Onboarding** (Commercial Readiness): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-081` and `docs/04_PROJECT/GUIDED_EXPERIENCE.md`'s "Self-Service Onboarding" section. A six-step guided wizard at `/onboarding` (Welcome → Your Agency → First Client → First Audit → Your Report → Done) reusing `StageProgress` (`F9-S04`) as its progress indicator and the exact same `createClient`/`createAudit` Server Actions the Workspace page already uses — zero new `apps/api` endpoints or domain concepts. "Organization"/"Agency profile" has no backend account concept to attach to (this platform has no auth/multi-tenancy), so it's saved to `localStorage` purely to personalize wizard copy, mirroring the reasoning already validated for Proactive Recommendation dismissal (`CTO-079`). Resumable: a returning visitor with an existing Client and completed Audit is routed straight to the success checklist rather than repeating steps. A real bug (the resume path assuming the first Client returned by the API was always the relevant one) was caught and fixed via live verification — creating a second genuinely new Client through the full wizard and confirming a reload correctly resumed to it, not the pre-existing demo Client. No business logic changed anywhere in `apps/api`.
- **F11-S01 — Production Hardening** (Production Readiness): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-080` and `docs/04_PROJECT/PRODUCTION_READINESS.md`. Production-only secret enforcement (`assertProductionSecrets`, `packages/config` — the API refuses to start with `NODE_ENV=production` unless real `DATABASE_URL`/`POSTGRES_PASSWORD`/`MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` are set, scoped to `apps/api`'s own bootstrap after it was found to wrongly block `apps/web`'s `next start`); runtime request-body validation (`class-validator` on every DTO plus a global `ValidationPipe`); explicit CORS policy, response compression, and security headers (`helmet`); a global rate limiter (`@nestjs/throttler`, health checks exempted via `@SkipThrottle()`); a global request timeout; configurable log verbosity (`LOG_LEVEL`). Removed the seven unfilled root-level scaffolding template files and unused placeholder directories flagged by the `F8` Local Development Access Report. No business logic changed — every domain rule from `F4`–`F10` is untouched; verified live (production-secret guard, rate-limit boundary, security headers, CORS, compression all confirmed via real requests, not assumed from middleware being installed).
- **F10-S03E — Audit Comparison** (Page Audit Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-102`. New `/projects/:id/compare` screen compares two real completed Audits of the same Page: Old Score/New Score/Delta/Trend per category (with real improved/declined row highlighting), New/Resolved/Persistent Issues, and the target Audit's current Recommendations. New `PageComparisonService` composes the existing `AuditComparisonService` (`F4-S03`, previously unused by the frontend) for the Finding diff rather than duplicating it, reuses `computeScores`/`generateOptimizationPlan` unchanged, and adds the one genuinely new piece — numeric Score delta/trend, which nothing in this codebase computed before. A same-URL guard (`PageComparisonUrlMismatchError`) keeps this page-scoped comparison distinct from the existing project-scoped `/audits/compare`. No AI provider involved. Verified live against two real Audits of the same URL run ~55 minutes apart.
- **F10-S03D — Site Explorer** (Page Audit Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-101`. New `/projects/:id/site-explorer` screen — Site (the Project's real domain) → Folders (derived purely from real audited URLs' path segments, no fabricated hierarchy) → Pages (the existing `F10-S03A` `ProjectPage[]`, no new endpoint), with Tree View and List View, Search, Status/Priority/Score filters, and five real issue filters (Missing Title, Missing H1, Thin Content, Structured Data, Canonical Issues — each reading a real Rule's Finding evidence via a new `ProjectPage.issues` field) plus multi-page selection. Broken Links has no backing Rule today (no Rule follows outbound links) and is shown as an honestly-disabled, clearly-labeled filter rather than fabricated data. Verified live against real audited pages: Tree View correctly nested a page under its real URL folders, the Canonical Issues filter correctly isolated the one real page with a canonical mismatch, and multi-select/List View both worked against the same filtered, real data.
- **F10-S03C — Explainability** (Page Audit Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-100`. Every Recommendation, everywhere one is shown (Audit Detail, each Page Detail section, the Executive Dashboard's Priority Actions), now exposes an expandable Finding → Rule → Heuristic → Signals → Evidence chain via one shared component (`apps/web/app/components/recommendation-explainability.tsx`) — Rule Version, Heuristic (new: `RuleExplanation.heuristic`, `packages/contracts/src/scores.ts`), Confidence, Evidence, and Signals as "Raw Values" all real, never fabricated, never hidden (collapsed by default via `<details>`, one click away, never truncated once expanded). Verified live on both a real Audit's Page Detail and its Project Dashboard, confirming the same component correctly resolves both `core`- and `ai-visibility`-scoped Rules.
- **F10-S03B — Page Detail** (Page Audit Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-099`. `/audits/:id` (the Page Detail view, `F10-S03A`) rebuilt into the required Overview/Scores/Metadata/Headings/Content/Images/Structured Data/Technical/Performance/Internal Links/External Links/Recommendations structure — zero backend analysis changes, no new endpoint. Every section shows Issues/Warnings/Passed Checks/Evidence/Recommendations sourced from the real Rule(s) that already back it (`apps/web/app/(shell)/audits/[id]/page-detail.ts`); failed checks are never hidden. The one contract addition, `RuleExplanation.classification` (`packages/contracts/src/scores.ts`), extracts a decision `compute-scores.ts` already made per Finding into its own field — a refactor for single-source-of-truth, not new logic. External Links (no backing Rule exists today) is shown honestly as a signal-only fact with an explicit "no Rule evaluates this" note, rather than a fabricated pass/fail. Verified live against a real `https://www.iana.org` Audit: every section showed real, non-fabricated data traceable to a Finding, including correctly classifying a low-severity failure as a Warning rather than an Issue.
- **F10-S03A — Page Audit Foundation** (Page Audit Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-098`. A "Page" is a Project's distinct Audit URLs, each represented by its most recent Audit — a pure derivation, nothing new persisted, matching this platform's real single-URL-per-Audit architecture rather than fabricating a multi-page-site concept. New `GET /projects/:id/pages` (`ProjectPagesQueryService`) composes existing Read Models only (`computeScores`, `generateOptimizationPlan`, `sortByPriority` — all unmodified, zero new analysis Rules). New `/projects/:id/pages` list screen (Total Rules/Evaluated/Passed/Failed/Skipped-style Overall/SEO/AI Visibility scores, Status, Last Audit, Findings, Priority columns, client-side Search/Filter/Sort). Each row links to the existing, unmodified `/audits/:id` Audit Detail page as "Page Details" — already showing real Status, Execution Timeline, the `F10-S02C` Score Explainability panel, Findings, and Optimization Plan, so no second detail view was built. Verified live in a real browser against two real Audits (`https://www.iana.org`, `https://www.iana.org/domains/root`) under one auto-provisioned Project: both pages listed with real, differing scores, Search/Sort both confirmed working, and clicking through loaded genuine Audit detail.
- **F10-S02D — Score Validation** (Score Engine Hardening): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-097` and `docs/04_PROJECT/SCORE_CALIBRATION_REPORT.md`. Benchmarked the deterministic Score Engine against six real audits (`example.com`/`github.com`/`wikipedia.org`/`openai.com`/`developer.mozilla.org`/`cloudflare.com`), report only — no Rule/Heuristic/weighting code changed. Found `seo-metadata-quality` fails 4 of 5 valid real sites (too strict), two root-caused signal-detection bugs (sitemap-detection only retries on HTTP 405, not other non-2xx statuses like GitHub's real 406; internal/external link classification likely uses exact hostname instead of registrable domain, misclassifying Wikipedia's own subdomains as external), `seo-performance-estimate` passing 5/5 real sites even against self-reported "high" Core Web Vitals risk (too permissive), `seo-structured-data` under-weighting JSON-LD, missing image dimensions never surfacing as its own Finding, and `ai-visibility-readiness` reflecting single-homepage entity density rather than brand-level AI visibility (a methodology limit, not a weight problem). `openai.com`'s crawl was blocked (HTTP 403) and excluded from calibration analysis as a distinct, separately-reported finding.
- **F10-S02C — Score Explainability** (Score Engine Hardening): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-096`. Every `CategoryScore` now carries `totalRules` and a `rules: RuleExplanation[]` array — one entry per Rule, each `{ finding, signals }` — so every Score displayed in the UI traces down to the real Rule outcome, Finding, Evidence (`finding.evidence`), and the real `AnalysisSignal`s that fed the Heuristic behind it. The Scores Panel (`apps/web/app/components/scores-panel.tsx`) always shows the Total/Evaluated/Passed/Failed/Skipped coverage line, plus a native `<details>`/`<summary>` expand (no client-side JS) revealing the full Rules → Findings → Evidence → Signals chain per category. Two new read repositories (`SignalReadRepository`, `HeuristicReadRepository`) back all three Score-producing surfaces (Audit creation response, `GET /audits/:id/analysis`, `GET /projects/:id/dashboard`) with real, DB-persisted data — verified identical across all three on a real `github.com` Audit. No AI provider involved, no mocked data anywhere in the chain.
- **F10-S02B — Real Scoring Engine** (Score Engine Hardening): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-095`. Implements the `F10-S02A` Score Engine Audit's scoring-fabrication findings. `CategoryScore.score` is `number | null` — a category with zero evaluated Rules is `null`/`status: 'insufficient-data'` ("Insufficient Data" in the Scores Panel), never a fabricated `100`. A new `status: 'incomplete'` marks categories backed by fewer than 2 evaluated Rules (today: `content`, `performance`, `ai-visibility`, each with exactly one Rule) — the score is still real, never fabricated, just visibly flagged as thin. Every `CategoryScore` now exposes `evaluatedRules`/`passedRules`/`failedRules`/`skippedRules`. A new `'skip'` `RuleOutcome` (distinct from `'fail'`) marks a Rule whose required Heuristic was missing, so "never checked" is no longer misreported as "failed." Overall Score is the mean of only the categories with a real score — an `'insufficient-data'` category is excluded outright, never counted as 0 or 100. Verified against three real audits (`example.com`/`github.com`/`openai.com`, overall 46/79/42) whose per-category scores differ solely from real crawled Findings.
- **F10-S02A — Score Engine Audit** (Score Engine Hardening): Delivered — a read-only architectural audit of the scoring pipeline (no code modified), tracing every Dashboard score's data source, Signals, Heuristics, Rules, finding generation, weighting, and final calculation. Identified that category scores defaulted to a fabricated `100` when zero Rules were evaluated, that `content`/`performance`/`ai-visibility` categories (one Rule each) could only ever score exactly 0 or 100, that Rule severity had no effect on score magnitude, and other findings — implemented by `F10-S02B` above where in scope.
- **F10-S01 — Proactive AI Assistant** (AI Product Intelligence): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-079` and `docs/04_PROJECT/PROACTIVE_ASSISTANT.md`. The AI Consultant page (`apps/web/app/projects/[id]/consultant/`) now shows a new `ProactiveRecommendations` section above the existing reactive `ConsultantChat`, surfacing insights unprompted. Built entirely by reusing the AI Daily Briefing (`F7-S04`, `GET /briefing/daily`) filtered to the current Project and relabeled into five sections (High-Priority Alerts, Risk Notifications, Verification Reminders, Optimization Opportunities, Daily Highlights) plus a templated executive-summary sentence — zero new `apps/api` endpoints, zero new contracts, zero new insight-generation logic. Every Recommendation carries Why/Evidence/Expected Impact/Recommended Action, reusing `BriefingItem.reason`/`evidence`/`businessImpact`/`recommendedNextAction` directly. Dismissal is client-side only (`localStorage`, keyed per Project), since the platform has no auth/session concept to scope server-side dismissal state to. No new business capability, no AI architecture change — verified live, including that a dismissal persists across a page reload and that the existing reactive Chat still works unchanged underneath.
- **F9-S04 — Guided Experience** (Product Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-078` and `docs/04_PROJECT/GUIDED_EXPERIENCE.md`. `computeNextStep` (`apps/web/app/lib/next-step.ts`) derives a single highest-priority "next recommended action" purely from data the Dashboard already fetches, rendered via a new `NextStepBanner` at the top of every Dashboard. A new `StageProgress` stepper shows the current stage of both the Optimization Cycle and Optimization Campaign lifecycles. Primary actions promoted to `.btn-primary` on the Campaign and Audit Detail pages; the Executive Client Report gained a "What's Next" panel. Empty states that represent an actionable gap now explain what produces the missing data; empty states that represent good news got reassuring copy instead. No new business functionality, no domain model change — verified live against both ends of the decision ladder (a fresh Project with no Baseline, and a fully-progressed demo Project).
- **F9-S01 — Product Experience Polish** (Product Experience): Delivered, see `docs/04_PROJECT/DECISION_LOG.md#cto-077` and `docs/04_PROJECT/DESIGN_SYSTEM.md`. A hand-authored CSS design system (`apps/web/app/globals.css` — color/spacing/typography tokens, no UI framework dependency) applied across every screen: `Card`/`Badge`/`Banner`/`EmptyState`/`Skeleton`/`Breadcrumbs`/`PageHeader`/`ConfirmButton` components, real `<table>` markup for tabular data, native `<dialog>`-based confirmation for the two irreversible transitions (Cycle → completed, Campaign → archived), consistent success/error feedback for every state-changing action, WCAG AA-verified color contrast, and tablet-responsive layout. Two real bugs (a confidence-badge color inversion, and a CSS rule that kept closed dialogs visible) were found and fixed via live browser verification. No business workflow redesigned, no new functionality.
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

**Authentication & Email Verification** (deferred from `F9-S02`)
- Gating existing routes/APIs behind requiring a session (every route remains open today)
- A persisted/revocable session table (currently stateless JWTs)
- A `/logout` route and signed-in state in `AppHeader`
- A working `RESEND_API_KEY` — `ResendEmailProvider` (`F9-S02-HF02`/`F9-S02-HF03`) is fully implemented and verified to genuinely call Resend's API; no real account/API key exists in this environment to confirm actual inbox delivery. Adding SES/Postmark/SendGrid/Mailgun instead is a new `EmailProvider` implementation, not a redesign.
- OAuth/SAML identity providers (Google, Microsoft, GitHub, SAML) — the session model doesn't assume email/password is the only path, but none are implemented

**Marketing Landing Page** (deferred from `F9-S01`, second use of this sprint id)
- Real Privacy/Terms/Contact pages (footer items currently render as inert text, not fabricated links)
- Separate `/product`, `/platform`, `/about` routes (currently same-page anchors)
- A public documentation site distinct from the API's Swagger UI

**Knowledge Graph Evolution / Optimization Patterns** (deferred from `F13-S01`)
- Outcome-correlation confidence (weighting Pattern confidence by confirmed Impact Assessment improvements, not just recurrence count) — deferred until the Optimization Rule catalog has enough rule diversity for such a statistic to be meaningful
- Scheduled/automatic Pattern discovery (currently explicit via `POST /patterns/discover`)
- Cross-Rule pattern relationships (e.g. "Rules X and Y tend to co-occur")

**Self-Service Onboarding** (deferred from `F12-S01`)
- A real Organization/account aggregate and authentication (no accounts system exists yet)
- Server-persisted onboarding progress/completion state
- Multi-user or team invitations within an agency
- Billing/plan selection during onboarding

**Production Readiness** (deferred from `F11-S01`)
- Docker images / container build for the API and web app
- CI/CD pipeline
- Infrastructure-as-code / deployment orchestration
- A custom Content-Security-Policy (currently uses helmet's defaults)
- A Redis client / cache layer (Redis remains a health-checked, unused TCP dependency)
- Authentication / authorization

**Proactive AI Assistant** (deferred from `F10-S01`)
- Server-persisted dismissal state (blocked on this platform having no authentication/user concept yet)
- Push/email delivery of Recommendations (would duplicate the Daily Briefing's own already-deferred Notifications/Emails scope)
- A dedicated Recommendations API distinct from `GET /briefing/daily`
- Workspace-wide (cross-Project) proactive surfacing on the Consultant page (the Daily Briefing already covers this on the workspace home page)

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

**Heuristic Analysis (Extraction Engine / Heuristic Engine / Rules Engine / Scoring Engine)** (deferred from the sprint that made zero-AI-provider audits produce real SEO/technical/content/performance/accessibility/AI-visibility scores — `services/extraction`, `services/heuristics`, the expanded `services/analysis` rule set, and `apps/api/src/application/scoring`)
- Duplicate title/meta description/content detection across pages, orphan page detection, sitewide broken-link crawling — all require multi-page site crawling, which does not exist in this architecture (every `AuditRequest`-scoped result is `@unique auditId`, i.e. one URL per audit)
- Real image dimension/oversized detection and real JS/CSS/font *byte weight* — would require fetching every referenced resource, a new network fan-out pattern and real operational-cost increase; today's Performance analyzer/heuristic reports counts and heuristic estimates only
- Full schema.org vocabulary validation — only structural JSON-LD validity (parses, has `@context`/`@type`) is implemented
- Real AI-provider Signal contribution — the `AnalysisSignal.sourceType: 'ai-provider'` shape and the Heuristic Engine's Signal-combination contract already support it generically, but no provider is wired to it; today's `ai-visibility` analyzer Signal is still the existing Knowledge-Graph-based heuristic, not an LLM call

**Real Scoring Engine** (deferred from `F10-S02A`/`F10-S02B`, see `docs/04_PROJECT/DECISION_LOG.md#cto-095`)
- Severity-weighted category/overall scoring — a high-severity failed Rule and a low-severity failed Rule currently count identically toward a category's score; Optimization Rule severity only affects which display bucket (issues vs. warnings) a failed check lands in, not the score's magnitude
- Adding enough additional Rules to `content`/`performance`/`ai-visibility` for those categories to naturally clear the `MINIMUM_EVALUATED_RULES` (2) threshold and reach `status: 'ok'` — today they are permanently `'incomplete'` given the current Rule catalog size, by honest design rather than by omission
- Reconciling the Heuristic layer's category tags with the Rule layer's — `heading-structure-quality`/`image-accessibility` Heuristics (`services/heuristics`) tag `category: 'content'`, while their corresponding Rules (`services/analysis`) tag `category: 'accessibility'`; the Rule's category is what reaches the Dashboard, but the mismatch is undocumented in code
- A loud failure instead of `compute-scores.ts`'s silent `resolveOptimizationRule(finding.ruleId)?.title ?? finding.ruleId` fallback, for the case where a Rule ships with no matching Optimization Knowledge Base catalog entry

**Score Explainability** (deferred from `F10-S02C`, see `docs/04_PROJECT/DECISION_LOG.md#cto-096`)
- A dedicated Signal/Heuristic Read Model or standalone browsing UI outside a Score's own drill-down
- Signal-level confidence visualization (every Signal already carries a `confidence` field, unused by the current explainability UI)
- Cross-audit Signal comparison (would extend `AuditComparisonService`, `F4-S03`, not this ticket's per-Score drill-down)
- A `heuristicKey` field persisted on `Finding` itself, replacing the static `RULE_TO_HEURISTIC_KEY` lookup table in `compute-scores.ts` — deferred because it would require a schema migration and touching every existing `Finding` consumer for a fact that never changes at runtime

**Site Explorer** (deferred from `F10-S03D`, see `docs/04_PROJECT/DECISION_LOG.md#cto-101`)
- A real Broken Links Analysis Rule — requires following outbound links and checking their status, the same "new network fan-out pattern and real operational-cost increase" already named above under "Heuristic Analysis"; `issues.brokenLinks` stays `null` (honestly not evaluated) until this exists
- Bulk actions over a multi-page selection (e.g. bulk re-audit, bulk export) — the ticket asked only for selection itself
- Server-side pagination/filtering for the Site Explorer — same small-per-Project-volume reasoning as the Pages list (`F10-S03A`)
- A persisted `Folder` concept — today's tree is derived fresh from real URLs on every read, with no independent identity or behavior

**Audit Comparison** (deferred from `F10-S03E`, see `docs/04_PROJECT/DECISION_LOG.md#cto-102`)
- A visual score-over-time chart across more than two Audits of the same Page
- Surfacing Entity/Knowledge-Graph comparison facts (`AuditComparisonResult.entities`/`.aiVisibility`, already computed by the existing `/audits/compare` endpoint) in the new page-scoped Compare UI — today only Scores/Issues/Recommendations are shown
- A dedicated `findByProjectIdAndUrl` repository query, replacing the `findAll()` + in-memory filter idiom `listAuditsForPage` deliberately reused for consistency with the rest of this codebase

**Score Calibration** (deferred from `F10-S02D`, see `docs/04_PROJECT/DECISION_LOG.md#cto-097` and `docs/04_PROJECT/SCORE_CALIBRATION_REPORT.md` for full evidence)
- `detectResource()` (`services/discovery/src/detect-resource.ts`) only retries with GET on an exact HTTP 405; should accept a broader set of "resource exists" responses so a real sitemap behind content-negotiation (406) or bot-protection isn't reported as absent
- Internal/external link classification (inventory engine) should compare registrable domain (eTLD+1), not exact hostname, so same-brand subdomains count as internal
- Widen `metadata-quality` combinator's title/description bands and/or make the Rule graduated instead of requiring both fields `'ok'` to pass
- Raise `performance-estimate.rule.ts`'s `MINIMUM_ACCEPTABLE_SCORE`, or fail when any `coreWebVitalsEstimate` dimension is `"high"` risk
- Weight JSON-LD above OpenGraph/Twitter Card in the `structured-data-coverage` combinator instead of treating any one of the three as sufficient
- A dedicated image-dimensions Rule (the existing `missingDimensionsCount` Signal is measured but never gates a check)
- Crawler bot-resilience: a custom `User-Agent` header and/or a distinct, clearly-labeled audit outcome for a non-2xx crawl, so a blocked crawl isn't indistinguishable from a real, badly-optimized page

**Page Audit Foundation** (deferred from `F10-S03A`, see `docs/04_PROJECT/DECISION_LOG.md#cto-098`)
- True multi-page site crawling (discovering and auditing every page of a site from one request) — the same standing limitation already named above under "Heuristic Analysis"; a "Page" today can only be a URL someone explicitly submitted an Audit for
- A dedicated `Page` database aggregate, distinct from deriving Pages from Audits by URL — would only be worth it once Pages need their own identity independent of "latest Audit for this URL" (e.g. page-level notes, manual tagging)
- Pagination and server-side search/filter/sort for the Pages list — deferred because per-Project Audit volume is small enough today that client-side filtering over the full list is sufficient (no list anywhere else in this codebase paginates yet either)

**Page Detail** (deferred from `F10-S03B`, see `docs/04_PROJECT/DECISION_LOG.md#cto-099`)
- A dedicated External Links Analysis Rule — today only `internal-linking-health` exists; External Links is shown as a real Signal-only fact with no pass/fail check, deliberately not fabricated to fill the gap
