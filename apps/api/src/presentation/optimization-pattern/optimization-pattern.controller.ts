import { BadRequestException, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { OptimizationPatternMetadata, PatternDiscoverySummary } from '@ai-visibility/contracts';
import { DiscoverOptimizationPatternsUseCase } from '../../application/optimization-pattern/discover-optimization-patterns.use-case';
import { OptimizationPatternQueryService } from '../../application/optimization-pattern/optimization-pattern-query.service';
import { InvalidateOptimizationPatternUseCase } from '../../application/optimization-pattern/invalidate-optimization-pattern.use-case';
import {
  InvalidPatternStateTransitionError,
  OptimizationPatternNotFoundError,
} from '../../domain/optimization-pattern/optimization-pattern.errors';
import { toOptimizationPatternMetadata } from './optimization-pattern-metadata.mapper';

@Controller('patterns')
export class OptimizationPatternController {
  constructor(
    private readonly discoverOptimizationPatternsUseCase: DiscoverOptimizationPatternsUseCase,
    private readonly optimizationPatternQueryService: OptimizationPatternQueryService,
    private readonly invalidateOptimizationPatternUseCase: InvalidateOptimizationPatternUseCase,
  ) {}

  @Get()
  async list(): Promise<OptimizationPatternMetadata[]> {
    const patterns = await this.optimizationPatternQueryService.list();
    return patterns.map(toOptimizationPatternMetadata);
  }

  @Post('discover')
  async discover(): Promise<PatternDiscoverySummary> {
    return this.discoverOptimizationPatternsUseCase.execute();
  }

  @Post(':id/invalidate')
  async invalidate(@Param('id') id: string): Promise<OptimizationPatternMetadata> {
    try {
      const pattern = await this.invalidateOptimizationPatternUseCase.execute(id);
      return toOptimizationPatternMetadata(pattern);
    } catch (error) {
      if (error instanceof OptimizationPatternNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidPatternStateTransitionError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
