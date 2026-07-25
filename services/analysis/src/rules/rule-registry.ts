import { RuleRegistry } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { createEngineExecutionRule } from './engine-execution.rule';

export function buildRuleRegistry(): RuleRegistry<WorkflowResult> {
  const registry = new RuleRegistry<WorkflowResult>();

  registry.register(createEngineExecutionRule('discovery'));
  registry.register(createEngineExecutionRule('crawl'));
  registry.register(createEngineExecutionRule('inventory'));

  return registry;
}
