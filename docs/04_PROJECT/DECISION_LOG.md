# Purpose

To record significant technical decisions made during implementation, why they were made, and what alternative was rejected. This is a historical record, not a standard — it explains the reasoning behind decisions already reflected in `docs/01_ARCHITECTURE/` and `docs/04_PROJECT/CURRENT_STATE.md`, it does not itself impose new rules.

# CTO-059

**Title**: Client as the top-level aggregate above Project
**Sprint**: F6-S01
**Decision**: Introduce a `Client` aggregate as the top-level business entity. Every `Project` belongs to exactly one `Client` (required foreign key). The workspace hierarchy becomes `Client → Project → Audit`.

**Why**: The platform is used by agencies managing several customers at once. Without a Client aggregate, every Project was an unowned, flat entity with no way to group the Projects belonging to the same customer.

**How it preserves existing behavior**: `POST /audits { url }` still works with no new required field. When a Project is auto-provisioned from a URL and no `clientId` is supplied, a Client is auto-provisioned the same way Projects were auto-provisioned from a URL in `F4-S01` (find-or-create by primary domain, industry defaulted to `"unknown"`). Passing an explicit `clientId` on `POST /audits`, or creating a Client explicitly via `POST /clients`, lets several Projects share one Client — the actual multi-customer capability this decision exists to enable.

**Rejected alternative**: Requiring `clientId` on every `POST /audits` call. Rejected because it would break the existing audit-creation contract for no benefit to single-customer usage, contradicting the Discovery Protocol's rule to prioritize backward compatibility.

**Scope boundary**: Contacts, billing, organizations, teams, and permissions were explicitly out of scope for this decision and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.

# CTO-061

**Title**: Executive Dashboard as a pure Read Model composition
**Sprint**: F6-S02
**Decision**: Implement the Executive Dashboard as an application-layer composition (`ExecutiveDashboardQueryService`) that reads exclusively from existing Read Models — the Project, Client, and Audit repositories; the Finding, AI Visibility, and Baseline History read repositories already established in `F3-S05`, `F4-S02`, and `F4-S03`; and the Optimization Planner (`generateOptimizationPlan`, see `CTO-062`). It persists nothing new and adds no new endpoint on any Business Engine.

**Why**: The objective requires an "immediate understanding" view without executing business logic or querying Business Engines directly. Composing already-computed Read Model data is the only approach consistent with both constraints, and reusing the Optimization Planner avoids a second, divergent implementation of prioritization.

**Score trend and Priority Actions**: `AiVisibilityAssessment` only ever stored a categorical status (`ready` / `needs-improvement` / `not-ready`) — no numeric score exists anywhere in the domain model. "AI Visibility Score" on the Dashboard is that same categorical value; "Score Trend" is a fixed three-value ordinal comparison of current vs. Baseline, reusing the same comparison approach already used by the Audit Comparison Service (`F4-S03`). The Dashboard's "Priority Actions" are the Optimization Plan's own `OptimizationItem[]` (see `CTO-062`), sorted by priority and capped to the top five — the Dashboard does not compute its own separate impact/effort/priority values.

**Rejected alternative**: Computing a new numeric AI Visibility score. Rejected because no such score exists anywhere in the domain model; introducing one would be new business logic invented outside a Read Model, which the objective explicitly forbids.

**Scope boundary**: Charts, filters, PDF export, dashboard widget customization, and a multi-project dashboard view were explicitly out of scope and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.

# CTO-062

**Title**: Optimization Planner as an application-layer projection with a dependency-aware prioritization model
**Sprint**: F6-S03
**Decision**: Implement the Optimization Planner at `apps/api/src/application/optimization/` — `generateOptimizationPlan` (a projection: Findings + Project/Audit context → `OptimizationItem[]`) and `optimization-prioritization.ts` (the prioritization model). This is the same underlying capability first implemented in this sprint under the name "Recommendation Engine"; it was renamed and extended to "Optimization Planner" / `OptimizationItem` / `OptimizationPlan` before any external consumer depended on the earlier names, so the rename replaced rather than duplicated it — `Recommendation`, `RecommendationSummary`, and `apps/api/src/application/recommendation/` no longer exist. It lives in the application layer (not presentation, where recommendation generation originated as a single-consumer helper in `F2-S14`) because both the Audit response (`audit-summary.view.ts`) and the Executive Dashboard (`F6-S02`, see `CTO-061`) consume it — presentation-layer code depends on it, never the reverse.

`OptimizationItem` carries `title`, `description`, `rationale` (business rationale), `expectedImpact`, `estimatedEffort`, `priority`, `status`, `supportingFindingIds`, `projectId`, and `auditId`. The Executive Dashboard's Priority Actions are this same `OptimizationItem[]`, sorted by priority and capped to the top five — no separate Dashboard-side type or heuristics.

