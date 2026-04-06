import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, HttpModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
