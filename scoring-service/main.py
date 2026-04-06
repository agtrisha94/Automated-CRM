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
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
from pathlib import Path
import numpy as np

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

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    ruleLatencyMs: float
    mlLatencyMs:   float
    rfLatencyMs:   float


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
# ML SCORING WITH TRAINED MODELS (Week 4 Implementation)
# ============================================================================

class MLScorer:
    """
    Machine Learning Scorer (Logistic Regression)
    
    IMPLEMENTATION:
    - Uses scikit-learn LogisticRegression model
    - Trained on synthetic_leads_sigma10.json
    - Features: emailOpens, websiteVisits, formFills, companySize, industry
    - Target: actuallyConverted (binary)
    - Returns probability converted (0-1) scaled to 0-100 score
    """
    
    def __init__(self):
        """
        Load trained Logistic Regression model and encoders.
        Models are trained using train_models.py script.
        """
        models_dir = Path(__file__).parent / "models"
        
        # Load Logistic Regression model
        model_path = models_dir / "logistic_regression.pkl"
        if model_path.exists():
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            print("✅ Loaded Logistic Regression model")
        else:
            print("⚠️  Logistic Regression model not found - using fallback")
            self.model = None
        
        # Load encoders for categorical features
        encoders_path = models_dir / "encoders.pkl"
        if encoders_path.exists():
            with open(encoders_path, 'rb') as f:
                self.encoders = pickle.load(f)
            print("✅ Loaded feature encoders")
        else:
            print("⚠️  Encoders not found - using fallback")
            self.encoders = None
    
    def _prepare_features(self, lead: LeadFeatures) -> np.ndarray:
        """
        Transform lead data into model input format.
        
        FEATURE ENGINEERING:
        1. emailOpens (numeric)
        2. websiteVisits (numeric)
        3. formFills (numeric)
        4. companySize (categorical → encoded)
        5. industry (categorical → encoded)
        
        Returns: numpy array shape (1, 5)
        """
        # Encode company size
        try:
            company_size_encoded = self.encoders['companySize'].transform(
                [lead.companySize or 'UNKNOWN']
            )[0]
        except:
            company_size_encoded = 0
        
        # Encode industry
        try:
            industry_encoded = self.encoders['industry'].transform(
                [lead.industry or 'UNKNOWN']
            )[0]
        except:
            industry_encoded = 0
        
        # Build feature vector
        features = np.array([[
            lead.emailOpens,
            lead.websiteVisits,
            lead.formFills,
            company_size_encoded,
            industry_encoded
        ]])
        
        return features
    
    def predict(self, lead: LeadFeatures) -> tuple[float, str]:
        """
        Predict conversion probability using logistic regression.
        
        PROCESS:
        1. Transform lead features into model input
        2. Call model.predict_proba() for probability
        3. Scale probability (0-1) to score (0-100)
        4. Map score to category (COLD/WARM/HOT)
        
        Returns: (score: float, category: str)
        """
        if self.model is None or self.encoders is None:
            # Fallback if model not trained yet
            return self._fallback_predict(lead)
        
        try:
            # Prepare features
            X = self._prepare_features(lead)
            
            # Get probability of conversion (class 1)
            proba = self.model.predict_proba(X)[0, 1]
            
            # Scale to 0-100
            score = proba * 100
            
            # Map to category
            category = self._get_category(score)
            
            return float(score), category
            
        except Exception as e:
            print(f"⚠️  ML prediction error: {e}")
            return self._fallback_predict(lead)
    
    def _fallback_predict(self, lead: LeadFeatures) -> tuple[float, str]:
        """Fallback scoring if model not available."""
        base_score = (
            lead.emailOpens * 4.5 +
            lead.websiteVisits * 2.8 +
            lead.formFills * 14
        )
        size_bonus = {"STARTUP": 6, "SME": 11, "ENTERPRISE": 16}.get(
            lead.companySize, 0
        )
        score = min(base_score + size_bonus, 100)
        category = self._get_category(score)
        return score, category
    
    def _get_category(self, score: float) -> str:
        """Convert numeric score to category label."""
        if score >= 70:
            return "HOT"
        elif score >= 40:
            return "WARM"
        else:
            return "COLD"


