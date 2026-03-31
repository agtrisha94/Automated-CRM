"""
============================================================================
FastAPI Scoring Microservice
============================================================================

Project : Comparative Study of Rule-Based vs Lightweight ML Lead Scoring
          in Low-Resource CRM Systems

This microservice provides THREE scoring approaches:
1. Rule-based scoring   → Deterministic, weighted rules (Week 3)
2. Logistic Regression  → Lightweight ML model (Week 4)
3. Random Forest        → Ensemble ML model (Week 4)

ARCHITECTURE:
┌─────────────────┐         ┌─────────────────┐
│  NestJS Backend │ ──────► │  This Service   │
│  (port 3000)    │  HTTP   │  (port 8000)    │
└─────────────────┘         └─────────────────┘

ENDPOINTS:
- GET  /health         → Health check for Docker
- POST /score/rules    → Rule-based scoring (IMPLEMENTED Week 3)
- POST /score/ml       → Logistic regression (Week 4)
- POST /score/rf       → Random forest (Week 4)
- POST /score/compare  → Compare all methods
- GET  /research/metrics → Research metrics (Week 5)

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Or via Docker Compose:
    docker-compose up -d
============================================================================
"""

import time
from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="CRM Lead Scoring Microservice",
    description=(
        "Compares rule-based, logistic regression, and random forest "
        "lead scoring approaches for CRM lead prioritization research."
    ),
    version="0.2.0",  # Updated for Week 3
)


# ============================================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================
# These define the shape of data going in and out of the API.
# Pydantic validates incoming requests and serializes responses.

class LeadFeatures(BaseModel):
    """
    Input features for scoring a lead.
    
    This matches the Lead model in the NestJS backend.
    All scoring endpoints accept this same input format.
    """
    leadId:        str                    # UUID of the lead
    emailOpens:    int   = 0              # Number of emails opened
    websiteVisits: int   = 0              # Number of website visits
    formFills:     int   = 0              # Number of forms submitted
    companySize:   Optional[str] = None   # STARTUP | SME | ENTERPRISE
    industry:      Optional[str] = None   # TECH | FINANCE | HEALTHCARE | etc.
    status:        Optional[str] = None   # NEW | CONTACTED | QUALIFIED | CONVERTED | LOST
    source:        Optional[str] = None   # FORM | WEBHOOK | MANUAL | IMPORT


class ScoreResult(BaseModel):
    """
    Output from a single scoring method.
    
    Returned by /score/rules, /score/ml, and /score/rf endpoints.
    """
    leadId:    str      # UUID of the scored lead
    score:     float    # Numeric score (0-100 typically)
    category:  str      # COLD | WARM | HOT
    latencyMs: int      # How long scoring took (for research comparison)


class CompareResult(BaseModel):
    """
    Output from comparing all three scoring methods.
    
    This is the KEY research data structure - shows how each method
    performed on the same lead for side-by-side comparison.
    """
    leadId:       str
    ruleScore:    float
    mlScore:      float
    rfScore:      float
    delta:        float   # abs(ruleScore - mlScore) - measures disagreement
    agreement:    bool    # True when all three agree on category
    ruleCategory: str
    mlCategory:   str
    rfCategory:   str
    ruleLatencyMs: int
    mlLatencyMs:   int
    rfLatencyMs:   int


class MetricsResult(BaseModel):
    """
    Aggregated performance metrics for a scoring model.
    
    Used for the research paper's results tables.
    """
    model:        str     # "rules" | "logistic_regression" | "random_forest"
    f1:           float   # F1 score (harmonic mean of precision & recall)
    aucRoc:       float   # Area Under ROC Curve
    precision:    float   # True positives / (True positives + False positives)
    recall:       float   # True positives / (True positives + False negatives)
    avgLatencyMs: float   # Average scoring time in milliseconds
    nSamples:     int     # Number of samples used for metrics


# ============================================================================
# RULE-BASED SCORING ENGINE (Week 3 Implementation)
# ============================================================================
# This is a deterministic scoring approach using weighted rules.
# No machine learning - just if/then logic with predefined weights.

