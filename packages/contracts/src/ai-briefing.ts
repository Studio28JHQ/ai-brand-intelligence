import type { OptimizationLevel } from './optimization-plan';

export type BriefingItemCategory =
  | 'project-attention'
  | 'critical-finding'
  | 'campaign-awaiting-verification'
  | 'ai-visibility-regression'
  | 'high-impact-opportunity'
  | 'recent-improvement';

export interface BriefingEvidenceFact {
  label: string;
  value: string;
}

export interface BriefingItem {
  id: string;
  category: BriefingItemCategory;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  title: string;
  reason: string;
  businessImpact: string;
  evidence: BriefingEvidenceFact[];
  recommendedNextAction: string;
  confidence: OptimizationLevel;
}

export interface BriefingModel {
  briefingVersion: string;
  generatedAt: string;
  projectsSummarized: number;
  items: BriefingItem[];
}
