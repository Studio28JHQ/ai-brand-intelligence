import { RuleRegistry } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { createEngineExecutionRule } from './engine-execution.rule';
import { createMetadataQualityRule } from './heuristics/metadata-quality.rule';
import { createHeadingStructureRule } from './heuristics/heading-structure.rule';
import { createContentDepthRule } from './heuristics/content-depth.rule';
import { createImageAccessibilityRule } from './heuristics/image-accessibility.rule';
import { createStructuredDataRule } from './heuristics/structured-data.rule';
import { createIndexabilityRule } from './heuristics/indexability.rule';
import { createSecurityPostureRule } from './heuristics/security-posture.rule';
import { createTechnicalFoundationRule } from './heuristics/technical-foundation.rule';
import { createPerformanceEstimateRule } from './heuristics/performance-estimate.rule';
import { createInternalLinkingRule } from './heuristics/internal-linking.rule';
import { createAiVisibilityReadinessRule } from './heuristics/ai-visibility-readiness.rule';

export type AnalysisScope = 'core' | 'ai-visibility';

function buildCoreRuleRegistry(): RuleRegistry<WorkflowResult> {
  const registry = new RuleRegistry<WorkflowResult>();

  registry.register(createEngineExecutionRule('discovery'));
  registry.register(createEngineExecutionRule('crawl'));
  registry.register(createEngineExecutionRule('inventory'));
  registry.register(createMetadataQualityRule());
  registry.register(createHeadingStructureRule());
  registry.register(createContentDepthRule());
  registry.register(createImageAccessibilityRule());
  registry.register(createStructuredDataRule());
  registry.register(createIndexabilityRule());
  registry.register(createSecurityPostureRule());
  registry.register(createTechnicalFoundationRule());
  registry.register(createPerformanceEstimateRule());
  registry.register(createInternalLinkingRule());

  return registry;
}

function buildAiVisibilityRuleRegistry(): RuleRegistry<WorkflowResult> {
  const registry = new RuleRegistry<WorkflowResult>();

  registry.register(createAiVisibilityReadinessRule());

  return registry;
}

export function buildRuleRegistry(scope: AnalysisScope): RuleRegistry<WorkflowResult> {
  return scope === 'core' ? buildCoreRuleRegistry() : buildAiVisibilityRuleRegistry();
}
