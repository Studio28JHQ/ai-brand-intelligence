import type { Combinator } from '../combinator';
import { metadataQuality } from './metadata-quality';
import { headingStructureQuality } from './heading-structure-quality';
import { contentDepth } from './content-depth';
import { imageAccessibility } from './image-accessibility';
import { structuredDataCoverage } from './structured-data-coverage';
import { indexability } from './indexability';
import { securityPosture } from './security-posture';
import { technicalFoundation } from './technical-foundation';
import { performanceEstimate } from './performance-estimate';
import { internalLinkingHealth } from './internal-linking-health';
import { aiVisibilityReadiness } from './ai-visibility-readiness';

// Every combinator is a pure function tried against whatever Signal pool it's given for this
// invocation; combinators whose required Signals aren't present return null and are skipped.
// This is what lets the same registry serve both the core scope (extraction Signals) and the
// ai-visibility scope (AI Visibility analyzer Signals) without branching on scope explicitly.
export const COMBINATOR_REGISTRY: ReadonlyArray<Combinator> = [
  metadataQuality,
  headingStructureQuality,
  contentDepth,
  imageAccessibility,
  structuredDataCoverage,
  indexability,
  securityPosture,
  technicalFoundation,
  performanceEstimate,
  internalLinkingHealth,
  aiVisibilityReadiness,
];
