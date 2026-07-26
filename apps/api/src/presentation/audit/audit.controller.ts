import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { AuditComparisonResult, AuditMetadata, CreateAuditResponse } from '@ai-visibility/contracts';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { AuditQueryService } from '../../application/audit/audit-query.service';
import { AuditComparisonService } from '../../application/comparison/audit-comparison.service';
import { InvalidAuditUrlError, AuditNotFoundError, AuditNotCompletedError } from '../../domain/audit/audit.errors';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { CreateAuditDto } from './dto/create-audit.dto';
import { toAuditMetadata } from './audit-metadata.mapper';
import { buildAuditSummary } from './audit-summary.view';

@Controller('audits')
export class AuditController {
  constructor(
    private readonly createAuditUseCase: CreateAuditUseCase,
    private readonly auditQueryService: AuditQueryService,
    private readonly auditComparisonService: AuditComparisonService,
  ) {}

  @Get()
  async list(): Promise<AuditMetadata[]> {
    const audits = await this.auditQueryService.list();
    return audits.map(toAuditMetadata);
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

  @Get(':id')
  async getById(@Param('id') id: string): Promise<AuditMetadata> {
    const audit = await this.auditQueryService.getById(id);
    if (!audit) {
      throw new NotFoundException(`Audit not found: ${id}`);
    }
    return toAuditMetadata(audit);
  }

  @Post()
  async create(@Body() dto: CreateAuditDto, @Req() req: Request): Promise<CreateAuditResponse> {
    if (typeof dto?.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required');
    }

    try {
      const snapshot = await this.createAuditUseCase.execute(dto.url, req.correlationId, dto.clientId);
      return buildAuditSummary(snapshot);
    } catch (error) {
      if (error instanceof InvalidAuditUrlError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ClientNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
