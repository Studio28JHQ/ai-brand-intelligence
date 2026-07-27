# Purpose

To record two things that must be read together, not separately: (1) how this platform's actual AI-labeled product features work today, and (2) the AI Provider configuration infrastructure delivered at `F10-S01` (see `docs/04_PROJECT/DECISION_LOG.md#cto-094`). They are deliberately unconnected — reading only one gives a misleading picture of the other.

# The Product's Actual AI Features: Deterministic, Not LLM-Backed

The AI Consultant Chat (`F7-S03`), AI Daily Briefing (`F7-S04`), and Proactive AI Assistant (`F10-S01`... the *other* one, Proactive Assistant, not this document) all generate their "AI interpretation" text from `StructuredFactAiProvider` (`apps/api/src/infrastructure/ai-conversation/`, bound to the `AiProvider` port, `CTO-069`) — a deterministic answer-generator that dispatches by intent to pure template functions reading only already-computed `AiContext` fields (`optimizationPlan[0].rationale`, `impactAssessment.aiVisibilityChange.trend`, etc.). **No network call, no prompt, no LLM, no non-deterministic generation.** This is a deliberate, repeatedly-reaffirmed architectural decision (`CTO-066`, `CTO-068`, `CTO-069`) — real LLM integration ("OpenAI integration," "Anthropic integration," "Gemini integration," "LLM integration") has been explicitly deferred to `docs/03_PRODUCT/FUTURE_ROADMAP.md` across `F6-S07`, `F7-S01`, `F7-S02`, and `F7-S03`, consistent with the Constitution's Decision Hierarchy placing "Trust and truthfulness of what is reported" above architectural sophistication — a real LLM's outputs are not reproducible the way this platform's "every metric must be defensible" principle requires.

**This document's AI Provider Configuration infrastructure below does not change any of that.** It is new, additive, and structurally isolated: nothing in `application/ai-conversation/` depends on it, and it does not generate any answer a user sees anywhere in the product today.

# AI Provider Configuration Infrastructure (`F10-S01`)

A separate bounded context, `application/ai-provider/` + `infrastructure/ai-provider/` + `presentation/ai-provider/`, for configuring and testing connectivity to external AI providers — infrastructure for a *future* capability, not a capability itself yet.

## Supported Providers

| Provider | `providerId` | Required env var | Default model |
|---|---|---|---|
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-latest` |
| Google Gemini | `google-gemini` | `GOOGLE_API_KEY` | `gemini-1.5-flash` |
| xAI | `xai` | `XAI_API_KEY` | `grok-2-latest` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | `openai/gpt-4o-mini` |
| Perplexity | `perplexity` | `PERPLEXITY_API_KEY` | `sonar` |

Each also has `<PREFIX>_ENABLED` (default `true`), `<PREFIX>_TIMEOUT_MS` (default `30000`), and `<PREFIX>_MAX_TOKENS` (default `4096`) — see `.env.example`. Default model names are current as of this writing; provider catalogs change, and these are meant to be overridden, not treated as permanently accurate.

## The Provider Abstraction

`AiProviderConnector` (`application/ai-provider/ai-provider-connector.ts`) — `{ providerId, testConnection(): Promise<{status, message?}> }`. Six implementations (`infrastructure/ai-provider/*.connector.ts`), all extending `BaseAiProviderConnector`, which owns the one rule every connector must follow: **the real HTTP call executes only if an API key is configured** — checked once, structurally, so no connector implementation can accidentally skip it. Adding a seventh provider is one new class plus one line in `ai-provider.module.ts`; nothing else changes.

**Deliberately narrower than `application/ai-conversation`'s `AiProvider` port** (`CTO-068`) — that port generates completions for the actual product; this one only validates connectivity/credentials. They share a name pattern ("provider") but nothing else, on purpose.

## What Each Connector's Test Connection Actually Calls

- **OpenAI**: `GET /v1/models` (Bearer token) — the cheapest authenticated call OpenAI exposes.
- **Anthropic**: `GET /v1/models` (`x-api-key` + `anthropic-version` headers).
- **Google Gemini**: `GET /v1beta/models?key=...` — Google's own convention puts the key in the query string for this endpoint.
- **xAI**: `GET /v1/models` (Bearer token) — xAI's API is OpenAI-compatible.
- **OpenRouter**: `GET /api/v1/auth/key` (Bearer token) — OpenRouter's `/models` list is public/unauthenticated, so it wouldn't actually validate a key; `/auth/key` returns the calling key's own metadata and does.
- **Perplexity**: `POST /chat/completions` with `max_tokens: 1` — Perplexity has no documented free "list models" endpoint; this is the smallest real request that can validate a key, and is the one connector where a Test Connection call can incur a (negligible) real cost. Documented here deliberately, not an oversight.

Every connector returns the *exact* provider error message on failure (HTTP status + raw response body) — never a generic "connection failed." Verified live by pointing `OPENAI_API_KEY` at a deliberately invalid placeholder key: the connector made a real HTTPS call to `api.openai.com` and returned OpenAI's own `401 invalid_api_key` body verbatim.

## Platform Settings Data Model

`AiProviderSettings` (`packages/contracts/src/ai-provider-settings.ts`) — `providerId`, `label`, `enabled`, `hasApiKey`, `defaultModel`, `timeoutMs`, `maxTokens`, `connectionStatus`, `lastSuccessfulTestAt`. **Never includes the raw API key** — only whether one is present. `AiProviderSettingsService.list()` (application) builds this from config plus whatever `AiProviderStatusStore` (in-memory, process-lifetime — Test Connection results are operational health state, not a business record, so no new Prisma model) has recorded from prior Test Connection calls this process's lifetime. This is "for future UI" as the ticket names it — no settings page consumes it yet.

## API

- `GET /platform/ai-providers` — the full `AiProviderSettings[]` list, no auth gate (matches every other endpoint's current state — nothing in this API requires a session yet, `F9-S02`'s "Rejected Scope").
- `POST /platform/ai-providers/:providerId/test-connection` — runs the real check (or returns `not-configured` immediately, no network call, if no key exists) and records the result.

## Startup Validation

`main.ts` logs a summary on every boot, before the Nest application starts accepting traffic — visibility only, never a startup failure:

```
AI Providers
  ✓ OpenAI
  ✗ Anthropic (missing API key)
  ✗ Google Gemini (missing API key)
  ✗ xAI (missing API key)
  ✗ OpenRouter (missing API key)
  ✗ Perplexity (missing API key)
```

# Rejected Scope

- **Wiring any real provider into `AI_PROVIDER`/`StructuredFactAiProvider`.** Explicitly not requested by `F10-S01`, and would reverse the standing architectural decision described above. See "The Product's Actual AI Features" section.
- **A settings UI.** The ticket names this "for future UI" — the data model and API exist; no `apps/web` page reads them yet.
- **Persisting Test Connection history.** `AiProviderStatusStore` is in-memory only; a persisted audit trail of connectivity checks is a legitimate future upgrade, not required here.
- **Real, verified connectivity to any provider.** No API key for any of the six providers exists in this environment — every Test Connection call in this environment returns `not-configured`. See the Decision Log entry for exactly which environment variables a developer needs to set to complete live validation themselves.
