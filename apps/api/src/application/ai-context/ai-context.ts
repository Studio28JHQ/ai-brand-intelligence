import type {
  CampaignMetadata,
  ClientMetadata,
  Finding,
  ImpactAssessment,
  KnowledgeGraphResult,
  OptimizationItem,
  ProjectMetadata,
  VisibilityStatus,
  AuditStatus,
} from '@ai-visibility/contracts';
import type { OptimizationRuleVersion } from '../optimization-knowledge-base/optimization-rule';

export const AI_CONTEXT_VERSION = '1.0.0';

export interface AiAuditFact {
  id: string;
  url: string;
  status: AuditStatus;
  startedAt: string | null;
  completedAt: string | null;
  aiVisibilityStatus: VisibilityStatus | null;
}

export interface AiBaselineFact {
  auditId: string | null;
  setAt: string | null;
}

export interface AiContext {
  contextVersion: string;
  generatedAt: string;
  project: ProjectMetadata;
  client: ClientMetadata;
  latestAudit: AiAuditFact | null;
  baseline: AiBaselineFact;
  knowledgeGraph: KnowledgeGraphResult;
  findings: Finding[];
  optimizationPlan: OptimizationItem[];
  optimizationCampaign: CampaignMetadata | null;
  impactAssessment: ImpactAssessment | null;
  optimizationRules: OptimizationRuleVersion[];
}
