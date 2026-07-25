# Purpose

To define the mandatory internal structure every business module (engine) must follow, so that every module is self-contained, independently replaceable, and consistent in shape regardless of the capability it implements. This document governs internal module organization only. It does not redefine engine lifecycle, contracts, or execution behavior — those are governed by `ENGINE_STANDARD.md`, which this document assumes and does not repeat. Every rule below exists to produce two properties in every module: high cohesion (everything inside a module belongs together and serves that module's single capability) and low coupling (a module's connection to the rest of the system is no wider than its public entry point).

# Folder Structure

- Each module lives in its own isolated location, separate from every other module.
- A module contains exactly one public entry point, through which its entire capability is exposed.
- Everything else inside a module is internal. How it is organized internally is left to that module, as long as it serves the module's own cohesion — this document does not impose one internal layout on every capability, since doing so would itself be an unnecessary coupling.
- A module never contains, embeds, or nests another module.

# Public Interface

- A module exposes exactly one public entry point. There is no second, alternate, or informal way in.
- The public entry point exposes only what the rest of the system is permitted to use. Anything not exposed through it does not exist as far as a consumer is concerned.
- The public entry point exchanges data only in shared contract types, per `ENGINE_STANDARD.md`. It never exposes a module-internal type to a caller.
- A consumer depends only on a module's public entry point. A consumer that needs something the entry point does not expose does not reach around it — the entry point is extended instead.

# Internal Components

- Internal components are the private building blocks a module uses to fulfill its public interface — its logic, its persistence, and anything else its capability requires.
- Internal components are never directly reachable from outside the module, under any circumstance, including by another module that happens to know where they live.
- Internal components may depend on one another freely within the module, provided that internal dependency graph contains no cycles.

# Dependency Rules

- A module depends only on: shared contract types, cross-cutting utilities explicitly designated as safe for every module to use (for example configuration, persistence access, logging), and whatever else its own capability specifically requires.
- A module never depends on another module, directly or indirectly. Modules do not import one another, call one another, or share internal state.
- A module never depends on whatever consumes it (an interface layer, an orchestrator, another caller). Dependency flows one way: consumers depend on modules, never the reverse.
- A module is isolated from any delivery framework or runtime the surrounding system happens to use. Nothing about a module's internal structure may depend on how it is ultimately invoked.
- No circular dependency is permitted anywhere in a module's dependency graph, including indirectly through a shared utility.

# Visibility Rules

- Everything in a module is private by default. Nothing becomes visible outside the module except what the public entry point deliberately exposes.
- A module never grants ad hoc, one-off, or consumer-specific access to an internal component. Every consumer is granted access the same way, through the same entry point.
- Visibility decisions belong to the module itself. No consumer, orchestrator, or interface layer may reach into a module to access something that module has not chosen to expose.

# Naming Rules

- A module's public entry point is named for the capability it exposes, not for its internal implementation.
- Internal component names describe their internal responsibility and are never chosen to imply that they are safe or intended for use outside the module.
- Naming is consistent across every module: the same category of internal component is named the same way wherever it appears, so a reader who understands one module already understands the shape of every other.

# Extension Rules

- New capability is added to a module by extending its internal components and, where needed, its public entry point — never by exposing an internal component to bypass the entry point.
- A module may grow new internal components freely as its capability grows, provided each new component still serves that module's single responsibility. A component that would serve a different responsibility belongs in a new module, not bolted onto an existing one.
- Extending a module never requires a consumer to change how it depends on that module, unless the module's public interface itself intentionally changes.

# Testing Rules

- A module's internal components are structured so each can be verified independently, consistent with the testing rules in `ENGINE_STANDARD.md`.
- Tests exercise a module through its public entry point when verifying the module as a whole; internal components are exercised directly only when verifying them in isolation.
- A module's tests never depend on another module's internals. Where two modules must be verified together, they are exercised only through their public entry points.
