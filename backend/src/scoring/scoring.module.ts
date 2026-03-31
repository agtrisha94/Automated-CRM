/**
 * ============================================================================
 * SCORING MODULE
 * ============================================================================
 * 
 * This is the NestJS module that bundles all scoring-related functionality.
 * 
 * WHAT IS A MODULE?
 * - In NestJS, a module is a class decorated with @Module()
 * - It organizes related controllers, services, and imports
 * - Think of it like a "feature folder" that groups related code
 * 
 * THIS MODULE PROVIDES:
 * 1. Rule-based lead scoring (calculated locally)
 * 2. ML-based lead scoring (calls external FastAPI service)
 * 3. Comparison of different scoring methods
 * 4. Scoring history tracking
 * ============================================================================
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';  // For making HTTP requests to FastAPI
import { ScoringService } from './scoring.service';
import { ScoringRulesService } from './scoring-rules.service';
import { ScoringController } from './scoring.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    // PrismaModule: Gives us access to the database via PrismaService
    PrismaModule,
    
    // HttpModule: Allows us to make HTTP requests to the FastAPI scoring service
    // - timeout: 5000ms = 5 seconds max wait time for response
    // - maxRedirects: 5 = follow up to 5 redirects
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  
  // Controllers handle incoming HTTP requests (REST API endpoints)
  controllers: [ScoringController],
  
  // Providers are injectable services that contain business logic
  providers: [ScoringService, ScoringRulesService],
  
  // Exports make these services available to OTHER modules that import ScoringModule
  exports: [ScoringService, ScoringRulesService],
})
export class ScoringModule {}