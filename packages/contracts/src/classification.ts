export type ImpactClassification = 'no-impact' | 'impact';

export interface FindingClassification {
  id: string;
  findingId: string;
  auditId: string;
  classification: ImpactClassification;
  rationale: string;
}

export interface ClassificationResult {
  classifications: FindingClassification[];
}

export interface FindingClassificationSummary {
  findingId: string;
  classification: ImpactClassification;
  rationale: string;
}

export interface ClassificationSummary {
  classifications: FindingClassificationSummary[];
}
