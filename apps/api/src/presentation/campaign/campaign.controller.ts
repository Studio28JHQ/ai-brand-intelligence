import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { CampaignMetadata, OptimizationActionMetadata } from '@ai-visibility/contracts';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { TransitionCampaignStatusUseCase } from '../../application/campaign/transition-campaign-status.use-case';
import { TransitionActionStatusUseCase } from '../../application/campaign/transition-action-status.use-case';
import {
  CampaignNotFoundError,
  InvalidCampaignStateTransitionError,
  InvalidActionStateTransitionError,
  OptimizationActionNotFoundError,
} from '../../domain/campaign/campaign.errors';
import { TransitionActionStatusDto, TransitionCampaignStatusDto } from './dto/transition-status.dto';
import { toCampaignMetadata } from './campaign-metadata.mapper';

@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly campaignQueryService: CampaignQueryService,
    private readonly transitionCampaignStatusUseCase: TransitionCampaignStatusUseCase,
    private readonly transitionActionStatusUseCase: TransitionActionStatusUseCase,
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
