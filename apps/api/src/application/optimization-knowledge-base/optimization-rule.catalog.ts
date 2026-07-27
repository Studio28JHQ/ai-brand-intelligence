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
        title: 'Resolve discovery execution issue',
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
        title: 'Resolve crawl execution issue',
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
        title: 'Resolve inventory execution issue',
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
  {
    ruleId: 'seo-metadata-quality',
    enabled: true,
    versions: [
      {
        ruleId: 'seo-metadata-quality',
        version: '1.0.0',
        category: 'seo',
        severity: 'medium',
        title: 'Fix missing or poorly-sized title and meta description',
        businessRationale:
          'The title and meta description are the primary text search engines and AI systems use to summarize and represent this page. A missing or badly-sized title/description directly weakens both click-through in search and how accurately AI systems can describe the page.',
        resolutionStrategy:
          'Write a unique title between 30 and 60 characters and a meta description between 70 and 160 characters that both accurately summarize the page content.',
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
        title: 'Fix heading structure',
        businessRationale:
          'A page needs exactly one H1 and a heading hierarchy that never skips a level for screen readers and AI systems to correctly parse its outline. Missing, duplicated, or empty headings make the page structure ambiguous to both audiences.',
        resolutionStrategy:
          'Use exactly one H1 per page, avoid skipping heading levels (e.g. H2 straight to H4), and remove or fill any empty heading tags.',
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
        title: 'Expand thin page content',
        businessRationale:
          'Pages with very little body text give search engines and AI systems too little signal to understand what the page is about, reducing both ranking potential and the odds of being cited accurately.',
        resolutionStrategy: 'Expand the page content to at least 300 words of genuinely useful, on-topic text.',
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
        title: 'Add missing image alt text',
        businessRationale:
          'Images without alt text are invisible to screen readers and to search/AI systems that rely on alt text to understand image content, harming both accessibility compliance and image-related discovery.',
        resolutionStrategy: 'Add descriptive alt text to every content image; use alt="" only for genuinely decorative images.',
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
        title: 'Add structured data and social preview tags',
        businessRationale:
          'JSON-LD, OpenGraph, and Twitter Card tags are how search engines and AI systems reliably identify entities, page type, and social preview content on this page. Without them, the page relies entirely on unstructured text inference.',
        resolutionStrategy: 'Add valid JSON-LD structured data for the page type, plus OpenGraph and Twitter Card meta tags.',
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
        title: 'Remove indexability blockers',
        businessRationale:
          'A page blocked from indexing (via HTTP status, meta robots, X-Robots-Tag, or a canonical pointing elsewhere) cannot appear in search results or be recommended by AI systems at all, regardless of how good its content is.',
        resolutionStrategy:
          'Ensure the page returns a 2xx status, does not carry a noindex directive, and its canonical tag is self-referencing (or intentionally points to the correct canonical page).',
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
        title: 'Serve the page securely over HTTPS with no mixed content',
        businessRationale:
          'Browsers actively warn users off insecure pages and mixed-content resources, and search engines factor HTTPS into ranking. An insecure page damages both trust and visibility.',
        resolutionStrategy: 'Serve the page over HTTPS and update any remaining http:// resource references to https://.',
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
        title: 'Add robots.txt/sitemap.xml and shorten long URLs',
        businessRationale:
          'robots.txt and sitemap.xml are how search engines efficiently discover and crawl a site, and overly long URLs are harder to share, index, and reason about. Missing either weakens overall crawlability.',
        resolutionStrategy: 'Publish a robots.txt and a sitemap.xml at the site root, and keep URLs reasonably short and descriptive.',
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
        title: 'Improve estimated page performance',
        businessRationale:
          'Heavy HTML, large DOMs, and render-blocking scripts slow down page load, which harms both user experience and search ranking signals tied to Core Web Vitals.',
        resolutionStrategy:
          'Reduce HTML/DOM size where possible, and mark non-critical scripts async/defer to reduce render-blocking JavaScript.',
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
        title: 'Add internal links to this page',
        businessRationale:
          'A page with no internal links pointing to it is harder for search engines to discover and rank, and signals weak site architecture around this content.',
        resolutionStrategy: 'Link to this page from at least a few other relevant pages on the site.',
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
        title: 'Improve AI Visibility readiness',
        businessRationale:
          'AI systems reason about a brand through the entities and relationships it can extract from a page. Incomplete entity or relationship coverage means AI systems have too little structured signal to represent this page accurately.',
        resolutionStrategy:
          'Strengthen the page\'s entity signals (organization name, domain, clear relationships between them) so the Knowledge Graph built from this page is complete.',
        expectedImpact: 'high',
        evidenceReferences: ['status', 'graphCompleteness', 'entityCoverage', 'relationshipCoverage'],
        publishedAt: PUBLISHED_AT,
      },
    ],
  },
];
