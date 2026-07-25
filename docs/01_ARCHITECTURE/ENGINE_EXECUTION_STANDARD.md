# Purpose

To define the standard sequence of phases every business engine goes through during a single invocation, and the rules that govern context, errors, and observability as execution moves through those phases. This document refines the four-phase lifecycle already defined in `ENGINE_STANDARD.md` (Invoked, Executes, Persists, Returns) into the granular execution phases below. It does not redefine an engine's contracts, its place in the layer model, or its module structure — those are governed by `ENGINE_STANDARD.md`, `MODULE_STANDARD.md`, and `DEPENDENCY_MODEL.md`, which this document assumes and does not repeat. This standard is mandatory for every business engine.

# Execution Lifecycle

A single engine invocation moves through the following phases, in order: Input Validation, Context Handling, Business Execution, Result Generation, Completion. Error Propagation, Event Emission, and Metrics Collection are not phases of their own — they are cross-cutting concerns that apply at every phase, defined separately below because they behave the same way regardless of which phase they occur in.

Together, Input Validation and Context Handling correspond to the "Invoked" phase in `ENGINE_STANDARD.md`; Business Execution corresponds to "Executes"; Result Generation corresponds to "Persists"; Completion corresponds to "Returns."

# Input Validation

- Before any business logic runs, an engine confirms that the inputs it received are structurally present and well-formed enough to be processed, per the Input Contract in `ENGINE_STANDARD.md`.
- Input validation checks structure and presence only. It never performs business logic to validate an input (for example, confirming a resource is reachable is Business Execution, not Input Validation).
- An input that fails this check is a violation of the engine's contract by its caller, not a business outcome. It is therefore an unexpected failure and follows the Error Contract's rule for unexpected failures, not its rule for expected ones.

# Context Handling

- An engine receives its context strictly as the explicit inputs defined by its Input Contract. It never reads ambient or global state, and it is never given more context than its own contract declares, per the Cross-Module Communication rules in `DEPENDENCY_MODEL.md`.
- An engine treats every value it receives as immutable. It never mutates its input, and nothing calling it may assume mutation occurred.
- Context received by an engine is not carried forward to any other engine by the engine itself. Carrying values between engines is the Workflow Layer's responsibility, per `DEPENDENCY_MODEL.md`, never the engine's.

# Business Execution

- This is the phase where an engine's capability-specific logic runs, per the Engine Purpose defined in `ENGINE_STANDARD.md`.
- Business Execution is self-contained: any external calls or computation the engine's capability requires happen entirely within this phase and do not leak into Result Generation or Completion.
- Business Execution produces the raw outcome of the engine's work. It does not yet take the shape of the engine's declared Output Contract — that shaping happens in Result Generation.

# Result Generation

- Once Business Execution completes, the engine assembles its outcome into the exact shape of its declared Output Contract, defined in `ENGINE_STANDARD.md`, and persists it per the "Persists" phase of the Engine Lifecycle.
- Result Generation never reshapes the engine's outcome to suit a particular consumer or delivery mechanism. Any such shaping belongs to the Interface Layer, per `DEPENDENCY_MODEL.md`, never to the engine.
- A result is only produced in full. An engine never returns a partially assembled result.

# Error Propagation

- Error Propagation follows the Error Contract defined in `ENGINE_STANDARD.md` regardless of which phase the error originates in: an expected, operational failure is captured as data in the result and returned normally; an unexpected failure is thrown and propagates to the caller.
- A failure in any phase never produces a partially-formed result. An engine either completes Result Generation with a fully valid result (which may itself represent a business failure, per the Error Contract) or it does not complete at all and the failure propagates as an exception.
- An engine never converts an unexpected failure into an expected one to avoid propagating it, and never suppresses an exception it did not cause.

# Event Emission

- The platform's only event surface for an engine today is the structured log entry defined by the Logging Rules in `ENGINE_STANDARD.md`. An engine emits at least one such entry per invocation, recording its outcome.
- Event Emission is not a separate signaling mechanism from logging. Until a dedicated event system exists, "emitting an event" and "writing a structured log entry" are the same act, and an engine must not invent an alternate channel for signaling its outcome.
- Introducing a dedicated event or messaging system is outside the scope of this document. It must be proposed through `docs/03_PRODUCT/FUTURE_ROADMAP.md` before it is implemented.

# Metrics Collection

- Metrics Collection follows the Metrics Rules defined in `ENGINE_STANDARD.md`: no dedicated metrics system exists yet, and the structured log entry from Event Emission is the interim observability surface.
- The fields required by `ENGINE_STANDARD.md`'s Metrics Rules — at minimum the engine's identity, its outcome, and its duration — are captured across this lifecycle as follows: duration is measured from the start of Input Validation to Completion; outcome is determined by which path Error Propagation took.
- An engine does not implement its own metrics aggregation, counters, or export mechanism. It only ensures the structured log entry it already produces carries the fields a future metrics system would need.

# Completion Semantics

- An engine invocation is complete once it has returned, per the "Returns" phase of the Engine Lifecycle in `ENGINE_STANDARD.md`, with either a fully valid result or a thrown exception. There is no third, partially-complete state.
- Completion is atomic from the caller's perspective: a caller never observes an engine as partially finished. It either receives a complete, contract-shaped result or the invocation fails outright.
- Completion always coincides with the outcome log entry required by Event Emission. An engine's execution is never considered complete without a corresponding observable trace of how it ended.
