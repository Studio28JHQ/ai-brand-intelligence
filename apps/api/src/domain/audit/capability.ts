import type { WorkflowStep } from '@ai-visibility/core';

export interface Capability {
  readonly id: string;
  readonly step: WorkflowStep;
}

export function toCapability(step: WorkflowStep): Capability {
  return { id: step.name, step };
}
