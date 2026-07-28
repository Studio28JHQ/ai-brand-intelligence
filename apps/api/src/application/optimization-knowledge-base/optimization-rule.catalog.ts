import type { OptimizationRuleDefinition } from './optimization-rule';

const PUBLISHED_AT = '2026-07-26T00:00:00.000Z';

export const OPTIMIZATION_RULE_CATALOG: OptimizationRuleDefinition[] = [
  {
    ruleId: 'discovery-execution',
    enabled: true,
    versions: [
      {
        ruleId: 'discovery-execution',
        version: '1.0.0',
        category: 'execution',
        severity: 'high',
        expectedImpact: 'high',
        evidenceReferences: ['engineResult.status'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'crawl-execution',
    enabled: true,
    versions: [
      {
        ruleId: 'crawl-execution',
        version: '1.0.0',
        category: 'execution',
        severity: 'high',
        expectedImpact: 'high',
        evidenceReferences: ['engineResult.status'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'inventory-execution',
    enabled: true,
    versions: [
      {
        ruleId: 'inventory-execution',
        version: '1.0.0',
        category: 'execution',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['engineResult.status'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-metadata-quality',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-metadata-quality',
        version: '1.0.0',
        category: 'seo',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['titleBand', 'titleLength', 'descriptionBand', 'descriptionLength'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-heading-structure',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-heading-structure',
        version: '1.0.0',
        category: 'accessibility',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['h1Count', 'hasSingleH1', 'hierarchyValid', 'emptyHeadingCount'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-content-depth',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-content-depth',
        version: '1.0.0',
        category: 'content',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['wordCount', 'band'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-image-accessibility',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-image-accessibility',
        version: '1.0.0',
        category: 'accessibility',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['totalImages', 'missingAltCount', 'emptyAltCount', 'altCoverageRatio', 'band'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-structured-data',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-structured-data',
        version: '1.0.0',
        category: 'seo',
        severity: 'low',
        expectedImpact: 'low',
        evidenceReferences: ['hasJsonLd', 'jsonLdValid', 'hasOpenGraph', 'hasTwitterCard', 'coverageBand'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-indexability',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-indexability',
        version: '1.0.0',
        category: 'seo',
        severity: 'high',
        expectedImpact: 'high',
        evidenceReferences: ['isIndexable', 'blockers'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-security-posture',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-security-posture',
        version: '1.0.0',
        category: 'technical',
        severity: 'high',
        expectedImpact: 'high',
        evidenceReferences: ['isSecure', 'isHttps', 'mixedContentCount'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-technical-foundation',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-technical-foundation',
        version: '1.0.0',
        category: 'technical',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['hasRobotsTxt', 'hasSitemap', 'urlLength', 'urlLengthBand'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-performance-estimate',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-performance-estimate',
        version: '1.0.0',
        category: 'performance',
        severity: 'medium',
        expectedImpact: 'medium',
        evidenceReferences: ['estimatedPerformanceScore', 'coreWebVitalsEstimate'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'seo-internal-linking',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-internal-linking',
        version: '1.0.0',
        category: 'seo',
        severity: 'low',
        expectedImpact: 'low',
        evidenceReferences: ['internalLinkCount', 'band'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
  {
    ruleId: 'ai-visibility-readiness',
    enabled: true,
    versions: [
      {
        ruleId: 'ai-visibility-readiness',
        version: '1.0.0',
        category: 'ai-visibility',
        severity: 'high',
        expectedImpact: 'high',
        evidenceReferences: ['status', 'graphCompleteness', 'entityCoverage', 'relationshipCoverage'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
];
