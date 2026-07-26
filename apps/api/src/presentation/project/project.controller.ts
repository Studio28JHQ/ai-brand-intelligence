import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { CampaignMetadata, ConsultantAnswer, ExecutiveDashboard, ProjectMetadata } from '@ai-visibility/contracts';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { SetProjectBaselineUseCase } from '../../application/project/set-project-baseline.use-case';
import { ExecutiveDashboardQueryService } from '../../application/dashboard/executive-dashboard.query-service';
import { CreateCampaignUseCase } from '../../application/campaign/create-campaign.use-case';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { AiConversationOrchestratorService } from '../../application/ai-conversation/ai-conversation-orchestrator.service';
import { createConversationSession } from '../../application/ai-conversation/create-conversation-session';
import type { ConversationIntentType } from '../../application/ai-conversation/conversation-session';
import {
  ProjectNotFoundError,
  BaselineAuditMismatchError,
  BaselineAuditNotCompletedError,
} from '../../domain/project/project.errors';
import { AuditNotFoundError } from '../../domain/audit/audit.errors';
import { ClientNotFoundError } from '../../domain/client/client.errors';
import { NoCompletedAuditError } from '../../domain/campaign/campaign.errors';
import { SetProjectBaselineDto } from './dto/set-project-baseline.dto';
import { AskConsultantDto } from './dto/ask-consultant.dto';
import { toProjectMetadata } from './project-metadata.mapper';
import { toCampaignMetadata } from '../campaign/campaign-metadata.mapper';
import { toConsultantAnswer } from './consultant-answer.mapper';

const SUPPORTED_CONSULTANT_INTENTS: ReadonlySet<string> = new Set([
  'why',
  'what-should-i-do-first',
  'what-changed',
  'what-is-blocking-visibility',
  'general-question',
]);

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectQueryService: ProjectQueryService,
    private readonly setProjectBaselineUseCase: SetProjectBaselineUseCase,
    private readonly executiveDashboardQueryService: ExecutiveDashboardQueryService,
    private readonly createCampaignUseCase: CreateCampaignUseCase,
    private readonly campaignQueryService: CampaignQueryService,
    private readonly aiConversationOrchestratorService: AiConversationOrchestratorService,
  ) {}

  @Get()
  async list(): Promise<ProjectMetadata[]> {
    const projects = await this.projectQueryService.list();
    return projects.map(toProjectMetadata);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProjectMetadata> {
    const project = await this.projectQueryService.getById(id);
    if (!project) {
      throw new NotFoundException(`Project not found: ${id}`);
    }
    return toProjectMetadata(project);
  }

  @Get(':id/dashboard')
  async getDashboard(@Param('id') id: string): Promise<ExecutiveDashboard> {
    try {
      return await this.executiveDashboardQueryService.getDashboard(id);
    } catch (error) {
      if (error instanceof ProjectNotFoundError || error instanceof ClientNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/baseline')
  async setBaseline(
    @Param('id') id: string,
    @Body() dto: SetProjectBaselineDto,
  ): Promise<ProjectMetadata> {
    if (typeof dto?.auditId !== 'string' || dto.auditId.trim().length === 0) {
      throw new BadRequestException('auditId is required');
    }

    try {
      const project = await this.setProjectBaselineUseCase.execute(id, dto.auditId);
      return toProjectMetadata(project);
    } catch (error) {
      if (error instanceof ProjectNotFoundError || error instanceof AuditNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BaselineAuditMismatchError || error instanceof BaselineAuditNotCompletedError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/campaigns')
  async createCampaign(@Param('id') id: string): Promise<CampaignMetadata> {
    try {
      const campaign = await this.createCampaignUseCase.execute(id);
      const result = await this.campaignQueryService.getById(campaign.id);
      return toCampaignMetadata(campaign, result?.actions ?? []);
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof NoCompletedAuditError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id/campaigns/latest')
  async getLatestCampaign(@Param('id') id: string): Promise<CampaignMetadata> {
    const result = await this.campaignQueryService.getLatestByProjectId(id);
    if (!result) {
      throw new NotFoundException(`No campaign found for project: ${id}`);
    }
    return toCampaignMetadata(result.campaign, result.actions);
  }

  @Post(':id/consultant/ask')
  async askConsultant(@Param('id') id: string, @Body() dto: AskConsultantDto): Promise<ConsultantAnswer> {
    if (typeof dto?.intentType !== 'string' || !SUPPORTED_CONSULTANT_INTENTS.has(dto.intentType)) {
      throw new BadRequestException(`Unsupported intentType: ${dto?.intentType}`);
    }
    if (typeof dto?.question !== 'string' || dto.question.trim().length === 0) {
      throw new BadRequestException('question is required');
    }

    const project = await this.projectQueryService.getById(id);
    if (!project) {
      throw new NotFoundException(`Project not found: ${id}`);
    }

    const session = createConversationSession(id);
    const conversationResponse = await this.aiConversationOrchestratorService.orchestrate({
      session,
      intent: { type: dto.intentType as ConversationIntentType, question: dto.question },
    });

    return toConsultantAnswer(dto.question, conversationResponse);
  }
}
