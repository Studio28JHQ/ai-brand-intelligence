import { Module } from '@nestjs/common';
import { OptimizationCycleRepositoryModule } from '../../infrastructure/optimization-cycle/optimization-cycle-repository.module';
import { OptimizationCycleQueryService } from '../../application/optimization-cycle/optimization-cycle-query.service';
import { TransitionCycleStatusUseCase } from '../../application/optimization-cycle/transition-cycle-status.use-case';
import { ProjectModule } from '../project/project.module';
import { OptimizationCycleController } from './optimization-cycle.controller';

@Module({
  imports: [OptimizationCycleRepositoryModule, ProjectModule],
  controllers: [OptimizationCycleController],
  providers: [OptimizationCycleQueryService, TransitionCycleStatusUseCase],
})
export class OptimizationCycleModule {}
