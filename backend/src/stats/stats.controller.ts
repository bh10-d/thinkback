import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('streak')
  getStreak() {
    return this.statsService.getStreak();
  }

  @Get('heatmap')
  getHeatmap(@Query('days') days?: string) {
    return this.statsService.getHeatmap(days ? parseInt(days, 10) : 90);
  }
}
