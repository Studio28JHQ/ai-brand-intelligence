import type { RuleOutcome } from './analysis';
import type { EntityType, EntitySourceLocation } from './entity';
import type { VisibilityStatus, CompletenessLevel, CoverageLevel } from './ai-visibility';

export interface FindingComparisonEntry {
  ruleId: string;
  ruleVersion: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
}

export interface FindingComparison {
  newFindings: FindingComparisonEntry[];
  resolvedFindings: FindingComparisonEntry[];
  unchangedFindings: FindingComparisonEntry[];
}

export interface EntityComparisonEntry {
  name: string;
  type: EntityType;
  sourceLocation: EntitySourceLocation;
}

export interface EntityComparison {
  added: EntityComparisonEntry[];
  removed: EntityComparisonEntry[];
  unchanged: EntityComparisonEntry[];
}

export interface AiVisibilityComparison {
  baselineStatus: VisibilityStatus;
  targetStatus: VisibilityStatus;
  statusChanged: boolean;
  baselineGraphCompleteness: CompletenessLevel;
  targetGraphCompleteness: CompletenessLevel;
  baselineEntityCoverage: CoverageLevel;
  targetEntityCoverage: CoverageLevel;
  baselineRelationshipCoverage: CoverageLevel;
  targetRelationshipCoverage: CoverageLevel;
  newMissingSignals: string[];
  resolvedMissingSignals: string[];
}

export interface AuditComparisonResult {
  baselineAuditId: string;
  targetAuditId: string;
  findings: FindingComparison;
  entities: EntityComparison;
  aiVisibility: AiVisibilityComparison;
}
