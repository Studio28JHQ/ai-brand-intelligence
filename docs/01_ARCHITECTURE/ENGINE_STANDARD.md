# Purpose

To define the single architecture every business engine (each capability under `services/*`: discovery, crawler, inventory, and every engine added after them) must implement, so that every engine is independent, replaceable, and consistent regardless of the capability it provides. This document is binding on all business engines; it does not define or constrain the Workflow layer, the API, the frontend, or any other consumer of an engine.

# Engine Purpose

- An engine is a single, independent unit of business logic that performs exactly one capability of the audit domain.
- An engine owns its own extraction or analysis logic and the persistence of its own output. It owns nothing else.
- An engine has no awareness of other engines, of the workflow that invokes it, or of the interface (API, CLI, worker, or otherwise) that ultimately triggers it.
- An engine performs extraction, computation, or analysis only. It does not score, recommend, or render — those are the responsibilities of other engines or layers, never blended into one.

# Engine Lifecycle

1. Invoked — the engine is called with the inputs it declares; it does not reach out to acquire its own inputs from elsewhere.
2. Executes — the engine performs its business logic in isolation: pure computation plus whatever external calls its specific capability requires (for example, an HTTP fetch or HTML parse).
3. Persists — the engine writes its own structured result to storage, scoped by `auditId`, through its own repository module.
4. Returns — the engine returns its structured result to its caller.

The engine's lifecycle ends when it returns. It does not manage retries, scheduling, conditional execution, or orchestration across engines — that is Workflow responsibility, not engine responsibility.

# Input Contract

- Inputs are explicit function parameters — `auditId` plus whatever upstream data the engine needs — never a shared, mutable context object.
- An engine may consume the output of a prior engine, but only as a plain value handed to it by its caller. An engine never reaches into another engine, imports another engine, or fetches another engine's output itself.
- Inputs are primitives or shared contract types from `packages/contracts`. Never framework-specific types.

# Output Contract

- Every engine returns a `Promise` resolving to a single, shared contract type defined in `packages/contracts`.
- The contract type is the complete, structured representation of the engine's result. It does not carry operational metadata such as timings or tracing — that belongs to logs, not to the result.
- Output types are named per capability (for example `CrawlResult`, `InventoryResult`) and exported from `packages/contracts/src/index.ts`.
- Where a smaller subset of the full result is needed for external consumption (for example, an API response), a corresponding summary type (for example `CrawlSummary`, `InventorySummary`) is defined alongside the full result type. The full result is never exposed outside the platform directly.

# Error Contract

- Expected, operational failures (a fetch fails, a resource is missing, a page cannot be reached) are captured as data in the engine's result contract and returned normally. They are never thrown. Each engine's contract defines the field(s) that carry this state (for example `success`, `httpStatus`).
- Unexpected failures (programming errors, invalid internal state) are thrown as exceptions and propagate to the caller. An engine never catches an unexpected exception and silently discards it.
- An engine never throws to represent a normal "not found" or "unreachable" outcome. That is business data, not exceptional control flow.

# Execution Contract

- An engine is invoked as a plain async function, not as a class requiring lifecycle management, dependency injection, or a runtime container.
- An engine is framework-agnostic: no NestJS, Next.js, or any other delivery framework may appear inside an engine's package.
- An engine is invoked exactly once per audit for its capability. Concurrency, retries, and conditional execution belong to the Workflow layer, never to the engine.
- An engine must be safe to invoke in isolation — from a script, a test, or any other caller — without a running application server.

# Dependency Rules

- An engine may depend on: `@ai-visibility/contracts` (shared types), `@ai-visibility/config` (environment), `@ai-visibility/database` (persistence), `@ai-visibility/shared` (logging and correlation), and general-purpose libraries required for its own extraction logic.
- An engine must never depend on another engine, on `apps/api`, on `apps/web`, or on any other service under `services/*`.
- An engine must never depend on a specific delivery framework.
- Data flows between engines only through the Workflow layer passing values from one Step to the next. It never flows through a direct import between engines.

# Logging Rules

- Engines log through `@ai-visibility/shared`'s logger, never through `console.log` or `console.error` directly.
- Every log entry is structured and includes, at minimum, the `auditId` and the correlation ID when one is available.
- An engine logs the outcome of its execution — success or failure — at an appropriate level (`info`, `warn`, or `error`). It does not log at a volume that obscures that signal (no per-element or per-line debug logging during normal operation).
- An engine never logs secrets, credentials, or full page content.

# Metrics Rules

- Metrics collection is out of scope for the MVP. No dedicated metrics or telemetry system exists in this repository yet.
- Until a metrics system exists, an engine's only observability surface is its structured logs. Log entries must therefore carry enough structured fields (`auditId`, engine name, outcome, and duration where practical) to serve as a metrics source later without modification.
- Introducing a metrics system is an architectural decision outside the scope of this document. It must be proposed through `docs/03_PRODUCT/FUTURE_ROADMAP.md` before it is implemented.

# Testing Rules

- An engine's core extraction or decision logic must be organized as a pure function, separable from I/O (persistence, network calls), so it can be tested without a database or network connection.
- An engine's persistence (repository) module is a thin, separately testable unit responsible only for mapping the engine's output onto storage.
- No test framework is standardized in this repository yet. Adopting one is a separate decision that must be made explicitly, as its own task, before engine tests are implemented. This document defines the shape an engine must have to be testable; it does not select the tooling.

# Compliance

This standard is mandatory for every business engine, existing and future, under `services/*`. It does not, by itself, retrofit engines implemented before it existed — bringing an existing engine into full compliance is separate, explicitly scoped work, not an implication of this document.