class RuleBasedScorer:
    """
    Rule-Based Lead Scoring Engine
    
    HOW IT WORKS:
    1. Each engagement metric (emailOpens, websiteVisits, formFills) gets
       multiplied by a weight to calculate points
    2. Bonus points are added based on company size and industry
    3. Points are capped at maximums to prevent any single factor dominating
    4. Total score determines category: COLD, WARM, or HOT
    
    SCORING FORMULA:
    score = min(emailOpens × 5, 25) 
          + min(websiteVisits × 3, 30)
          + min(formFills × 15, 45)
          + companySize_bonus
          + industry_bonus
    
    EXAMPLE CALCULATION:
    Lead: 4 email opens, 8 website visits, 2 form fills, SME, TECH
    = min(4×5, 25) + min(8×3, 30) + min(2×15, 45) + 10 + 10
    = 20 + 24 + 30 + 10 + 10
    = 94 points → HOT
    """
    
    # ── Engagement Metric Weights ──────────────────────────────────────────
    # These determine how many points each action is worth
    
    WEIGHTS = {
        # metric: (points_per_action, max_points)
        "emailOpens":    (5, 25),   # 5 pts each, max 25 (caps at 5 opens)
        "websiteVisits": (3, 30),   # 3 pts each, max 30 (caps at 10 visits)
        "formFills":     (15, 45),  # 15 pts each, max 45 (caps at 3 fills)
    }
    
    # ── Company Size Bonus Points ──────────────────────────────────────────
    # Larger companies often have bigger budgets = higher deal value
    
    COMPANY_SIZE_POINTS = {
        "STARTUP":    5,    # Smaller budgets, but growth potential
        "SME":        10,   # Medium budgets, good fit
        "ENTERPRISE": 15,   # Large budgets, high-value deals
    }
    
    # ── Industry Bonus Points ──────────────────────────────────────────────
    # Some industries are better fits for the product
    
    INDUSTRY_POINTS = {
        "TECH":          10,  # Best fit - tech-savvy, likely to adopt
        "FINANCE":       8,   # Good fit - budget available
        "HEALTHCARE":    7,   # Decent fit - growing sector
        "RETAIL":        5,   # Average fit
        "MANUFACTURING": 5,   # Average fit
        "OTHER":         3,   # Unknown - lower priority
    }
    
    # ── Category Thresholds ────────────────────────────────────────────────
    # These determine which bucket a lead falls into based on score
    
    THRESHOLDS = {
        "HOT":  70,   # Score >= 70 → High priority, contact immediately
        "WARM": 40,   # Score >= 40 → Medium priority, nurture
        "COLD": 0,    # Score < 40 → Low priority, keep in funnel
    }
    
    def calculate_score(self, lead: LeadFeatures) -> tuple[float, str, dict]:
        """
        Calculate rule-based score for a lead.
        
        Args:
            lead: LeadFeatures object with engagement metrics
            
        Returns:
            tuple of (score, category, breakdown)
            - score: float, total points (0-100+)
            - category: str, "COLD" | "WARM" | "HOT"
            - breakdown: dict, points from each component
        """
        # Step 1: Calculate engagement points (with caps)
        breakdown = {}
        
        # Email opens: multiply by weight, cap at max
        weight, max_pts = self.WEIGHTS["emailOpens"]
        breakdown["emailOpens"] = min(lead.emailOpens * weight, max_pts)
        
        # Website visits: multiply by weight, cap at max
        weight, max_pts = self.WEIGHTS["websiteVisits"]
        breakdown["websiteVisits"] = min(lead.websiteVisits * weight, max_pts)
        
        # Form fills: multiply by weight, cap at max
        weight, max_pts = self.WEIGHTS["formFills"]
        breakdown["formFills"] = min(lead.formFills * weight, max_pts)
        
        # Step 2: Add company size bonus (if provided)
        breakdown["companySize"] = (
            self.COMPANY_SIZE_POINTS.get(lead.companySize, 0)
            if lead.companySize else 0
        )
        
        # Step 3: Add industry bonus (if provided)
        breakdown["industry"] = (
            self.INDUSTRY_POINTS.get(lead.industry, 0)
            if lead.industry else 0
        )
        
        # Step 4: Sum all points
        score = sum(breakdown.values())
        
        # Step 5: Determine category based on thresholds
        category = self._get_category(score)
        
        return score, category, breakdown
    
    def _get_category(self, score: float) -> str:
        """Convert numeric score to category label."""
        if score >= self.THRESHOLDS["HOT"]:
            return "HOT"
        elif score >= self.THRESHOLDS["WARM"]:
            return "WARM"
        else:
            return "COLD"


