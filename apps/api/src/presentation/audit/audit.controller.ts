import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  MessageEvent,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Sse,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import type {
  AuditAnalysisView,
  AuditComparisonResult,
  AuditHistoryEntry,
  AuditMetadata,
  AuditProgressEvent,
  CreateAuditResponse,
  PageComparisonResult,
} from '@ai-visibility/contracts';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { AuditQueryService } from '../../application/audit/audit-query.service';
import { AuditAnalysisQueryService } from '../../application/audit/audit-analysis-query.service';
import { AuditHistoryQueryService } from '../../application/audit/audit-history-query.service';
import { DeleteAuditUseCase } from '../../application/audit/delete-audit.use-case';
import { AuditComparisonService } from '../../application/comparison/audit-comparison.service';
import { PageComparisonService } from '../../application/page-audit/page-comparison.service';
import {
  InvalidAuditUrlError,
  AuditInProgressError,
  AuditNotFoundError,
  AuditNotCompletedError,
  BaselineDeletionRequiresConfirmationError,
  DuplicateAuditExecutionError,
  PageComparisonUrlMismatchError,
} from '../../domain/audit/audit.errors';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { AuditProgressPublisher, isTerminalAuditStatus } from '../../infrastructure/audit/audit-progress-publisher';
import { SkipTimeout } from '../../shared/decorators/skip-timeout.decorator';
import { CreateAuditDto } from './dto/create-audit.dto';
import { toAuditMetadata } from './audit-metadata.mapper';

@Controller('audits')
export class AuditController {
  constructor(
    private readonly createAuditUseCase: CreateAuditUseCase,
    private readonly auditQueryService: AuditQueryService,
    private readonly auditAnalysisQueryService: AuditAnalysisQueryService,
    private readonly auditHistoryQueryService: AuditHistoryQueryService,
    private readonly deleteAuditUseCase: DeleteAuditUseCase,
    private readonly auditComparisonService: AuditComparisonService,
    private readonly pageComparisonService: PageComparisonService,
    private readonly progressPublisher: AuditProgressPublisher,
  ) {}

  @Get()
  async list(): Promise<AuditMetadata[]> {
    const audits = await this.auditQueryService.list();
    return audits.map(toAuditMetadata);
  }

  @Get('history')
  async history(): Promise<AuditHistoryEntry[]> {
    return this.auditHistoryQueryService.list();
  }

  @Get('latest')
  async latest(): Promise<AuditMetadata> {
    const audit = await this.auditQueryService.getLatest();
    if (!audit) {
      throw new NotFoundException('No audits found');
    }
    return toAuditMetadata(audit);
  }

