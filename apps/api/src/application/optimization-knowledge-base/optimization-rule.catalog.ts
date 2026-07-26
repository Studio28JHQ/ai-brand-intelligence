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
        businessRationale:
          "Discovery establishes the normalized URL and resource detection every later pipeline stage depends on; if it fails, no other AI Visibility signal can be produced for this Project.",
        resolutionStrategy:
          'Verify the target URL is reachable and resolves correctly, then re-run the audit.',
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
        businessRationale:
          'Crawling fetches the page content that inventory, entity extraction, and every downstream AI Visibility signal are built from.',
        resolutionStrategy:
          'Confirm the page returns a successful HTTP response and is not blocked by robots.txt or authentication, then re-run the audit.',
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
        businessRationale:
          'Inventory extracts the on-page structural signals used for entity and knowledge graph construction.',
        resolutionStrategy:
          'Verify the crawled HTML is well-formed and contains extractable structural elements, then re-run the audit.',
        expectedImpact: 'medium',
        evidenceReferences: ['engineResult.status'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
];
