import { Module } from '@nestjs/common';
import { OPTIMIZATION_CYCLE_REPOSITORY } from '../../domain/optimization-cycle/optimization-cycle.repository';
import { PrismaOptimizationCycleRepository } from './prisma-optimization-cycle.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: OPTIMIZATION_CYCLE_REPOSITORY, useClass: PrismaOptimizationCycleRepository }],
  exports: [OPTIMIZATION_CYCLE_REPOSITORY],
})
export class OptimizationCycleRepositoryModule {}