  @Get('compare')
  async compare(
    @Query('baselineAuditId') baselineAuditId: string,
    @Query('targetAuditId') targetAuditId: string,
  ): Promise<AuditComparisonResult> {
    if (typeof baselineAuditId !== 'string' || baselineAuditId.trim().length === 0) {
      throw new BadRequestException('baselineAuditId is required');
    }
    if (typeof targetAuditId !== 'string' || targetAuditId.trim().length === 0) {
      throw new BadRequestException('targetAuditId is required');
    }

    try {
      return await this.auditComparisonService.compare(baselineAuditId, targetAuditId);
    } catch (error) {
      if (error instanceof AuditNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AuditNotCompletedError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('compare/page')
  async comparePage(
    @Query('baselineAuditId') baselineAuditId: string,
    @Query('targetAuditId') targetAuditId: string,
  ): Promise<PageComparisonResult> {
    if (typeof baselineAuditId !== 'string' || baselineAuditId.trim().length === 0) {
      throw new BadRequestException('baselineAuditId is required');
    }
    if (typeof targetAuditId !== 'string' || targetAuditId.trim().length === 0) {
      throw new BadRequestException('targetAuditId is required');
    }

    try {
      return await this.pageComparisonService.compare(baselineAuditId, targetAuditId);
    } catch (error) {
      if (error instanceof AuditNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AuditNotCompletedError || error instanceof PageComparisonUrlMismatchError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<AuditMetadata> {
    const audit = await this.auditQueryService.getById(id);
    if (!audit) {
      throw new NotFoundException(`Audit not found: ${id}`);
    }
    return toAuditMetadata(audit);
  }

  @Get(':id/analysis')
  async getAnalysis(@Param('id') id: string): Promise<AuditAnalysisView> {
    const analysis = await this.auditAnalysisQueryService.getByAuditId(id);
    if (!analysis) {
      throw new NotFoundException(`No analysis available for audit: ${id}`);
    }
    return analysis;
  }

  @Post()
  async create(@Body() dto: CreateAuditDto, @Req() req: Request): Promise<CreateAuditResponse> {
    if (typeof dto?.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required');
    }

    try {
      // Returns as soon as the Audit is queued — the Workflow Runtime itself now runs in the
      // background (F10-S04B). Callers that need the finished results poll GET /audits/:id (and
      // GET /audits/:id/analysis once completed), or watch GET /audits/:id/events for live progress.
      const audit = await this.createAuditUseCase.execute(dto.url, req.correlationId, dto.clientId, dto.triggeredBy);
      return { id: audit.id, status: audit.status };
    } catch (error) {
      if (error instanceof InvalidAuditUrlError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ClientNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof DuplicateAuditExecutionError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Query('confirmBaseline') confirmBaseline?: string): Promise<void> {
    try {
      await this.deleteAuditUseCase.execute(id, confirmBaseline === 'true');
    } catch (error) {
      if (error instanceof AuditNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof AuditInProgressError || error instanceof BaselineDeletionRequiresConfirmationError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  // Real-time Workflow Runtime progress (Live Audit Execution, F10-S04B) — never simulated: every
  // emitted event mirrors a genuine step/audit status transition published by CreateAuditUseCase's
  // background pipeline. On connect, replays whatever has genuinely already happened (from the
  // persisted execution history plus any step currently mid-flight), then streams further real
  // transitions as they occur, and ends the stream once the Audit reaches a terminal state.
  @Sse(':id/events')
  @SkipTimeout()
  async streamProgress(@Param('id') id: string): Promise<Observable<MessageEvent>> {
    const result = await this.auditQueryService.getById(id);
    if (!result) {
      throw new NotFoundException(`Audit not found: ${id}`);
    }

    const publisher = this.progressPublisher;

    return new Observable<MessageEvent>((subscriber) => {
      const knownStepIds = new Set<string>();

      for (const record of result.executionHistory) {
        knownStepIds.add(record.stepId);
        const event: AuditProgressEvent = {
          type: 'step',
          stepId: record.stepId,
          status: record.status === 'success' ? 'completed' : 'failed',
          startedAt: record.startedAt,
          completedAt: record.completedAt,
          durationMs: record.durationMs,
          errorCode: record.errorCode,
          errorMessage: record.errorMessage,
        };
        subscriber.next({ data: JSON.stringify(event) });
      }

      const snapshot = publisher.getSnapshot(id);
      for (const event of snapshot.steps) {
        if (!knownStepIds.has(event.stepId)) {
          subscriber.next({ data: JSON.stringify(event) });
        }
      }

      subscriber.next({
        data: JSON.stringify({
          type: 'audit',
          status: result.audit.status,
          timestamp: new Date().toISOString(),
        } satisfies AuditProgressEvent),
      });

      if (isTerminalAuditStatus(result.audit.status)) {
        subscriber.complete();
        return () => {};
      }

      const unsubscribe = publisher.subscribe(id, (event) => {
        subscriber.next({ data: JSON.stringify(event) });
        if (event.type === 'audit' && isTerminalAuditStatus(event.status)) {
          subscriber.complete();
        }
      });

      return () => unsubscribe();
    });
  }
}
