import { CapabilityCatalog } from './capability-catalog';

export function buildFullAuditCapabilityCatalog(): CapabilityCatalog {
  const catalog = new CapabilityCatalog();

  catalog.register(
    {
      id: 'site-discovery',
      name: 'Site Discovery',
      description: 'Locates and normalizes the audited website and its key resources.',
    },
    'discovery',
  );
  catalog.register(
    {
      id: 'page-crawling',
      name: 'Page Crawling',
      description: 'Retrieves the audited page content.',
    },
    'crawl',
  );
  catalog.register(
    {
      id: 'content-inventory',
      name: 'Content Inventory',
      description: 'Extracts structural and metadata facts about the page.',
    },
    'inventory',
  );
  catalog.register(
    {
      id: 'page-extraction',
      name: 'Page Extraction',
      description: 'Runs pluggable analyzers over the crawled page and produces normalized Signals.',
    },
    'extraction',
  );
  catalog.register(
    {
      id: 'core-heuristics',
      name: 'Core Heuristics',
      description: 'Combines page-level Signals into judgment-ready Heuristics.',
    },
    'heuristics',
  );
  catalog.register(
    {
      id: 'rule-analysis',
      name: 'Rule Analysis',
      description: 'Evaluates audit rules and produces normalized findings.',
    },
    'analysis',
  );
  catalog.register(
    {
      id: 'entity-extraction',
      name: 'Entity Extraction',
      description: 'Identifies named entities referenced by the page.',
    },
    'entity',
  );
  catalog.register(
    {
      id: 'knowledge-graph',
      name: 'Knowledge Graph',
      description: 'Builds a graph of entities and relationships found on the page.',
    },
    'knowledgeGraph',
  );
  catalog.register(
    {
      id: 'ai-visibility-assessment',
      name: 'AI Visibility Assessment',
      description: 'Assesses how well the site can be understood by AI systems.',
    },
    'aiVisibility',
  );
  catalog.register(
    {
      id: 'ai-visibility-heuristics',
      name: 'AI Visibility Heuristics',
      description: 'Combines the AI Visibility analyzer Signals into judgment-ready Heuristics.',
    },
    'aiVisibilityHeuristics',
  );
  catalog.register(
    {
      id: 'ai-visibility-rule-analysis',
      name: 'AI Visibility Rule Analysis',
      description: 'Evaluates AI Visibility rules and merges the resulting findings into the audit.',
    },
    'aiVisibilityAnalysis',
  );

  return catalog;
}
