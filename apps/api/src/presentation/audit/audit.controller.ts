import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import type { CreateAuditResponse, CrawlResult, EngineResult, InventoryResult } from '@ai-visibility/contracts';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { InvalidAuditUrlError } from '../../domain/audit/audit.errors';
import { DiscoveryResult } from '../../domain/audit/discovery-result';
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
      const snapshot = await this.createAuditUseCase.execute(dto.url);

      const discovery = (snapshot.engineResults.discovery as EngineResult<DiscoveryResult>).output!;
      const crawl = (snapshot.engineResults.crawl as EngineResult<CrawlResult>).output!;
      const inventory = (snapshot.engineResults.inventory as EngineResult<InventoryResult>).output!;

      return {
        id: snapshot.audit.id,
        status: snapshot.audit.status,
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
          findings: snapshot.findings.map((finding) => ({
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
          entities: snapshot.entities.map((item) => ({
            name: item.name,
            type: item.type,
            sourceLocation: item.sourceLocation,
            confidence: item.confidence,
          })),
        },
        knowledgeGraph: {
          totalEntities: snapshot.knowledgeGraph.nodes.length,
          totalRelationships: snapshot.knowledgeGraph.relationships.length,
          entityTypes: [...new Set(snapshot.knowledgeGraph.nodes.map((node) => node.type))],
          relationshipTypes: [
            ...new Set(snapshot.knowledgeGraph.relationships.map((relationship) => relationship.type)),
          ],
        },
        aiVisibility: {
          status: snapshot.aiVisibility.status,
          graphCompleteness: snapshot.aiVisibility.graphCompleteness,
          entityCoverage: snapshot.aiVisibility.entityCoverage,
          relationshipCoverage: snapshot.aiVisibility.relationshipCoverage,
          missingSignals: snapshot.aiVisibility.missingSignals,
          assessedAt: snapshot.aiVisibility.assessedAt,
        },
        recommendation: {
          recommendations: generateRecommendations(snapshot.findings, snapshot.aiVisibility),
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
