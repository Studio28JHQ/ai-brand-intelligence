import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { AuditMetadata, CreateAuditResponse } from '@ai-visibility/contracts';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { AuditQueryService } from '../../application/audit/audit-query.service';
import { InvalidAuditUrlError } from '../../domain/audit/audit.errors';
import { CreateAuditDto } from './dto/create-audit.dto';
import { toAuditMetadata } from './audit-metadata.mapper';
import { buildAuditSummary } from './audit-summary.view';

@Controller('audits')
export class AuditController {
  constructor(
    private readonly createAuditUseCase: CreateAuditUseCase,
    private readonly auditQueryService: AuditQueryService,
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

  @Get(':id')
  async getById(@Param('id') id: string): Promise<AuditMetadata> {
    const audit = await this.auditQueryService.getById(id);
    if (!audit) {
      throw new NotFoundException(`Audit not found: ${id}`);
    }
    return toAuditMetadata(audit);
  }

  @Post()
  async create(@Body() dto: CreateAuditDto): Promise<CreateAuditResponse> {
    if (typeof dto?.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required');
    }

    try {
      const snapshot = await this.createAuditUseCase.execute(dto.url);
      return buildAuditSummary(snapshot);
    } catch (error) {
      if (error instanceof InvalidAuditUrlError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