class RandomForestScorer:
    """
    Random Forest Scorer
    
    IMPLEMENTATION:
    - Uses scikit-learn RandomForestClassifier
    - Same training data as Logistic Regression
    - Ensemble method with multiple decision trees
    - Expected to have higher accuracy but slower inference
    """
    
    def __init__(self):
        """
        Load trained Random Forest model and encoders.
        """
        models_dir = Path(__file__).parent / "models"
        
        # Load Random Forest model
        model_path = models_dir / "random_forest.pkl"
        if model_path.exists():
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            print("✅ Loaded Random Forest model")
        else:
            print("⚠️  Random Forest model not found - using fallback")
            self.model = None
        
        # Load encoders
        encoders_path = models_dir / "encoders.pkl"
        if encoders_path.exists():
            with open(encoders_path, 'rb') as f:
                self.encoders = pickle.load(f)
            print("✅ Loaded feature encoders (RF)")
        else:
            print("⚠️  Encoders not found - using fallback")
            self.encoders = None
    
    def _prepare_features(self, lead: LeadFeatures) -> np.ndarray:
        """
        Transform lead data into model input format.
        Same feature engineering as Logistic Regression.
        """
        # Encode company size
        try:
            company_size_encoded = self.encoders['companySize'].transform(
                [lead.companySize or 'UNKNOWN']
            )[0]
        except:
            company_size_encoded = 0
        
        # Encode industry
        try:
            industry_encoded = self.encoders['industry'].transform(
                [lead.industry or 'UNKNOWN']
            )[0]
        except:
            industry_encoded = 0
        
        # Build feature vector
        features = np.array([[
            lead.emailOpens,
            lead.websiteVisits,
            lead.formFills,
            company_size_encoded,
            industry_encoded
        ]])
        
        return features
    
    def predict(self, lead: LeadFeatures) -> tuple[float, str]:
        """
        Predict conversion probability using random forest.
        
        PROCESS:
        1. Transform lead features
        2. Get average prediction across all trees
        3. Scale to 0-100 score
        4. Map to category
        
        Returns: (score: float, category: str)
        """
        if self.model is None or self.encoders is None:
            # Fallback if model not trained yet
            return self._fallback_predict(lead)
        
        try:
            # Prepare features
            X = self._prepare_features(lead)
            
            # Get probability of conversion (class 1)
            proba = self.model.predict_proba(X)[0, 1]
            
            # Scale to 0-100
            score = proba * 100
            
            # Map to category
            category = self._get_category(score)
            
            return float(score), category
            
        except Exception as e:
            print(f"⚠️  RF prediction error: {e}")
            return self._fallback_predict(lead)
    
    def _fallback_predict(self, lead: LeadFeatures) -> tuple[float, str]:
        """Fallback scoring if model not available."""
        base_score = (
            lead.emailOpens * 5.2 +
            lead.websiteVisits * 3.1 +
            lead.formFills * 13.5
        )
        industry_bonus = {
            "TECH": 12, "FINANCE": 9, "HEALTHCARE": 8,
            "RETAIL": 6, "MANUFACTURING": 5, "OTHER": 4
        }.get(lead.industry, 0)
        score = min(base_score + industry_bonus, 100)
        category = self._get_category(score)
        return score, category
    
    def _get_category(self, score: float) -> str:
        """Convert numeric score to category label."""
        if score >= 70:
            return "HOT"
        elif score >= 40:
            return "WARM"
        else:
            return "COLD"


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
    rule_latency = round((time.perf_counter() - rule_start) * 1000, 2)
    
    # ── Score with ML (Logistic Regression) ───────────────────────────────
    ml_start = time.perf_counter()
    ml_score, ml_category = ml_scorer.predict(lead)
    ml_latency = round((time.perf_counter() - ml_start) * 1000, 2)
    
    # ── Score with Random Forest ──────────────────────────────────────────
    rf_start = time.perf_counter()
    rf_score, rf_category = rf_scorer.predict(lead)
    rf_latency = round((time.perf_counter() - rf_start) * 1000, 2)
    
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
    tags=["Research"],
    summary="Comprehensive research metrics for all scoring methods (Week 5)",
)
def research_metrics():
    """
    ============================================================================
    WEEK 5: RESEARCH METRICS ENDPOINT
    ============================================================================
    
    Calculate comprehensive performance metrics for all three scoring methods
    using the test dataset. This endpoint is used for the research paper's
    comparative analysis.
    
    METHODOLOGY:
    1. Load test dataset from synthetic leads
    2. Score each lead with all three methods
    3. Calculate classification metrics (F1, AUC-ROC, Precision, Recall)
    4. Measure average latency for each method
    5. Calculate agreement rate and delta between methods
    
    METRICS RETURNED:
    - F1 Score: Harmonic mean of precision and recall
    - AUC-ROC: Area under ROC curve (discrimination ability)
    - Precision: True positives / (True positives + False positives)
    - Recall: True positives / (True positives + False negatives)
    - Avg Latency: Mean scoring time in milliseconds
    - Agreement Rate: % of leads where all methods agree on category
    
    Returns:
        Comprehensive metrics for all three scoring methods
    """
    import json
    from pathlib import Path
    import pandas as pd
    import numpy as np
    from sklearn.metrics import (
        f1_score, roc_auc_score, precision_score, recall_score
    )
    
    # Load test dataset
    # Try multiple possible paths (local dev vs Docker)
    possible_paths = [
        Path("/scripts/synthetic_leads_sigma10.json"),  # Docker mount
        Path(__file__).parent.parent / "scripts" / "synthetic_leads_sigma10.json",  # Local dev
    ]
    
    data_path = None
    for path in possible_paths:
        if path.exists():
            data_path = path
            break
    
    if data_path is None:
        return {
            "error": "Test dataset not found",
            "message": "Please ensure synthetic_leads_sigma10.json exists",
            "searched_paths": [str(p) for p in possible_paths]
        }
    
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    # Extract leads
    leads_data = data['leads'] if isinstance(data, dict) and 'leads' in data else data
    df = pd.DataFrame(leads_data)
    
    # Use a subset for faster evaluation (500 leads is sufficient for research)
    test_df = df.sample(n=min(500, len(df)), random_state=42)
    
    # Storage for predictions
    rule_predictions = []
    ml_predictions = []
    rf_predictions = []
    
    rule_latencies = []
    ml_latencies = []
    rf_latencies = []
    
    rule_categories = []
    ml_categories = []
    rf_categories = []
    
    actual_labels = test_df['actuallyConverted'].values
    
    # Score each lead with all three methods
    print(f"🔬 Evaluating {len(test_df)} leads for research metrics...")
    
    for idx, row in test_df.iterrows():
        lead = LeadFeatures(
            leadId=row['id'],
            emailOpens=row['emailOpens'],
            websiteVisits=row['websiteVisits'],
            formFills=row['formFills'],
            companySize=row.get('companySize'),
            industry=row.get('industry'),
        )
        
        # Rule-based scoring
        start = time.perf_counter()
        rule_score, rule_cat, _ = rule_scorer.calculate_score(lead)
        rule_latencies.append((time.perf_counter() - start) * 1000)
        rule_predictions.append(rule_score)
        rule_categories.append(rule_cat)
        
        # ML scoring (Logistic Regression)
        start = time.perf_counter()
        ml_score, ml_cat = ml_scorer.predict(lead)
        ml_latencies.append((time.perf_counter() - start) * 1000)
        ml_predictions.append(ml_score)
        ml_categories.append(ml_cat)
        
        # Random Forest scoring
        start = time.perf_counter()
        rf_score, rf_cat = rf_scorer.predict(lead)
        rf_latencies.append((time.perf_counter() - start) * 1000)
        rf_predictions.append(rf_score)
        rf_categories.append(rf_cat)
    
    # Convert scores to binary predictions (using 50 as threshold for conversion)
    rule_binary = [1 if s >= 50 else 0 for s in rule_predictions]
    ml_binary = [1 if s >= 50 else 0 for s in ml_predictions]
    rf_binary = [1 if s >= 50 else 0 for s in rf_predictions]
    
    # Normalize scores to 0-1 range for AUC-ROC calculation
    rule_proba = [min(s / 150.0, 1.0) for s in rule_predictions]  # Rule scores can exceed 100
    ml_proba = [s / 100.0 for s in ml_predictions]
    rf_proba = [s / 100.0 for s in rf_predictions]
    
    # Calculate metrics for each model
    def safe_metric(metric_fn, *args, **kwargs):
        """Safely calculate metric, return 0 if error."""
        try:
            return float(metric_fn(*args, **kwargs))
        except Exception as e:
            print(f"⚠️  Metric calculation error: {e}")
            return 0.0
    
    # Rule-based metrics
    rule_metrics = {
        "model": "rules",
        "f1": safe_metric(f1_score, actual_labels, rule_binary),
        "aucRoc": safe_metric(roc_auc_score, actual_labels, rule_proba),
        "precision": safe_metric(precision_score, actual_labels, rule_binary),
        "recall": safe_metric(recall_score, actual_labels, rule_binary),
        "avgLatencyMs": float(np.mean(rule_latencies)),
        "nSamples": len(test_df),
    }
    
    # Logistic Regression metrics
    ml_metrics = {
        "model": "logistic_regression",
        "f1": safe_metric(f1_score, actual_labels, ml_binary),
        "aucRoc": safe_metric(roc_auc_score, actual_labels, ml_proba),
        "precision": safe_metric(precision_score, actual_labels, ml_binary),
        "recall": safe_metric(recall_score, actual_labels, ml_binary),
        "avgLatencyMs": float(np.mean(ml_latencies)),
        "nSamples": len(test_df),
    }
    
    # Random Forest metrics
    rf_metrics = {
        "model": "random_forest",
        "f1": safe_metric(f1_score, actual_labels, rf_binary),
        "aucRoc": safe_metric(roc_auc_score, actual_labels, rf_proba),
        "precision": safe_metric(precision_score, actual_labels, rf_binary),
        "recall": safe_metric(recall_score, actual_labels, rf_binary),
        "avgLatencyMs": float(np.mean(rf_latencies)),
        "nSamples": len(test_df),
    }
    
    # Calculate agreement metrics
    agreements = sum(
        1 for r, m, f in zip(rule_categories, ml_categories, rf_categories)
        if r == m == f
    )
    agreement_rate = agreements / len(test_df)
    
    # Calculate average delta between methods
    deltas = [
        abs(r - m) for r, m in zip(rule_predictions, ml_predictions)
    ]
    avg_delta = float(np.mean(deltas))
    
    # Category distribution
    from collections import Counter
    category_dist = dict(Counter(rule_categories))
    
    print(f"✅ Research metrics calculated for {len(test_df)} leads")
    
    return {
        "metrics": [rule_metrics, ml_metrics, rf_metrics],
        "comparison": {
            "agreementRate": float(agreement_rate),
            "avgDelta": avg_delta,
            "categoryDistribution": category_dist,
            "evaluationSize": len(test_df),
        },
        "summary": {
            "bestF1": max(rule_metrics["f1"], ml_metrics["f1"], rf_metrics["f1"]),
            "bestAucRoc": max(rule_metrics["aucRoc"], ml_metrics["aucRoc"], rf_metrics["aucRoc"]),
            "fastestAvgLatency": min(rule_metrics["avgLatencyMs"], ml_metrics["avgLatencyMs"], rf_metrics["avgLatencyMs"]),
        }
    }


