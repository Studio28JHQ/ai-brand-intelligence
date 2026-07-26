import { Inject, Injectable } from '@nestjs/common';
import type { PatternReference } from '@ai-visibility/contracts';
import { OPTIMIZATION_PATTERN_REPOSITORY, OptimizationPatternRepository } from '../../domain/optimization-pattern/optimization-pattern.repository';
import { OptimizationPattern } from '../../domain/optimization-pattern/optimization-pattern.entity';

function toPatternReference(pattern: OptimizationPattern): PatternReference {
  return {
    patternId: pattern.id,
    optimizationRuleId: pattern.optimizationRuleId,
    confidence: pattern.confidence,
    occurrenceCount: pattern.occurrenceCount,
    distinctProjectCount: pattern.distinctProjectCount,
  };
}

@Injectable()
export class OptimizationPatternQueryService {
  constructor(@Inject(OPTIMIZATION_PATTERN_REPOSITORY) private readonly patternRepository: OptimizationPatternRepository) {}

  async list(): Promise<OptimizationPattern[]> {
    return this.patternRepository.findAll();
  }

  /**
   * Only 'active' (recurring, cross-Project) Patterns are eligible to be referenced by a
   * recommendation — 'candidate' Patterns haven't recurred enough to be a meaningful claim yet,
   * and 'invalidated' ones have been deliberately retired.
   */
  async findActivePatternsByRuleId(): Promise<ReadonlyMap<string, PatternReference>> {
    const activePatterns = await this.patternRepository.findAllActive();
    return new Map(activePatterns.map((pattern) => [pattern.optimizationRuleId, toPatternReference(pattern)]));
  }
}
