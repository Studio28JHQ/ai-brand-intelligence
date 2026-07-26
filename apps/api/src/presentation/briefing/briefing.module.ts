import { Module } from '@nestjs/common';
import { AiDailyBriefingQueryService } from '../../application/ai-briefing/ai-daily-briefing.query-service';
import { ProjectModule } from '../project/project.module';
import { BriefingController } from './briefing.controller';

@Module({
  imports: [ProjectModule],
  controllers: [BriefingController],
  providers: [AiDailyBriefingQueryService],
})
export class BriefingModule {}
