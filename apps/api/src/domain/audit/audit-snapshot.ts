import type { AiVisibilityAssessment, Entity, Finding, KnowledgeGraphResult, WorkflowResult } from '@ai-visibility/contracts';
import { Audit } from './audit.entity';

export interface AuditSnapshotProps {
  audit: Audit;
  engineResults: WorkflowResult;
  findings: Finding[];
  entities: Entity[];
  knowledgeGraph: KnowledgeGraphResult;
  aiVisibility: AiVisibilityAssessment;
}

export class AuditSnapshot {
  private constructor(
    public readonly audit: Audit,
    public readonly engineResults: WorkflowResult,
    public readonly findings: ReadonlyArray<Finding>,
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
      props.findings,
      props.entities,
      props.knowledgeGraph,
      props.aiVisibility,
    );
  }
}
