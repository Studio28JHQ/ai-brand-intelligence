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

# Translation Terms

The fixed English → Spanish → Portuguese (Brazil) rendering for this product's recurring domain
terms (`F10-S05C`), so every `packages/i18n/locales/*` file uses the same word for the same
concept rather than each translator/contributor inventing their own. A term not listed here should
still be translated consistently with these — favor the same register (plain, direct, no
marketing fluff) and prefer a term already used elsewhere in this table over a new synonym.
Never translate proper nouns, rule ids, technical identifiers, or user-entered content at all —
see `docs/04_PROJECT/DECISION_LOG.md#cto-110`'s "justified exceptions."

| English | Español | Português (Brasil) |
|---|---|---|
| Audit | Auditoría | Auditoria |
| Finding | Hallazgo | Descoberta |
| Signal | Señal | Sinal |
| Score | Puntuación | Pontuação |
| Baseline | Línea Base | Linha de Base |
| Recommendation | Recomendación | Recomendação |
| Optimization Plan | Plan de Optimización | Plano de Otimização |
| Optimization Campaign | Campaña de Optimización | Campanha de Otimização |
| Optimization Cycle | Ciclo de Optimización | Ciclo de Otimização |
| AI Visibility | Visibilidad en IA | Visibilidade em IA |
| Project | Proyecto | Projeto |
| Client | Cliente | Cliente |
| Dashboard | Panel | Painel |
| Rule | Regla | Regra |
| Heuristic | Heurística | Heurística |
| Evidence | Evidencia | Evidência |
| Severity | Gravedad | Severidade |
| Category | Categoría | Categoria |
| Priority | Prioridad | Prioridade |
| Confidence | Confianza | Confiança |
| Impact Assessment | Evaluación de Impacto | Avaliação de Impacto |
| Executive Client Report | Informe Ejecutivo para el Cliente | Relatório Executivo para o Cliente |
| AI Consultant | Consultor de IA | Consultor de IA |
| Daily Briefing | Resumen Diario | Resumo Diário |
| Page | Página | Página |
| Site Explorer | Explorador del Sitio | Explorador do Site |
| Activity | Actividad | Atividade |
| Triggered By | Iniciado por | Iniciado por |
| Compare / Comparison | Comparar / Comparación | Comparar / Comparação |
| Verification | Verificación | Verificação |
| Workflow | Flujo de Trabajo | Fluxo de Trabalho |
| Queue / Queued | Cola / En cola | Fila / Na fila |

Status values (`AuditStatus` and similar lifecycle states) — kept identical everywhere one appears:

| English | Español | Português (Brasil) |
|---|---|---|
| Pending | Pendiente | Pendente |
| Running | En ejecución | Em execução |
| Completed | Completado | Concluído |
| Failed | Fallido | Falhou |
| Cancelled | Cancelado | Cancelado |
| Queued | En cola | Na fila |

Severity/priority levels:

| English | Español | Português (Brasil) |
|---|---|---|
| Critical | Crítico | Crítico |
| High | Alto | Alto |
| Medium | Medio | Médio |
| Low | Bajo | Baixo |
