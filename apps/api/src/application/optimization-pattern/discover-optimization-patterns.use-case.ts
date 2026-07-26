import { Inject, Injectable } from '@nestjs/common';
import type { PatternDiscoverySummary } from '@ai-visibility/contracts';
import { OPTIMIZATION_PATTERN_REPOSITORY, OptimizationPatternRepository } from '../../domain/optimization-pattern/optimization-pattern.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { resolveOptimizationRule } from '../optimization-knowledge-base/optimization-knowledge-base';

/**
 * Recomputes every Optimization Pattern from current platform-wide Finding data. Explicitly
 * triggered (`POST /patterns/discover`), not scheduled — this platform has no background job
 * infrastructure, and every other cross-cutting computation (the AI Daily Briefing, Executive
 * Client Report) is likewise generated on demand rather than via automation.
 */
@Injectable()
export class DiscoverOptimizationPatternsUseCase {
  constructor(
    private readonly findingReadRepository: FindingReadRepository,
    @Inject(OPTIMIZATION_PATTERN_REPOSITORY) private readonly patternRepository: OptimizationPatternRepository,
  ) {}

  async execute(): Promise<PatternDiscoverySummary> {
    const aggregates = await this.findingReadRepository.aggregateActionableFindingsByRule();
    const now = new Date();

    let discovered = 0;
    let updated = 0;
    let skippedInvalidated = 0;

    for (const aggregate of aggregates) {
      const rule = resolveOptimizationRule(aggregate.ruleId);
      if (!rule) {
        continue;
      }

      const existing = await this.patternRepository.findByRuleId(aggregate.ruleId);

      if (!existing) {
        await this.patternRepository.create(
          aggregate.ruleId,
          rule.category,
          aggregate.occurrenceCount,
          aggregate.distinctProjectCount,
          now,
        );
        discovered++;
        continue;
      }

      if (existing.status === 'invalidated') {
        skippedInvalidated++;
        continue;
      }

      await this.patternRepository.recompute(existing.id, aggregate.occurrenceCount, aggregate.distinctProjectCount, now);
      updated++;
    }

    return { discovered, updated, skippedInvalidated };
  }
}