**Prioritization model**: Priority is a deterministic composite of four inputs, each a `low`/`medium`/`high` level:
- **Expected impact** — derived from the Audit's overall `AiVisibilityAssessment.status` (`not-ready` → high, `needs-improvement` → medium, `ready` → low).
- **Estimated effort** — derived from the count of Findings an Optimization Item groups (1 → low, 2–3 → medium, 4+ → high).
- **Confidence** — currently always `high`: the Rule Engine only ever returns a definitive pass/fail outcome, never a partial or uncertain one, so there is no real signal to differentiate confidence today. The model still takes it as an explicit input so a future Rule Engine capable of partial/uncertain outcomes needs no redesign here.
- **Dependencies between Optimization Items** — the Workflow Runtime always executes Business Engines in one fixed order (discovery → crawl → inventory → analysis → entity → knowledgeGraph → aiVisibility). An Item tied to an earlier stage genuinely blocks Items tied to later stages that are also in the same plan, since later stages depend on earlier ones having actually run — so an Item's dependency weight is how many other Items in the same plan it blocks. This is read from the platform's own already-established, unchanging step order, not invented.

These four levels are scored and combined (impact weighted highest; low effort and high blocking weight both favored) into `priority`. The plan remains a projection: nothing is persisted, and everything is recomputed from Findings and Project/Audit context on every read.

**Why not expose Confidence as a field**: the acceptance criteria list the fields to expose (Title, Description, Business rationale, Expected impact, Estimated effort, Priority, Supporting Findings); Confidence is named only as a prioritization input, not a field to display, so it stays internal to the model rather than adding contract surface nothing asked to see. The same applies to the raw dependency weight.

**Rejected alternative**: Differentiating Estimated Effort or Confidence by Finding category or source engine, or inventing an unrelated dependency graph between Findings. Rejected because no such taxonomy exists anywhere in the domain model — inventing one would be fabricating data not actually produced by any Business Engine. The pipeline execution order, by contrast, is real and already fixed by the Workflow Runtime.

**Scope boundary**: AI-generated recommendations, task lifecycle, assignments, an approval workflow, and automatic implementation were explicitly out of scope and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.

# CTO-063

**Title**: Optimization Campaign as a persisted execution-tracking aggregate, distinct from the (unpersisted) Optimization Plan
**Sprint**: F6-S04
**Decision**: Implement `OptimizationCampaign` and `OptimizationAction` as genuinely persisted entities (`optimization_campaigns`, `optimization_actions` tables), at `apps/api/src/domain/campaign/`, `application/campaign/`, `infrastructure/campaign/`, `presentation/campaign/`. This is a deliberate architectural contrast with `CTO-062`: the Optimization Plan is a stateless projection recomputed on every read and never persisted, while a Campaign exists specifically to track the *execution* of one such plan over time — a Campaign only makes sense as something with a lifecycle and a durable identity, so unlike the Plan it must be a real aggregate. Both entities follow the exact persisted-aggregate pattern `Audit` established in `F3-S01`: a private constructor, `fromPersistence`, immutable state-transition methods that validate against a fixed transition table and throw on an illegal move, with the Prisma repository fetching the current entity, calling its transition method, and persisting the result — never writing a status directly.

`OptimizationCampaign` belongs to exactly one Project (`projectId`, required) and lifecycle `draft → active → completed → archived`. `OptimizationAction` belongs to exactly one Campaign and lifecycle `pending → in-progress → completed → verified`; each Action carries `projectId` and `auditId` directly (not merely derivable through its Campaign), per the acceptance criteria's explicit reference requirement. All lifecycle transitions on both entities are manual, agency-triggered (`POST /campaigns/:id/status`, `POST /campaigns/:campaignId/actions/:actionId/status`, each `{ status }` validated against the fixed forward-only transition table) — nothing advances automatically, since Automation was explicitly out of scope.

**Referencing the Optimization Item without persisting it**: an `OptimizationAction` must reference the `OptimizationItem` it came from, but `OptimizationItem` (`CTO-062`) has no stable identifier of its own — it is a projection, regenerated identically every time from the same Findings and Assessment, never assigned an id. Rather than adding an `id` field to `OptimizationItem` (which would mean modifying the Optimization Planner, explicitly forbidden by this sprint), each Action snapshots the two facts that already uniquely and deterministically identify which Item produced it: `title` and `supportingFindingIds` (themselves real, persisted `Finding.id` values). Given a fixed `auditId`, `(title, supportingFindingIds)` is exactly reproducible by regenerating the plan — no new identity concept was invented, and the Planner was not touched.

**Creating a Campaign**: `CreateCampaignUseCase` finds the Project's latest completed Audit, reads its Findings and AI Visibility Assessment through the same read repositories the Dashboard and Optimization Planner already use, calls `generateOptimizationPlan` (read-only usage — the Planner's own code is untouched), and creates one `OptimizationAction` per resulting `OptimizationItem`, each starting `pending`. If the Project has no completed Audit yet, creation fails with `NoCompletedAuditError`; a plan with zero Items still produces a valid Campaign with zero Actions (not an error).

**Dashboard integration**: the Dashboard's `campaign` field is a `CampaignProgressSummary` — the Project's latest Campaign's status plus a count per Action status and a `progressPercentage` (share of Actions `verified`), computed by a pure function (`computeCampaignProgress`) shared between the Dashboard and the Campaign's own read model. The Dashboard performs no Campaign business logic of its own, consistent with `CTO-061`.

**Rejected alternative**: Deriving Campaign status automatically from its Actions' statuses (e.g., auto-completing a Campaign once every Action is verified). Rejected because it is a form of automation, and Automation was explicitly out of scope for this sprint.

**Scope boundary**: user assignments, comments, notifications, due dates, automation, and external integrations were explicitly out of scope and are not implemented. See `docs/03_PRODUCT/FUTURE_ROADMAP.md`.
