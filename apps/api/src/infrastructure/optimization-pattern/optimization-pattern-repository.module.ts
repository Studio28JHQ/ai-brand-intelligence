import { Module } from '@nestjs/common';
import { OPTIMIZATION_PATTERN_REPOSITORY } from '../../domain/optimization-pattern/optimization-pattern.repository';
import { PrismaOptimizationPatternRepository } from './prisma-optimization-pattern.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: OPTIMIZATION_PATTERN_REPOSITORY, useClass: PrismaOptimizationPatternRepository }],
  exports: [OPTIMIZATION_PATTERN_REPOSITORY],
})
export class OptimizationPatternRepositoryModule {}
