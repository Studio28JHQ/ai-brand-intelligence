import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import type { CampaignMetadata, ImpactAssessment, OptimizationActionMetadata } from '@ai-visibility/contracts';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { TransitionCampaignStatusUseCase } from '../../application/campaign/transition-campaign-status.use-case';
import { TransitionActionStatusUseCase } from '../../application/campaign/transition-action-status.use-case';
import { ImpactAssessmentService } from '../../application/impact-assessment/impact-assessment.service';
import {
  CampaignNotFoundError,
  InvalidCampaignStateTransitionError,
  InvalidActionStateTransitionError,
  OptimizationActionNotFoundError,
} from '../../domain/campaign/campaign.errors';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { AuditNotFoundError, AuditNotCompletedError } from '../../domain/audit/audit.errors';
import {
  NoVerificationAuditError,
  ProjectBaselineNotSetError,
  VerificationAuditMismatchError,
} from '../../domain/impact-assessment/impact-assessment.errors';
import { TransitionActionStatusDto, TransitionCampaignStatusDto } from './dto/transition-status.dto';
import { toCampaignMetadata } from './campaign-metadata.mapper';

@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly campaignQueryService: CampaignQueryService,
    private readonly transitionCampaignStatusUseCase: TransitionCampaignStatusUseCase,
    private readonly transitionActionStatusUseCase: TransitionActionStatusUseCase,
    private readonly impactAssessmentService: ImpactAssessmentService,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<CampaignMetadata> {
    const result = await this.campaignQueryService.getById(id);
    if (!result) {
      throw new NotFoundException(`Campaign not found: ${id}`);
    }
    return toCampaignMetadata(result.campaign, result.actions);
  }

  @Post(':id/status')
  async transitionStatus(
    @Param('id') id: string,
    @Body() dto: TransitionCampaignStatusDto,
  ): Promise<CampaignMetadata> {
    try {
      const campaign = await this.transitionTo(id, dto?.status);
      const result = await this.campaignQueryService.getById(campaign.id);
      return toCampaignMetadata(campaign, result?.actions ?? []);
    } catch (error) {
      if (error instanceof CampaignNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidCampaignStateTransitionError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post(':campaignId/actions/:actionId/status')
  async transitionActionStatus(
    @Param('campaignId') campaignId: string,
    @Param('actionId') actionId: string,
    @Body() dto: TransitionActionStatusDto,
  ): Promise<OptimizationActionMetadata> {
    try {
      const action = await this.transitionActionTo(actionId, dto?.status);
      if (action.campaignId !== campaignId) {
        throw new NotFoundException(`Optimization action not found for campaign: ${actionId}`);
      }
      return {
        id: action.id,
        campaignId: action.campaignId,
        projectId: action.projectId,
        auditId: action.auditId,
        title: action.title,
        supportingFindingIds: [...action.supportingFindingIds],
        status: action.status,
        createdAt: action.createdAt.toISOString(),
        startedAt: action.startedAt ? action.startedAt.toISOString() : null,
        completedAt: action.completedAt ? action.completedAt.toISOString() : null,
        verifiedAt: action.verifiedAt ? action.verifiedAt.toISOString() : null,
      };
    } catch (error) {
      if (error instanceof OptimizationActionNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidActionStateTransitionError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get(':id/impact-assessment')
  async getImpactAssessment(
    @Param('id') id: string,
    @Query('verificationAuditId') verificationAuditId?: string,
  ): Promise<ImpactAssessment> {
    try {
      return await this.impactAssessmentService.assess(id, verificationAuditId);
    } catch (error) {
      if (error instanceof CampaignNotFoundError || error instanceof ProjectNotFoundError || error instanceof AuditNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof ProjectBaselineNotSetError ||
        error instanceof NoVerificationAuditError ||
        error instanceof VerificationAuditMismatchError ||
        error instanceof AuditNotCompletedError
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private transitionTo(id: string, status: TransitionCampaignStatusDto['status']) {
    if (status === 'active') {
      return this.transitionCampaignStatusUseCase.activate(id);
    }
    if (status === 'completed') {
      return this.transitionCampaignStatusUseCase.complete(id);
    }
    if (status === 'archived') {
      return this.transitionCampaignStatusUseCase.archive(id);
    }
    throw new BadRequestException(`Unsupported campaign status: ${status}`);
  }

  private transitionActionTo(id: string, status: TransitionActionStatusDto['status']) {
    if (status === 'in-progress') {
      return this.transitionActionStatusUseCase.start(id);
    }
    if (status === 'completed') {
      return this.transitionActionStatusUseCase.complete(id);
    }
    if (status === 'verified') {
      return this.transitionActionStatusUseCase.verify(id);
    }
    throw new BadRequestException(`Unsupported action status: ${status}`);
  }
}