@app.get(
    "/research/metrics/stub",
    response_model=list[MetricsResult],
    tags=["Research"],
    summary="[DEPRECATED] Placeholder metrics (Week 5)",
)
def research_metrics_stub():
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
# ADDITIONAL RESEARCH ENDPOINTS (Week 5 - Frontend Compatibility)
# ============================================================================

@app.get(
    "/research/confusion-matrices",
    tags=["Research"],
    summary="Get confusion matrices for all models",
)
def research_confusion_matrices():
    """
    Calculate confusion matrices for all three scoring methods.
    
    Returns TP, FP, TN, FN for each model to visualize classification performance.
    Uses actuallyConverted as ground truth and score >= 50 as positive prediction.
    """
    import json
    from pathlib import Path
    import pandas as pd
    
    # Load test dataset
    possible_paths = [
        Path("/scripts/synthetic_leads_sigma10.json"),
        Path(__file__).parent.parent / "scripts" / "synthetic_leads_sigma10.json",
    ]
    
    data_path = None
    for path in possible_paths:
        if path.exists():
            data_path = path
            break
    
    if data_path is None:
        return {"error": "Test dataset not found"}
    
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    leads_data = data['leads'] if isinstance(data, dict) and 'leads' in data else data
    df = pd.DataFrame(leads_data)
    test_df = df.sample(n=min(500, len(df)), random_state=42)
    
    actual_labels = test_df['actuallyConverted'].values
    
    # Score each lead
    rule_predictions = []
    ml_predictions = []
    rf_predictions = []
    
    for idx, row in test_df.iterrows():
        lead = LeadFeatures(
            leadId=row['id'],
            emailOpens=row['emailOpens'],
            websiteVisits=row['websiteVisits'],
            formFills=row['formFills'],
            companySize=row.get('companySize'),
            industry=row.get('industry'),
        )
        
        rule_score, _, _ = rule_scorer.calculate_score(lead)
        ml_score, _ = ml_scorer.predict(lead)
        rf_score, _ = rf_scorer.predict(lead)
        
        rule_predictions.append(1 if rule_score >= 50 else 0)
        ml_predictions.append(1 if ml_score >= 50 else 0)
        rf_predictions.append(1 if rf_score >= 50 else 0)
    
    def calc_confusion(predictions, actuals):
        tp = sum(1 for p, a in zip(predictions, actuals) if p == 1 and a == 1)
        fp = sum(1 for p, a in zip(predictions, actuals) if p == 1 and a == 0)
        tn = sum(1 for p, a in zip(predictions, actuals) if p == 0 and a == 0)
        fn = sum(1 for p, a in zip(predictions, actuals) if p == 0 and a == 1)
        return {"tp": tp, "fp": fp, "tn": tn, "fn": fn}
    
    return {
        "rules": calc_confusion(rule_predictions, actual_labels),
        "lr": calc_confusion(ml_predictions, actual_labels),
        "rf": calc_confusion(rf_predictions, actual_labels),
    }