# Create a singleton instance of the rule-based scorer
rule_scorer = RuleBasedScorer()


# ============================================================================
# ML SCORING STUBS (Week 4 Implementation)
# ============================================================================
# These will be implemented in Week 4 with actual trained models.

class MLScorer:
    """
    Machine Learning Scorer (Logistic Regression)
    
    STUB for Week 4 - will be implemented with:
    - scikit-learn LogisticRegression model
    - Trained on synthetic_leads_sigma10.json
    - Features: emailOpens, websiteVisits, formFills, companySize, industry
    - Target: actuallyConverted (binary)
    """
    
    def __init__(self):
        self.model = None  # Will load trained model in Week 4
    
    def predict(self, lead: LeadFeatures) -> tuple[float, str]:
        """
        Predict conversion probability using logistic regression.
        
        Week 4 implementation will:
        1. Transform lead features into model input
        2. Call model.predict_proba() for probability
        3. Scale to 0-100 score
        4. Map to category
        
        For now, returns a simple heuristic based on engagement.
        """
        # Temporary heuristic until model is trained
        # This gives slightly different results than rules for testing
        base_score = (
            lead.emailOpens * 4.5 +
            lead.websiteVisits * 2.8 +
            lead.formFills * 14
        )
        
        # Add some variation for company size
        size_bonus = {"STARTUP": 6, "SME": 11, "ENTERPRISE": 16}.get(
            lead.companySize, 0
        )
        
        score = min(base_score + size_bonus, 100)
        category = "HOT" if score >= 70 else "WARM" if score >= 40 else "COLD"
        
        return score, category


class RandomForestScorer:
    """
    Random Forest Scorer
    
    STUB for Week 4 - will be implemented with:
    - scikit-learn RandomForestClassifier
    - Same training data as ML scorer
    - Expected to have different accuracy/latency tradeoffs
    """
    
    def __init__(self):
        self.model = None  # Will load trained model in Week 4
    
    def predict(self, lead: LeadFeatures) -> tuple[float, str]:
        """
        Predict conversion probability using random forest.
        
        Week 4 implementation will use actual trained model.
        For now, returns a simple heuristic.
        """
        # Temporary heuristic with different weights
        base_score = (
            lead.emailOpens * 5.2 +
            lead.websiteVisits * 3.1 +
            lead.formFills * 13.5
        )
        
        # Different industry weighting for variety
        industry_bonus = {
            "TECH": 12, "FINANCE": 9, "HEALTHCARE": 8,
            "RETAIL": 6, "MANUFACTURING": 5, "OTHER": 4
        }.get(lead.industry, 0)
        
        score = min(base_score + industry_bonus, 100)
        category = "HOT" if score >= 70 else "WARM" if score >= 40 else "COLD"
        
        return score, category


# Create singleton instances
ml_scorer = MLScorer()
rf_scorer = RandomForestScorer()


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health", tags=["System"])
def health():
    """
    Service liveness check.
    
    Used by:
    - Docker Compose healthcheck
    - Kubernetes liveness probes
    - Load balancer health checks
    
    Returns:
        dict with status, version, and current implementation week
    """
    return {
        "status": "ok",
        "version": "0.2.0",
        "week": 3,
        "features": {
            "rules": "implemented",
            "ml": "stub",
            "rf": "stub",
        }
    }


