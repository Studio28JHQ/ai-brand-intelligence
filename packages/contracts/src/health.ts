export interface HealthResponse {
  status: 'ok';
}

export type DependencyStatus = 'up' | 'down';

export interface DependencyCheck {
  status: DependencyStatus;
  message?: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not-ready';
  version: string;
  dependencies: {
    database: DependencyCheck;
    redis: DependencyCheck;
    objectStorage: DependencyCheck;
  };
  workflowRuntime: DependencyCheck;
}
