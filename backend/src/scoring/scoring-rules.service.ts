/**
 * ============================================================================
 * SCORING RULES SERVICE
 * ============================================================================
 * 
 * This service implements the RULE-BASED scoring approach for leads.
 * 
 * WHAT IS RULE-BASED SCORING?
 * - A deterministic approach where we assign points based on fixed rules
 * - Example: "If lead opened 3 emails, add 15 points"
 * - No machine learning involved - pure if/then logic
 * - Fast, transparent, and easy to understand
 * 
 * HOW IT WORKS:
 * 1. Lead has engagement metrics (emailOpens, websiteVisits, formFills)
 * 2. Each metric gets multiplied by a weight to calculate points
 * 3. Bonus points are added for company size and industry
 * 4. Total score determines category: COLD, WARM, or HOT
 * 
 * SCORING FORMULA:
 * score = (emailOpens × 5) + (websiteVisits × 3) + (formFills × 15)
 *       + companySize bonus + industry bonus
 * 
 * EXAMPLE:
 * Lead with 3 emailOpens, 5 websiteVisits, 1 formFill, SME company, TECH industry:
 * = (3 × 5) + (5 × 3) + (1 × 15) + 10 + 10
 * = 15 + 15 + 15 + 10 + 10 = 55 points → WARM
 * ============================================================================
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreCategory } from '@prisma/client';

/**
 * DEFAULT SCORING RULES
 * ---------------------
 * These weights determine how many points each action is worth.
 * 
 * Why these values?
 * - formFills (15 pts): Highest value - shows strong intent (filled a form)
 * - emailOpens (5 pts): Medium value - engaged with our emails
 * - websiteVisits (3 pts): Lower value - may be casual browsing
 * 
 * maxPoints prevents any single metric from dominating the score
 */
const DEFAULT_RULES = {
  // Engagement metrics: { weight per action, maximum points possible }
  emailOpens: { weight: 5, maxPoints: 25 },      // 5 pts each, max 25 (5 opens)
  websiteVisits: { weight: 3, maxPoints: 30 },   // 3 pts each, max 30 (10 visits)
  formFills: { weight: 15, maxPoints: 45 },      // 15 pts each, max 45 (3 fills)
  
  // Company size bonus points (larger companies = higher deal value potential)
  companySize: {
    STARTUP: 5,      // Smaller budgets, but could grow
    SME: 10,         // Medium budgets, good fit
    ENTERPRISE: 15,  // Large budgets, high value deals
  },
  
  // Industry bonus points (some industries are better fits for our product)
  industry: {
    TECH: 10,           // Best fit - tech-savvy, likely to adopt
    FINANCE: 8,         // Good fit - budget available
    HEALTHCARE: 7,      // Decent fit - growing sector
    RETAIL: 5,          // Average fit
    MANUFACTURING: 5,   // Average fit
    OTHER: 3,           // Unknown - lower priority
  },
};

/**
 * CATEGORY THRESHOLDS
 * -------------------
 * These determine which category a lead falls into based on their score.
 * 
 * Categories help sales teams prioritize:
 * - HOT (≥70): High priority - likely to convert, contact immediately
 * - WARM (≥40): Medium priority - nurture with targeted content
 * - COLD (<40): Low priority - keep in marketing funnel
 */
const CATEGORY_THRESHOLDS = {
  HOT: 70,   // Score >= 70 → HOT lead
  WARM: 40,  // Score >= 40 → WARM lead
  COLD: 0,   // Score < 40 → COLD lead
};

/**
 * Interface defining what the score calculation returns.
 * This helps TypeScript ensure we always return the right shape of data.
 */
export interface RuleScoreResult {
  score: number;           // Total calculated score (0-100+)
  category: ScoreCategory; // COLD | WARM | HOT
  breakdown: {             // Points from each component (for transparency)
    emailOpens: number;
    websiteVisits: number;
    formFills: number;
    companySize: number;
    industry: number;
  };
}

/**
 * @Injectable() marks this class as a service that can be injected into other classes.
 * NestJS's dependency injection system will create a single instance and share it.
 */
