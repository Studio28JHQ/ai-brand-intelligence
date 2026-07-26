import { Module } from '@nestjs/common';
import { DiscoverOptimizationPatternsUseCase } from '../../application/optimization-pattern/discover-optimization-patterns.use-case';
import { OptimizationPatternQueryService } from '../../application/optimization-pattern/optimization-pattern-query.service';
import { InvalidateOptimizationPatternUseCase } from '../../application/optimization-pattern/invalidate-optimization-pattern.use-case';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { OptimizationPatternRepositoryModule } from '../../infrastructure/optimization-pattern/optimization-pattern-repository.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { OptimizationPatternController } from './optimization-pattern.controller';

@Module({
  imports: [DatabaseModule, OptimizationPatternRepositoryModule],
  controllers: [OptimizationPatternController],
  providers: [
    DiscoverOptimizationPatternsUseCase,
    OptimizationPatternQueryService,
    InvalidateOptimizationPatternUseCase,
    FindingReadRepository,
  ],
  exports: [OptimizationPatternQueryService],
})
export class OptimizationPatternModule {}
