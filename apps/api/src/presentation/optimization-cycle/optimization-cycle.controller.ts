import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { ExecutiveClientReport, OptimizationCycleMetadata } from '@ai-visibility/contracts';
import { OptimizationCycleQueryService } from '../../application/optimization-cycle/optimization-cycle-query.service';
import { TransitionCycleStatusUseCase } from '../../application/optimization-cycle/transition-cycle-status.use-case';
import { ExecutiveClientReportBuilderService } from '../../application/executive-client-report/executive-client-report-builder.service';
import {
  InvalidCycleStateTransitionError,
  OptimizationCycleNotFoundError,
} from '../../domain/optimization-cycle/optimization-cycle.errors';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';
import { TransitionCycleStatusDto } from './dto/transition-cycle-status.dto';
import { toOptimizationCycleMetadata } from './optimization-cycle-metadata.mapper';

@Controller('cycles')
export class OptimizationCycleController {
  constructor(
    private readonly optimizationCycleQueryService: OptimizationCycleQueryService,
    private readonly transitionCycleStatusUseCase: TransitionCycleStatusUseCase,
    private readonly executiveClientReportBuilderService: ExecutiveClientReportBuilderService,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<OptimizationCycleMetadata> {
    const cycle = await this.optimizationCycleQueryService.getById(id);
    if (!cycle) {
      throw new NotFoundException(`Optimization cycle not found: ${id}`);
    }
    return toOptimizationCycleMetadata(cycle);
  }

  @Get(':id/report')
  async getExecutiveClientReport(@Param('id') id: string): Promise<ExecutiveClientReport> {
    try {
      return await this.executiveClientReportBuilderService.build(id);
    } catch (error) {
      if (error instanceof OptimizationCycleNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/status')
  async transitionStatus(
    @Param('id') id: string,
    @Body() dto: TransitionCycleStatusDto,
  ): Promise<OptimizationCycleMetadata> {
    try {
      const cycle = await this.transitionTo(id, dto?.status);
      return toOptimizationCycleMetadata(cycle);
    } catch (error) {
      if (error instanceof OptimizationCycleNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidCycleStateTransitionError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private transitionTo(id: string, status: TransitionCycleStatusDto['status']): Promise<OptimizationCycle> {
    if (status === 'running') {
      return this.transitionCycleStatusUseCase.start(id);
    }
    if (status === 'verification') {
      return this.transitionCycleStatusUseCase.beginVerification(id);
    }
    if (status === 'completed') {
      return this.transitionCycleStatusUseCase.complete(id);
    }
    throw new BadRequestException(`Unsupported cycle status: ${status}`);
  }
}
