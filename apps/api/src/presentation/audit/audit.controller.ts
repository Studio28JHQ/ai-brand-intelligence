import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import type { CreateAuditResponse } from '@ai-visibility/contracts';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { InvalidAuditUrlError } from '../../domain/audit/audit.errors';
import { CreateAuditDto } from './dto/create-audit.dto';
import { generateRecommendations } from './recommendation.service';

@Controller('audits')
export class AuditController {
  constructor(private readonly createAuditUseCase: CreateAuditUseCase) {}

  @Post()
  async create(@Body() dto: CreateAuditDto): Promise<CreateAuditResponse> {
    if (typeof dto?.url !== 'string' || dto.url.trim().length === 0) {
      throw new BadRequestException('url is required');
    }

    try {
      const { audit, discovery, crawl, inventory, analysis, entity, knowledgeGraph, aiVisibility } =
        await this.createAuditUseCase.execute(dto.url);
      return {
        id: audit.id,
        status: audit.status,
        discovery: {
          normalizedUrl: discovery.normalizedUrl,
          robotsTxtDetected: discovery.robotsTxtDetected,
          sitemapDetected: discovery.sitemapDetected,
        },
        crawl: {
          httpStatus: crawl.httpStatus,
          finalUrl: crawl.finalUrl,
          htmlSizeBytes: Buffer.byteLength(crawl.html, 'utf8'),
          success: crawl.success,
        },
        inventory: {
          title: inventory.title,
          canonicalUrl: inventory.canonicalUrl,
          language: inventory.language,
          h1Count: inventory.h1Count,
          internalLinkCount: inventory.internalLinkCount,
          externalLinkCount: inventory.externalLinkCount,
        },
        analysis: {
          findings: analysis.findings.map((finding) => ({
            id: finding.id,
            ruleId: finding.ruleId,
            category: finding.category,
            sourceEngine: finding.sourceEngine,
            outcome: finding.outcome,
            severity: finding.severity,
            evidence: finding.evidence,
          })),
        },
        entity: {
          entities: entity.entities.map((item) => ({
            name: item.name,
            type: item.type,
            sourceLocation: item.sourceLocation,
            confidence: item.confidence,
          })),
        },
        knowledgeGraph: {
          totalEntities: knowledgeGraph.nodes.length,
          totalRelationships: knowledgeGraph.relationships.length,
          entityTypes: [...new Set(knowledgeGraph.nodes.map((node) => node.type))],
          relationshipTypes: [...new Set(knowledgeGraph.relationships.map((relationship) => relationship.type))],
        },
        aiVisibility: {
          status: aiVisibility.assessment.status,
          graphCompleteness: aiVisibility.assessment.graphCompleteness,
          entityCoverage: aiVisibility.assessment.entityCoverage,
          relationshipCoverage: aiVisibility.assessment.relationshipCoverage,
          missingSignals: aiVisibility.assessment.missingSignals,
          assessedAt: aiVisibility.assessment.assessedAt,
        },
        recommendation: {
          recommendations: generateRecommendations(analysis.findings, aiVisibility.assessment),
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