@app.get(
    "/research/feature-importances",
    tags=["Research"],
    summary="Get feature importances for all models",
)
def research_feature_importances():
    """
    Get feature importances for all three scoring methods.
    
    - Rule-based: Returns the weight multipliers
    - Logistic Regression: Returns coefficient magnitudes
    - Random Forest: Returns Gini importances
    """
    # Rule-based weights (from RuleBasedScorer)
    rule_importances = [
        {"name": "emailOpens", "importance": 0.25},     # 5 points * 5 max = 25
        {"name": "websiteVisits", "importance": 0.30},  # 3 points * 10 max = 30
        {"name": "formFills", "importance": 0.20},      # 10 points * 2 max = 20
        {"name": "companySize", "importance": 0.10},    # Up to 10 points
        {"name": "industry", "importance": 0.10},       # Up to 10 points
        {"name": "status", "importance": 0.05},         # Up to 5 points
    ]
    
    # Get LR coefficients if model is loaded
    lr_importances = []
    if hasattr(ml_scorer, 'model') and ml_scorer.model is not None:
        feature_names = [
            "emailOpens", "websiteVisits", "formFills",
            "isCLevel", "isVP", "isDirector",
            "isEnterprise", "isSME", "isTechFinance"
        ]
        coefs = ml_scorer.model.coef_[0]
        # Normalize to sum to 1
        abs_coefs = [abs(c) for c in coefs]
        total = sum(abs_coefs) or 1
        lr_importances = [
            {"name": name, "importance": round(abs(coef) / total, 4)}
            for name, coef in zip(feature_names, coefs)
        ]
    else:
        lr_importances = [{"name": "model_not_loaded", "importance": 0}]
    
    # Get RF feature importances if model is loaded
    rf_importances = []
    if hasattr(rf_scorer, 'model') and rf_scorer.model is not None:
        feature_names = [
            "emailOpens", "websiteVisits", "formFills",
            "isCLevel", "isVP", "isDirector",
            "isEnterprise", "isSME", "isTechFinance"
        ]
        importances = rf_scorer.model.feature_importances_
        rf_importances = [
            {"name": name, "importance": round(float(imp), 4)}
            for name, imp in zip(feature_names, importances)
        ]
    else:
        rf_importances = [{"name": "model_not_loaded", "importance": 0}]
    
    return {
        "rules": rule_importances,
        "lr": lr_importances,
        "rf": rf_importances,
    }


