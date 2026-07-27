import type { Heuristic, WorkflowResult } from '@ai-visibility/contracts';

function heuristicsFrom(workflowResult: WorkflowResult, engine: string): Heuristic[] {
  const output = workflowResult[engine]?.output as { heuristics?: Heuristic[] } | undefined;
  return output?.heuristics ?? [];
}

export function findCoreHeuristic(workflowResult: WorkflowResult, key: string): Heuristic | undefined {
  return heuristicsFrom(workflowResult, 'heuristics').find((heuristic) => heuristic.key === key);
}

export function findAiVisibilityHeuristic(workflowResult: WorkflowResult, key: string): Heuristic | undefined {
  return heuristicsFrom(workflowResult, 'aiVisibilityHeuristics').find((heuristic) => heuristic.key === key);
}
