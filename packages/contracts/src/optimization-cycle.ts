export type CycleStatus = 'planned' | 'running' | 'verification' | 'completed';

export interface OptimizationCycleMetadata {
  id: string;
  projectId: string;
  goal: string;
  status: CycleStatus;
  currentPhase: CycleStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}
