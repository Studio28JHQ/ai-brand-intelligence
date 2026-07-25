import type {
  AiVisibilityAssessment,
  Entity,
  Finding,
  KnowledgeGraphResult,
  WorkflowExecutionRecord,
  WorkflowProgress,
  WorkflowResult,
} from '@ai-visibility/contracts';
import { Audit } from './audit.entity';

export interface AuditSnapshotProps {
  audit: Audit;
  engineResults: WorkflowResult;
  progress: WorkflowProgress[];
  history: WorkflowExecutionRecord[];
  findings: Finding[];
  ruleSetVersion: string;
  entities: Entity[];
  knowledgeGraph: KnowledgeGraphResult;
  aiVisibility: AiVisibilityAssessment;
}

export class AuditSnapshot {
  private constructor(
    public readonly audit: Audit,
    public readonly engineResults: WorkflowResult,
    public readonly progress: ReadonlyArray<WorkflowProgress>,
    public readonly history: ReadonlyArray<WorkflowExecutionRecord>,
    public readonly findings: ReadonlyArray<Finding>,
    public readonly ruleSetVersion: string,
    public readonly entities: ReadonlyArray<Entity>,
    public readonly knowledgeGraph: KnowledgeGraphResult,
    public readonly aiVisibility: AiVisibilityAssessment,
  ) {
    Object.freeze(this);
  }

  static create(props: AuditSnapshotProps): AuditSnapshot {
    return new AuditSnapshot(
      props.audit,
      props.engineResults,
      props.progress,
      props.history,
      props.findings,
      props.ruleSetVersion,
      props.entities,
      props.knowledgeGraph,
      props.aiVisibility,
    );
  }
}
