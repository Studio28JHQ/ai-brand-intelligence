# Purpose

To define how the platform's architectural layers relate to one another: what each layer is responsible for, which dependency directions are allowed and forbidden between them, and how the system guarantees it can never form a circular dependency. This document governs relationships *between* layers. It does not redefine what happens *inside* a business module — that is `ENGINE_STANDARD.md` and `MODULE_STANDARD.md`, which this document assumes and does not repeat. This document is normative for all future development: any change that would violate it must change this document first, deliberately, rather than be implemented around it.

# Architectural Layers

The platform is organized into five layers, ordered from most foundational to most external:

1. **Contract Layer** — the shared data shapes used to exchange information across every boundary in the system.
2. **Foundation Layer** — cross-cutting capabilities (for example configuration, persistence access, logging and correlation) that support every other layer without themselves containing business logic.
3. **Business Module Layer** — the independent engines that implement the platform's actual capabilities, each governed by `ENGINE_STANDARD.md` and `MODULE_STANDARD.md`.
4. **Workflow Layer** — the orchestration of business modules into ordered sequences, per the Workflow Step architecture already established for the audit workflow.
5. **Interface Layer** — the delivery mechanisms that expose the platform's capability to an external actor: an API surface, a frontend application, or any other consumer.

This order is fixed. A layer is defined by its position in this order, not by where its code happens to live.

# Layer Responsibilities

- **Contract Layer**: defines the structure of data that crosses a boundary. Contains no logic and no behavior — only shape.
- **Foundation Layer**: provides infrastructure-facing capability that has no business meaning of its own (reading configuration, reaching storage, emitting a log line). It does not know what a business module does with it.
- **Business Module Layer**: performs exactly one business capability per module, per `ENGINE_STANDARD.md`'s Engine Purpose. It does not know it is being orchestrated, and it does not know what will happen to its output.
- **Workflow Layer**: sequences business modules by adapting each module's public interface into a uniform step, and passing the accumulated result from one step to the next. It contains orchestration only — no business logic, and no knowledge of how any module fulfills its capability internally.
- **Interface Layer**: composes a workflow and presents its outcome to whatever is consuming the platform. It contains no business logic and no orchestration logic of its own — both are delegated to the layers below it.

# Allowed Dependency Directions

- Every layer may depend on the **Contract Layer**.
- Every layer may depend on the **Foundation Layer**.
- The **Workflow Layer** may depend on a business module's public interface, per the Public Interface rules in `MODULE_STANDARD.md`.
- The **Interface Layer** may depend on the **Workflow Layer**.

In every case, a dependency points from a layer toward an earlier layer in the order defined above, never the reverse.

# Forbidden Dependency Directions

- No layer may depend on a layer that comes after it in the order (a lower-numbered layer never depends on a higher-numbered one).
- The **Contract Layer** depends on nothing else in the system.
- The **Foundation Layer** never depends on the Business Module, Workflow, or Interface layers.
- The **Business Module Layer** never depends on another business module, on the Workflow Layer, or on the Interface Layer, per the Dependency Rules in `MODULE_STANDARD.md`.
- The **Interface Layer** never depends on a business module's public interface directly. It reaches business capability only through the Workflow Layer.
- No layer depends on another layer's internal components. Only public interfaces, as defined in `MODULE_STANDARD.md`, are ever depended upon.

# Public Interface Rules

Every dependency permitted by this model is a dependency on a public interface, never on an internal component. This applies at every layer boundary, not only within a single business module:

- The Workflow Layer depends only on what a business module exposes through its public entry point.
- The Interface Layer depends only on what the Workflow Layer exposes as a composed workflow.
- No layer is granted ad hoc or consumer-specific access to another layer's internals. Access is uniform, per the Visibility Rules in `MODULE_STANDARD.md`.

# Shared Contract Usage

All data that crosses a layer boundary is expressed in Contract Layer types, per the Input Contract and Output Contract rules in `ENGINE_STANDARD.md`. A layer never defines a private type that is passed to another layer, and a layer never accepts a type from another layer that is not defined in the Contract Layer. This is what allows any layer above the Contract Layer to be replaced without forcing a change on the layers around it.

# Cross-Module Communication

Business modules never communicate with one another directly, per the Dependency Rules in `MODULE_STANDARD.md`. When one module's output is needed by another, that data passes exclusively through the Workflow Layer: a step invokes a module's public interface, and the Workflow Layer carries that result forward to the next step. A business module is never aware that another module exists.

# Circular Dependency Prevention

A circular dependency requires at least one dependency edge to point backward against the established order. This model prevents that by construction:

- Dependencies are only ever permitted from a later layer toward an earlier one (see Allowed Dependency Directions).
- Within the Business Module Layer, modules do not depend on each other at all, so no cycle can form between them regardless of how many modules exist.
- Within the Workflow Layer, steps do not depend on each other directly; the Workflow Layer alone determines their sequence, so no step-to-step cycle can form.
- Any proposed dependency that would point from an earlier layer to a later one, or that would connect two peers within the Business Module Layer, is forbidden outright by this document rather than detected after the fact.

# Evolution Guidelines

- Adding a new business module never requires changing an existing business module, because modules do not depend on each other.
- Adding a new step to a workflow never requires changing the business modules it orchestrates, because the Workflow Layer depends only on modules' public interfaces.
- Adding a new interface (an additional way of delivering the platform's capability to an external actor) never requires changing the Workflow Layer or any business module, because the Interface Layer depends downward only, and nothing depends on it.
- A layer's public interface may evolve, but changing what it exposes is a deliberate decision that every layer depending on it must be able to observe — it is never a side effect of an internal change, per the Extension Rules in `MODULE_STANDARD.md`.
- Any change that would require an earlier layer to depend on a later one, or that would require two business modules to depend on each other, is not a permitted evolution of this model. It requires this document to be revised first, and any resulting architectural idea outside current scope is routed to `docs/03_PRODUCT/FUTURE_ROADMAP.md` rather than implemented directly.
