import { OptimizationPattern } from './optimization-pattern.entity';

export const OPTIMIZATION_PATTERN_REPOSITORY = Symbol('OPTIMIZATION_PATTERN_REPOSITORY');

export interface OptimizationPatternRepository {
  findById(id: string): Promise<OptimizationPattern | null>;
  findByRuleId(optimizationRuleId: string): Promise<OptimizationPattern | null>;
  findAll(): Promise<OptimizationPattern[]>;
  findAllActive(): Promise<OptimizationPattern[]>;
  create(
    optimizationRuleId: string,
    category: string,
    occurrenceCount: number,
    distinctProjectCount: number,
    now: Date,
  ): Promise<OptimizationPattern>;
  recompute(id: string, occurrenceCount: number, distinctProjectCount: number, now: Date): Promise<OptimizationPattern>;
  invalidate(id: string, now: Date): Promise<OptimizationPattern>;
}