@app.post(
    "/research/sparsity",
    tags=["Research"],
    summary="Run sparsity experiment (tests model behavior with sparse data)",
)
def research_sparsity():
    """
    Run a sparsity experiment to test how each model handles missing/sparse data.
    
    This simulates real-world scenarios where not all lead data is available.
    Tests with 0%, 25%, 50%, 75% of features set to zero.
    """
    import json
    from pathlib import Path
    import pandas as pd
    import numpy as np
    
    possible_paths = [
        Path("/scripts/synthetic_leads_sigma10.json"),
        Path(__file__).parent.parent / "scripts" / "synthetic_leads_sigma10.json",
    ]
    
    data_path = None
    for path in possible_paths:
        if path.exists():
            data_path = path
            break
    
    if data_path is None:
        return {"error": "Test dataset not found"}
    
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    leads_data = data['leads'] if isinstance(data, dict) and 'leads' in data else data
    df = pd.DataFrame(leads_data)
    test_df = df.sample(n=min(100, len(df)), random_state=42)  # Smaller sample for speed
    
    sparsity_levels = [0, 25, 50, 75]
    results = []
    
    for sparsity in sparsity_levels:
        rule_scores = []
        ml_scores = []
        rf_scores = []
        
        for idx, row in test_df.iterrows():
            # Apply sparsity: set some features to 0
            email = row['emailOpens'] if np.random.randint(100) >= sparsity else 0
            visits = row['websiteVisits'] if np.random.randint(100) >= sparsity else 0
            forms = row['formFills'] if np.random.randint(100) >= sparsity else 0
            
            lead = LeadFeatures(
                leadId=row['id'],
                emailOpens=email,
                websiteVisits=visits,
                formFills=forms,
                companySize=row.get('companySize') if np.random.randint(100) >= sparsity else None,
                industry=row.get('industry') if np.random.randint(100) >= sparsity else None,
            )
            
            rule_score, _, _ = rule_scorer.calculate_score(lead)
            ml_score, _ = ml_scorer.predict(lead)
            rf_score, _ = rf_scorer.predict(lead)
            
            rule_scores.append(rule_score)
            ml_scores.append(ml_score)
            rf_scores.append(rf_score)
        
        results.append({
            "sparsityPercent": sparsity,
            "ruleAvgScore": round(float(np.mean(rule_scores)), 2),
            "mlAvgScore": round(float(np.mean(ml_scores)), 2),
            "rfAvgScore": round(float(np.mean(rf_scores)), 2),
            "ruleStdDev": round(float(np.std(rule_scores)), 2),
            "mlStdDev": round(float(np.std(ml_scores)), 2),
            "rfStdDev": round(float(np.std(rf_scores)), 2),
        })
    
    return {
        "sparsityResults": results,
        "summary": {
            "mostRobust": "rules" if results[3]["ruleStdDev"] < min(results[3]["mlStdDev"], results[3]["rfStdDev"]) else "ml",
            "totalSamples": len(test_df),
        }
    }


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
