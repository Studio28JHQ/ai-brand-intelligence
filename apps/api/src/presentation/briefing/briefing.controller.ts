import { Controller, Get } from '@nestjs/common';
import type { BriefingModel } from '@ai-visibility/contracts';
import { AiDailyBriefingQueryService } from '../../application/ai-briefing/ai-daily-briefing.query-service';

@Controller('briefing')
export class BriefingController {
  constructor(private readonly aiDailyBriefingQueryService: AiDailyBriefingQueryService) {}

  @Get('daily')
  async getDailyBriefing(): Promise<BriefingModel> {
    return this.aiDailyBriefingQueryService.build();
  }
}
