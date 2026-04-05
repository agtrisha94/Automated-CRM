/**
 * ============================================================================
 * SCORING CONTROLLER
 * ============================================================================
 * 
 * This controller defines the REST API endpoints for lead scoring.
 * 
 * WHAT IS A CONTROLLER?
 * - Controllers handle incoming HTTP requests
 * - They receive requests, call services, and return responses
 * - Think of them as the "traffic directors" of your API
 * 
 * ENDPOINTS DEFINED HERE:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ Method │ Endpoint                   │ Description                      │
 * ├────────┼────────────────────────────┼──────────────────────────────────┤
 * │ POST   │ /api/scoring/:id/rules     │ Score lead with rules            │
 * │ POST   │ /api/scoring/:id/ml        │ Score lead with ML               │
 * │ POST   │ /api/scoring/:id/compare   │ Compare all 3 methods            │
 * │ POST   │ /api/scoring/batch         │ Score multiple leads             │
 * │ GET    │ /api/scoring/:id/history   │ Get scoring history              │
 * │ GET    │ /api/scoring/:id/comparisons│ Get comparison records          │
 * │ GET    │ /api/scoring/rules         │ List all active rules            │
 * └────────────────────────────────────────────────────────────────────────┘
 * 
 * Note: All endpoints are prefixed with /api because of globalPrefix in main.ts
 * ============================================================================
 */

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseUUIDPipe,  // Validates that :id is a valid UUID format
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';  // For Swagger docs
import { ScoringService } from './scoring.service';
import { ScoringRulesService } from './scoring-rules.service';
import { ScoringMode } from '@prisma/client';

/**
 * DTO (Data Transfer Object) for batch scoring requests.
 * Defines the shape of the request body for POST /scoring/batch
 */
class BatchScoreDto {
  leadIds: string[];       // Array of lead UUIDs to score
  mode?: ScoringMode;      // Optional: RULES or ML (defaults to RULES)
}

/**
 * @ApiTags('Scoring') - Groups these endpoints under "Scoring" in Swagger UI
 * @Controller('scoring') - All routes in this controller start with /scoring
 *                          Combined with globalPrefix, final path is /api/scoring
 */
@ApiTags('Scoring')
@Controller('scoring')
export class ScoringController {
  /**
   * Constructor with dependency injection.
   * NestJS automatically provides these services.
   */
  constructor(
    private readonly scoringService: ScoringService,      // Main scoring orchestrator
    private readonly rulesService: ScoringRulesService,   // Rule-based scoring
  ) {}

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * POST /api/scoring/:id/rules
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Score a single lead using the rule-based approach.
   * 
   * EXAMPLE:
   * curl -X POST http://localhost:3000/api/scoring/123e4567-e89b-12d3-a456-426614174000/rules
   * 
   * RESPONSE:
   * {
   *   "leadId": "123e4567-...",
   *   "score": 55,
   *   "category": "WARM",
   *   "latencyMs": 12
   * }
   * 
   * @param id - Lead UUID from URL parameter (validated by ParseUUIDPipe)
   */
  @Post(':id/rules')
  @ApiOperation({ summary: 'Score a lead using rule-based approach' })
  @ApiResponse({ status: 200, description: 'Score calculated successfully' })
  async scoreWithRules(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoringService.scoreWithRules(id);
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * POST /api/scoring/:id/ml
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Score a single lead using the ML model (logistic regression).
   * This calls the FastAPI service at http://localhost:8000/score/ml
   * 
   * EXAMPLE:
   * curl -X POST http://localhost:3000/api/scoring/123e4567-e89b-12d3-a456-426614174000/ml
   * 
   * @param id - Lead UUID from URL parameter
   */
  @Post(':id/ml')
  @ApiOperation({ summary: 'Score a lead using ML model' })
  @ApiResponse({ status: 200, description: 'ML score calculated successfully' })
  async scoreWithML(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoringService.scoreWithML(id);
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * POST /api/scoring/:id/compare
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Compare ALL THREE scoring methods for a lead:
   * 1. Rule-based
   * 2. Logistic Regression (ML)
   * 3. Random Forest (RF)
   * 
   * This is the KEY endpoint for research analysis!
   * 
   * RESPONSE:
   * {
   *   "leadId": "...",
   *   "ruleScore": 55,
   *   "mlScore": 62.5,
   *   "rfScore": 58.3,
   *   "delta": 7.5,
   *   "agreement": false,
   *   "ruleCategory": "WARM",
   *   "mlCategory": "WARM",
   *   "rfCategory": "WARM",
   *   "ruleLatencyMs": 5,
   *   "mlLatencyMs": 23,
   *   "rfLatencyMs": 18
   * }
   * 
   * @param id - Lead UUID from URL parameter
   */
  @Post(':id/compare')
  @ApiOperation({ summary: 'Compare all scoring methods for a lead' })
  @ApiResponse({ status: 200, description: 'Comparison completed' })
  async compareScores(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoringService.compareScores(id);
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * POST /api/scoring/batch
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Score multiple leads at once.
   * 
   * EXAMPLE REQUEST:
   * curl -X POST http://localhost:3000/api/scoring/batch \
   *   -H "Content-Type: application/json" \
   *   -d '{"leadIds": ["uuid1", "uuid2", "uuid3"], "mode": "RULES"}'
   * 
   * @param dto - Request body with leadIds array and optional mode
   */
  @Post('batch')
  @ApiOperation({ summary: 'Batch score multiple leads' })
  @ApiResponse({ status: 200, description: 'Batch scoring completed' })
  async batchScore(@Body() dto: BatchScoreDto) {
    return this.scoringService.batchScore(dto.leadIds, dto.mode);
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * GET /api/scoring/:id/history
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Get the scoring history for a lead.
   * Shows how the score changed over time (audit trail).
   * 
   * EXAMPLE:
   * curl http://localhost:3000/api/scoring/123e4567-.../history
   * 
   * RESPONSE:
   * [
   *   { "oldScore": 0, "newScore": 55, "scoringMode": "RULES", "createdAt": "..." },
   *   { "oldScore": 55, "newScore": 62, "scoringMode": "ML", "createdAt": "..." }
   * ]
   * 
   * @param id - Lead UUID from URL parameter
   */
  @Get(':id/history')
  @ApiOperation({ summary: 'Get scoring history for a lead' })
  async getScoringHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoringService.getScoringHistory(id);
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * GET /api/scoring/:id/comparisons
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * Get all scoring comparisons for a lead.
   * Shows side-by-side results when /compare was called.
   * 
   * @param id - Lead UUID from URL parameter
   */
  @Get(':id/comparisons')
  @ApiOperation({ summary: 'Get scoring comparisons for a lead' })
  async getScoringComparisons(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoringService.getScoringComparisons(id);
  }

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * GET /api/scoring/rules
   * ══════════════════════════════════════════════════════════════════════════
   * 
   * List all active scoring rules from the database.
   * Note: This returns database rules, not the hardcoded DEFAULT_RULES.
   * 
   * @returns Array of ScoringRule records
   */
  @Get('rules')
  @ApiOperation({ summary: 'Get all active scoring rules' })
  async getActiveRules() {
    return this.rulesService.getActiveRules();
  }
}
