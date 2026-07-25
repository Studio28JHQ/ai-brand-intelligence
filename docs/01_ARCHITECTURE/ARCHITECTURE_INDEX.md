# Purpose

To act as the single entry point for all approved architecture documentation. Any task that requires architecture context loads documents through this index rather than by referencing an architecture document directly. This index does not define or redefine any standard; it only lists, orders, and describes what already exists elsewhere.

# How To Use This Index

Read the listed documents in the order given below. Each document assumes the ones before it and does not repeat their content, so reading out of order will surface references to concepts not yet introduced. Load only the documents a given task's classification actually requires, per `CLAUDE.md`'s Document Loading Policy — this index is how those documents are found, not an instruction to load all of them for every task.

# Reading Order

1. `ENGINE_STANDARD.md` — Normative — Defines the contract, lifecycle, responsibilities, and boundaries every business engine must implement.
2. `MODULE_STANDARD.md` — Normative — Defines the mandatory internal structure every business module must follow.
3. `DEPENDENCY_MODEL.md` — Normative — Defines the platform's architectural layers and which dependency directions between them are allowed and forbidden.
4. `ENGINE_EXECUTION_STANDARD.md` — Normative — Defines the standard sequence of execution phases every business engine invocation follows.

# Document Status

All four documents listed above are **normative**: each is mandatory and binding on the work it governs. This index itself is **informative**: it is a navigation aid, not a standard, and imposes no rule of its own.
