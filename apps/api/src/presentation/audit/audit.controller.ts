import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import type { CreateAuditResponse } from '@ai-visibility/contracts';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { InvalidAuditUrlError } from '../../domain/audit/audit.errors';
import { CreateAuditDto } from './dto/create-audit.dto';

@Controller('audits')
export class AuditController {
  constructor(private readonly createAuditUseCase: CreateAuditUseCase) {}

  @Post()
  async create(@Body() dto: CreateAuditDto): Promise<CreateAuditResponse> {
    if (typeof dto?.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required');
    }

    try {
      const { audit, discovery } = await this.createAuditUseCase.execute(dto.url);
      return {
        id: audit.id,
        status: audit.status,
        discovery: {
          normalizedUrl: discovery.normalizedUrl,
          robotsTxtDetected: discovery.robotsTxtDetected,
          sitemapDetected: discovery.sitemapDetected,
        },
      };
    } catch (error) {
      if (error instanceof InvalidAuditUrlError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
