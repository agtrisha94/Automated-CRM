/**
 * ============================================================================
 * SCORING SERVICE (Main Orchestrator)
 * ============================================================================
 * 
 * This is the MAIN scoring service that orchestrates all scoring operations.
 * It acts as a "coordinator" between:
 * 
 * 1. The NestJS backend (this service)
 * 2. The local rule-based scoring (ScoringRulesService)
 * 3. The external FastAPI ML service (via HTTP calls)
 * 
 * ARCHITECTURE:
 * ┌─────────────────┐
 * │  ScoringService │ ← You are here
 * └────────┬────────┘
 *          │
 *    ┌─────┴─────┐
 *    │           │
 *    ▼           ▼
 * ┌──────────┐  ┌──────────────┐
 * │Rules Svc │  │ FastAPI      │
 * │(local)   │  │ (port 8000)  │
 * └──────────┘  └──────────────┘
 * 
 * WHY SEPARATE SERVICES?
 * - Rule-based: Fast, runs locally in NestJS
 * - ML-based: Requires Python/scikit-learn, runs in separate container
 * - This allows comparing them fairly with isolated latency measurements
 * ============================================================================
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';      // For HTTP requests to FastAPI
import { ConfigService } from '@nestjs/config';   // For reading environment variables
import { PrismaService } from '../prisma/prisma.service';
import { ScoringRulesService } from './scoring-rules.service';
import { ScoreCategory, ScoringMode } from '@prisma/client';
import { firstValueFrom } from 'rxjs';  // Converts Observable to Promise
import { AxiosResponse } from 'axios';

/**
 * Type definitions for responses from the FastAPI ML service.
 * These match the Pydantic models defined in scoring-service/main.py
 */

// Response from POST /score/ml endpoint
interface MLScoreResponse {
  leadId: string;
  score: number;
  category: string;
  latencyMs: number;
}

// Response from POST /score/compare endpoint
interface CompareResponse {
  leadId: string;
  ruleScore: number;
  mlScore: number;
  rfScore: number;      // Random Forest score
  delta: number;        // Difference between rule and ML scores
  agreement: boolean;   // True if all methods agree on category
  ruleCategory: string;
  mlCategory: string;
  rfCategory: string;
  ruleLatencyMs: number;
  mlLatencyMs: number;
  rfLatencyMs: number;
}

/**
 * Our own result types (what this service returns to controllers)
 */
export interface ScoreResult {
  leadId: string;
  score: number;
  category: ScoreCategory;
  latencyMs: number;  // How long scoring took (for research comparison)
}

export interface CompareResult {
  leadId: string;
  ruleScore: number;
  mlScore: number;
  rfScore: number;
  delta: number;
  agreement: boolean;
  ruleCategory: ScoreCategory;
  mlCategory: ScoreCategory;
  rfCategory: ScoreCategory;
  ruleLatencyMs: number;
  mlLatencyMs: number;
  rfLatencyMs: number;
}

@Injectable()
export class ScoringService {
  // Logger for debugging and error tracking
  private readonly logger = new Logger(ScoringService.name);
  
  // URL of the FastAPI scoring service (from environment or default)
  private readonly scoringServiceUrl: string;

