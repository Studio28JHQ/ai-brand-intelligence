import type { AnalysisSignal, Heuristic } from '@ai-visibility/contracts';

// A Combinator reads whatever Signals it needs from the pool it's given and produces one
// Heuristic, or null if the Signals it depends on aren't present (e.g. a core combinator run
// against the ai-visibility-scope Signal pool, or vice versa).
export type Combinator = (signals: ReadonlyArray<AnalysisSignal>) => Heuristic | null;