@Injectable()
export class ScoringRulesService {
  /**
   * Constructor with dependency injection.
   * PrismaService is automatically injected by NestJS.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * MAIN SCORING FUNCTION
   * ---------------------
   * Calculates a rule-based score for a lead based on their engagement metrics.
   * 
   * @param lead - Object containing lead's engagement data
   * @returns RuleScoreResult with score, category, and detailed breakdown
   */
  calculateScore(lead: {
    emailOpens: number;
    websiteVisits: number;
    formFills: number;
    companySize?: string | null;
    industry?: string | null;
  }): RuleScoreResult {
    
    // Step 1: Calculate points for each engagement metric
    // Math.min ensures we don't exceed the maximum points for each category
    const breakdown = {
      // Email opens: multiply by weight, cap at maxPoints
      // Example: 10 opens × 5 = 50, but capped at 25
      emailOpens: Math.min(
        lead.emailOpens * DEFAULT_RULES.emailOpens.weight,
        DEFAULT_RULES.emailOpens.maxPoints,
      ),
      
      // Website visits: multiply by weight, cap at maxPoints
      websiteVisits: Math.min(
        lead.websiteVisits * DEFAULT_RULES.websiteVisits.weight,
        DEFAULT_RULES.websiteVisits.maxPoints,
      ),
      
      // Form fills: multiply by weight, cap at maxPoints
      formFills: Math.min(
        lead.formFills * DEFAULT_RULES.formFills.weight,
        DEFAULT_RULES.formFills.maxPoints,
      ),
      
      // Company size bonus: lookup in the rules object, default to 0 if not found
      companySize: lead.companySize
        ? DEFAULT_RULES.companySize[lead.companySize] || 0
        : 0,
      
      // Industry bonus: lookup in the rules object, default to 0 if not found
      industry: lead.industry
        ? DEFAULT_RULES.industry[lead.industry] || 0
        : 0,
    };

    // Step 2: Sum all the breakdown values to get total score
    // Object.values() returns [25, 30, 45, 10, 10], then reduce adds them
    const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    // Step 3: Determine category based on thresholds
    const category = this.getCategory(score);

    // Step 4: Return the complete result
    return { score, category, breakdown };
  }

  /**
   * CATEGORY DETERMINATION
   * ----------------------
   * Converts a numeric score into a category label.
   * 
   * @param score - The calculated numeric score
   * @returns ScoreCategory enum value (HOT, WARM, or COLD)
   */
  getCategory(score: number): ScoreCategory {
    if (score >= CATEGORY_THRESHOLDS.HOT) return ScoreCategory.HOT;
    if (score >= CATEGORY_THRESHOLDS.WARM) return ScoreCategory.WARM;
    return ScoreCategory.COLD;
  }

  /**
   * GET ACTIVE RULES FROM DATABASE
   * ------------------------------
   * Retrieves all scoring rules that are currently active.
   * These could be custom rules created by admins to override defaults.
   * 
   * @returns Array of ScoringRule records from the database
   */
  async getActiveRules() {
    return this.prisma.scoringRule.findMany({
      where: { isActive: true },      // Only get rules that are turned on
      orderBy: { category: 'asc' },   // Sort alphabetically by category
    });
  }

  /**
   * CREATE A NEW SCORING RULE
   * -------------------------
   * Allows admins to create custom scoring rules in the database.
   * 
   * @param data - Rule details (name, category, points, description)
   * @returns The newly created ScoringRule record
   */
  async createRule(data: {
    ruleName: string;
    category: string;
    points: number;
    description?: string;
  }) {
    return this.prisma.scoringRule.create({ data });
  }

  /**
   * UPDATE A SCORING RULE
   * ---------------------
   * Allows admins to modify existing rules (change points or deactivate).
   * 
   * @param id - UUID of the rule to update
   * @param data - Fields to update (points and/or isActive)
   * @returns The updated ScoringRule record
   */
  async updateRule(id: string, data: { points?: number; isActive?: boolean }) {
    return this.prisma.scoringRule.update({
      where: { id },
      data,
    });
  }
}