import { Inject, Injectable } from '@nestjs/common';
import { OPTIMIZATION_PATTERN_REPOSITORY, OptimizationPatternRepository } from '../../domain/optimization-pattern/optimization-pattern.repository';
import { OptimizationPattern } from '../../domain/optimization-pattern/optimization-pattern.entity';

@Injectable()
export class InvalidateOptimizationPatternUseCase {
  constructor(@Inject(OPTIMIZATION_PATTERN_REPOSITORY) private readonly patternRepository: OptimizationPatternRepository) {}

  async execute(id: string): Promise<OptimizationPattern> {
    return this.patternRepository.invalidate(id, new Date());
  }
}