@app.post(
    "/score/rules",
    response_model=ScoreResult,
    tags=["Scoring"],
    summary="Rule-based scoring (Week 3)",
)
def score_rules(lead: LeadFeatures):
    """
    Score a lead using deterministic rule-based engine.
    
    This is the IMPLEMENTED Week 3 feature.
    
    HOW IT WORKS:
    1. Calculate points from engagement metrics (capped)
    2. Add bonus points for company size and industry
    3. Sum total score
    4. Map to category (COLD/WARM/HOT)
    
    Args:
        lead: LeadFeatures with engagement data
        
    Returns:
        ScoreResult with score, category, and latency
        
    Example:
        POST /score/rules
        {"leadId": "abc", "emailOpens": 5, "websiteVisits": 10, "formFills": 2}
        
        Response:
        {"leadId": "abc", "score": 85, "category": "HOT", "latencyMs": 1}
    """
    # Start timing for latency measurement
    start_time = time.perf_counter()
    
    # Calculate score using rule engine
    score, category, breakdown = rule_scorer.calculate_score(lead)
    
    # Calculate latency in milliseconds
    latency_ms = int((time.perf_counter() - start_time) * 1000)
    
    return ScoreResult(
        leadId=lead.leadId,
        score=score,
        category=category,
        latencyMs=latency_ms,
    )


@app.post(
    "/score/ml",
    response_model=ScoreResult,
    tags=["Scoring"],
    summary="Logistic regression scoring (Week 4)",
)
def score_ml(lead: LeadFeatures):
    """
    Score a lead using logistic regression ML model.
    
    WEEK 4 IMPLEMENTATION - Currently returns heuristic placeholder.
    
    Will be trained on synthetic_leads_sigma10.json data with
    features: emailOpens, websiteVisits, formFills, companySize, industry
    target: actuallyConverted
    
    Args:
        lead: LeadFeatures with engagement data
        
    Returns:
        ScoreResult with ML-predicted score and category
    """
    start_time = time.perf_counter()
    
    score, category = ml_scorer.predict(lead)
    
    latency_ms = int((time.perf_counter() - start_time) * 1000)
    
    return ScoreResult(
        leadId=lead.leadId,
        score=score,
        category=category,
        latencyMs=latency_ms,
    )


@app.post(
    "/score/rf",
    response_model=ScoreResult,
    tags=["Scoring"],
    summary="Random forest scoring (Week 4)",
)
def score_rf(lead: LeadFeatures):
    """
    Score a lead using random forest ML model.
    
    WEEK 4 IMPLEMENTATION - Currently returns heuristic placeholder.
    
    Random forest typically:
    - Higher accuracy than logistic regression
    - Higher latency (more computation)
    - Better handles non-linear relationships
    
    Args:
        lead: LeadFeatures with engagement data
        
    Returns:
        ScoreResult with RF-predicted score and category
    """
    start_time = time.perf_counter()
    
    score, category = rf_scorer.predict(lead)
    
    latency_ms = int((time.perf_counter() - start_time) * 1000)
    
    return ScoreResult(
        leadId=lead.leadId,
        score=score,
        category=category,
        latencyMs=latency_ms,
    )