  /**
   * Constructor with dependency injection.
   * NestJS automatically provides these services when creating ScoringService.
   */
  constructor(
    private readonly prisma: PrismaService,           // Database access
    private readonly httpService: HttpService,         // HTTP client for FastAPI
    private readonly configService: ConfigService,     // Environment variables
    private readonly rulesService: ScoringRulesService, // Local rule-based scoring
  ) {
    // Get FastAPI URL from environment, default to localhost for development
    this.scoringServiceUrl =
      this.configService.get<string>('SCORING_SERVICE_URL') ||
      'http://localhost:8000';
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * RULE-BASED SCORING
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Scores a lead using the local rule-based engine (ScoringRulesService).
   * This is FAST because it runs entirely in NestJS, no network calls.
   * 
   * FLOW:
   * 1. Start timer (for latency measurement)
   * 2. Fetch lead from database
   * 3. Calculate score using rules
   * 4. Update lead record with new score
   * 5. Save scoring event to history (for audit trail)
   * 6. Return result with latency
   * 
   * @param leadId - UUID of the lead to score
   * @returns ScoreResult with score, category, and latency
   */
  async scoreWithRules(leadId: string): Promise<ScoreResult> {
    // Step 1: Start timing (for research latency comparison)
    const start = Date.now();

    // Step 2: Fetch lead from database (throws if not found)
    const lead = await this.prisma.lead.findUniqueOrThrow({
      where: { id: leadId },
    });

    // Step 3: Calculate score using the rules service
    const result = this.rulesService.calculateScore({
      emailOpens: lead.emailOpens,
      websiteVisits: lead.websiteVisits,
      formFills: lead.formFills,
      companySize: lead.companySize,
      industry: lead.industry,
    });

    // Step 4: Calculate how long it took
    const latencyMs = Date.now() - start;

    // Step 5: Update the lead record with the new score
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        ruleScore: result.score,         // Store the rule-based score
        scoreCategory: result.category,   // Update category (COLD/WARM/HOT)
        activeScore: result.score,        // Set as the "active" score
      },
    });

    // Step 6: Record this scoring event in history (audit trail)
    await this.prisma.scoringHistory.create({
      data: {
        leadId,
        oldScore: lead.ruleScore || 0,    // Previous score (or 0 if first time)
        newScore: result.score,
        scoringMode: ScoringMode.RULES,   // Mark as rule-based
        reason: 'Rule-based scoring',
        triggeredBy: 'system',
        latencyMs,
      },
    });

    // Step 7: Return the result
    return {
      leadId,
      score: result.score,
      category: result.category,
      latencyMs,
    };
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * ML-BASED SCORING
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Scores a lead using the external FastAPI ML service.
   * This makes an HTTP POST request to http://localhost:8000/score/ml
   * 
   * WHY EXTERNAL SERVICE?
   * - ML models (scikit-learn) are Python-based
   * - Keeps NestJS lean (no Python dependencies)
   * - Allows independent scaling of ML service
   * 
   * FLOW:
   * 1. Start timer
   * 2. Fetch lead from database
   * 3. Send HTTP POST to FastAPI with lead features
   * 4. Parse response
   * 5. Update lead record
   * 6. Save to history
   * 7. Return result
   * 
   * @param leadId - UUID of the lead to score
   * @returns ScoreResult with ML score, category, and latency
   */
  async scoreWithML(leadId: string): Promise<ScoreResult> {
    const start = Date.now();

    // Fetch lead data to send to ML service
    const lead = await this.prisma.lead.findUniqueOrThrow({
      where: { id: leadId },
    });

    try {
      // Make HTTP POST request to FastAPI scoring service
      // firstValueFrom converts the Observable (RxJS) to a Promise
      const response: AxiosResponse<MLScoreResponse> = await firstValueFrom(
        this.httpService.post<MLScoreResponse>(
          `${this.scoringServiceUrl}/score/ml`,  // URL: http://localhost:8000/score/ml
          {
            // Request body - lead features for the ML model
            leadId: lead.id,
            emailOpens: lead.emailOpens,
            websiteVisits: lead.websiteVisits,
            formFills: lead.formFills,
            companySize: lead.companySize,
            industry: lead.industry,
            status: lead.status,
            source: lead.source,
          },
        ),
      );

      const latencyMs = Date.now() - start;
      
      // Cast string category to enum (FastAPI returns string, Prisma uses enum)
      const category = response.data.category as ScoreCategory;

      // Update lead with the ML score
      await this.prisma.lead.update({
        where: { id: leadId },
        data: {
          mlScore: response.data.score,  // Store ML score (separate from ruleScore)
        },
      });

      // Record in scoring history
      await this.prisma.scoringHistory.create({
        data: {
          leadId,
          oldScore: lead.mlScore ? Math.round(lead.mlScore) : 0,
          newScore: Math.round(response.data.score),
          scoringMode: ScoringMode.ML,
          reason: 'ML scoring (logistic regression)',
          triggeredBy: 'system',
          latencyMs,
        },
      });

      return {
        leadId,
        score: response.data.score,
        category,
        latencyMs,
      };
    } catch (error) {
      // Log error and re-throw for controller to handle
      this.logger.error(`ML scoring failed for lead ${leadId}`, error);
      throw error;
    }
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * COMPARE ALL SCORING METHODS
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * This is the KEY RESEARCH FUNCTION.
   * It calls FastAPI's /score/compare endpoint which runs ALL THREE methods:
   * 1. Rule-based scoring
   * 2. Logistic Regression (ML)
   * 3. Random Forest (RF)
   * 
   * Returns a side-by-side comparison with:
   * - All three scores
   * - All three categories
   * - Delta (difference between rule and ML)
   * - Agreement (do all three agree on the category?)
   * - Latency for each method
   * 
   * This data is crucial for the research paper to compare approaches.
   * 
   * @param leadId - UUID of the lead to compare
   * @returns CompareResult with all scores and metrics
   */
  async compareScores(leadId: string): Promise<CompareResult> {
    const lead = await this.prisma.lead.findUniqueOrThrow({
      where: { id: leadId },
    });

    try {
      // Call the compare endpoint on FastAPI
      const response: AxiosResponse<CompareResponse> = await firstValueFrom(
        this.httpService.post<CompareResponse>(
          `${this.scoringServiceUrl}/score/compare`,
          {
            leadId: lead.id,
            emailOpens: lead.emailOpens,
            websiteVisits: lead.websiteVisits,
            formFills: lead.formFills,
            companySize: lead.companySize,
            industry: lead.industry,
            status: lead.status,
            source: lead.source,
          },
        ),
      );

      // Save comparison to database for later analysis
      await this.prisma.scoringComparison.create({
        data: {
          leadId,
          ruleScore: Math.round(response.data.ruleScore),
          mlScore: response.data.mlScore,
          delta: response.data.delta,
          ruleCategory: response.data.ruleCategory as ScoreCategory,
          mlCategory: response.data.mlCategory as ScoreCategory,
          agreement: response.data.agreement,
          ruleLatencyMs: response.data.ruleLatencyMs,
          mlLatencyMs: response.data.mlLatencyMs,
        },
      });

      // Return the full comparison result
      return {
        leadId: response.data.leadId,
        ruleScore: response.data.ruleScore,
        mlScore: response.data.mlScore,
        rfScore: response.data.rfScore,
        delta: response.data.delta,
        agreement: response.data.agreement,
        ruleCategory: response.data.ruleCategory as ScoreCategory,
        mlCategory: response.data.mlCategory as ScoreCategory,
        rfCategory: response.data.rfCategory as ScoreCategory,
        ruleLatencyMs: response.data.ruleLatencyMs,
        mlLatencyMs: response.data.mlLatencyMs,
        rfLatencyMs: response.data.rfLatencyMs,
      };
    } catch (error) {
      this.logger.error(`Score comparison failed for lead ${leadId}`, error);
      throw error;
    }
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * BATCH SCORING
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Score multiple leads at once. Useful for:
   * - Initial scoring of imported leads
   * - Re-scoring all leads after rule changes
   * - Research: score entire synthetic dataset
   * 
   * @param leadIds - Array of lead UUIDs to score
   * @param mode - RULES or ML (default: RULES)
   * @returns Array of ScoreResults
   */
  async batchScore(
    leadIds: string[],
    mode: ScoringMode = ScoringMode.RULES,
  ): Promise<ScoreResult[]> {
    const results: ScoreResult[] = [];

    // Process leads one by one (could be parallelized for performance)
    for (const leadId of leadIds) {
      try {
        // Choose scoring method based on mode
        const result =
          mode === ScoringMode.RULES
            ? await this.scoreWithRules(leadId)
            : await this.scoreWithML(leadId);
        results.push(result);
      } catch (error) {
        // Log error but continue with remaining leads
        this.logger.error(`Batch scoring failed for lead ${leadId}`, error);
      }
    }

    return results;
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * HISTORY & ANALYTICS
   * ══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Get scoring history for a lead.
   * Shows how the lead's score changed over time.
   */
  async getScoringHistory(leadId: string) {
    return this.prisma.scoringHistory.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },  // Most recent first
    });
  }

  /**
   * Get all scoring comparisons for a lead.
   * Shows side-by-side results of rule vs ML scoring.
   */
  async getScoringComparisons(leadId: string) {
    return this.prisma.scoringComparison.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });
  }
}