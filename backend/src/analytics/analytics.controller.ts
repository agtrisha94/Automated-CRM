import { Controller, Get } from '@nestjs/common'
import { AnalyticsService, AnalyticsPayload } from './analytics.service'

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get analytics overview data for the dashboard
   * Returns: KPIs, score distribution, trends, funnel data, and model metrics
   */
  @Get('overview')
  async getOverview(): Promise<AnalyticsPayload> {
    return this.analyticsService.getOverview()
  }
}