@app.post(
    "/score/compare",
    response_model=CompareResult,
    tags=["Scoring"],
    summary="Compare all three scoring methods",
)
def score_compare(lead: LeadFeatures):
    """
    Run all three scoring methods and return comparison.
    
    This is the KEY RESEARCH ENDPOINT.
    
    It allows comparing:
    - Score differences (delta)
    - Category agreement
    - Latency differences
    
    The NestJS backend calls this and saves results to
    the scoring_comparisons table for analysis.
    
    Args:
        lead: LeadFeatures with engagement data
        
    Returns:
        CompareResult with all three scores and metadata
        
    Example Response:
        {
            "leadId": "abc",
            "ruleScore": 75,
            "mlScore": 72.5,
            "rfScore": 78.3,
            "delta": 2.5,
            "agreement": true,
            "ruleCategory": "HOT",
            "mlCategory": "HOT",
            "rfCategory": "HOT",
            "ruleLatencyMs": 1,
            "mlLatencyMs": 3,
            "rfLatencyMs": 5
        }
    """
    # ── Score with Rules ──────────────────────────────────────────────────
    rule_start = time.perf_counter()
    rule_score, rule_category, _ = rule_scorer.calculate_score(lead)
    rule_latency = int((time.perf_counter() - rule_start) * 1000)
    
    # ── Score with ML (Logistic Regression) ───────────────────────────────
    ml_start = time.perf_counter()
    ml_score, ml_category = ml_scorer.predict(lead)
    ml_latency = int((time.perf_counter() - ml_start) * 1000)
    
    # ── Score with Random Forest ──────────────────────────────────────────
    rf_start = time.perf_counter()
    rf_score, rf_category = rf_scorer.predict(lead)
    rf_latency = int((time.perf_counter() - rf_start) * 1000)
    
    # ── Calculate comparison metrics ──────────────────────────────────────
    # Delta: absolute difference between rule and ML scores
    delta = abs(rule_score - ml_score)
    
    # Agreement: do all three methods agree on the category?
    agreement = (rule_category == ml_category == rf_category)
    
    return CompareResult(
        leadId=lead.leadId,
        ruleScore=rule_score,
        mlScore=ml_score,
        rfScore=rf_score,
        delta=delta,
        agreement=agreement,
        ruleCategory=rule_category,
        mlCategory=ml_category,
        rfCategory=rf_category,
        ruleLatencyMs=rule_latency,
        mlLatencyMs=ml_latency,
        rfLatencyMs=rf_latency,
    )


@app.get(
    "/research/metrics",
    response_model=list[MetricsResult],
    tags=["Research"],
    summary="Aggregated metrics for research paper (Week 5)",
)
def research_metrics():
    """
    Get aggregated performance metrics for all scoring models.
    
    WEEK 5 IMPLEMENTATION - Currently returns placeholders.
    
    Will calculate from scoring_comparisons table:
    - F1 Score (harmonic mean of precision and recall)
    - AUC-ROC (model's ability to distinguish classes)
    - Precision (of predicted positives, how many are correct)
    - Recall (of actual positives, how many were found)
    - Average latency
    
    These metrics feed directly into the research paper tables.
    
    Returns:
        List of MetricsResult for each model
    """
    # Placeholder metrics - will be calculated from database in Week 5
    return [
        MetricsResult(
            model="rules",
            f1=0.0,
            aucRoc=0.0,
            precision=0.0,
            recall=0.0,
            avgLatencyMs=0.0,
            nSamples=0,
        ),
        MetricsResult(
            model="logistic_regression",
            f1=0.0,
            aucRoc=0.0,
            precision=0.0,
            recall=0.0,
            avgLatencyMs=0.0,
            nSamples=0,
        ),
        MetricsResult(
            model="random_forest",
            f1=0.0,
            aucRoc=0.0,
            precision=0.0,
            recall=0.0,
            avgLatencyMs=0.0,
            nSamples=0,
        ),
    ]


# ============================================================================
# DEBUG ENDPOINT (Development Only)
# ============================================================================

@app.post("/debug/breakdown", tags=["Debug"])
def debug_breakdown(lead: LeadFeatures):
    """
    Show detailed scoring breakdown for debugging.
    
    Useful for understanding why a lead got a particular score.
    Shows points from each component.
    
    Args:
        lead: LeadFeatures with engagement data
        
    Returns:
        Detailed breakdown of score calculation
    """
    score, category, breakdown = rule_scorer.calculate_score(lead)
    
    return {
        "leadId": lead.leadId,
        "input": {
            "emailOpens": lead.emailOpens,
            "websiteVisits": lead.websiteVisits,
            "formFills": lead.formFills,
            "companySize": lead.companySize,
            "industry": lead.industry,
        },
        "breakdown": breakdown,
        "totalScore": score,
        "category": category,
        "thresholds": RuleBasedScorer.THRESHOLDS,
    }
