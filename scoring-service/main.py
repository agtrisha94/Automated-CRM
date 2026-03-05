"""
FastAPI Scoring Microservice — Week 1 Stub
==========================================
Project : Comparative Study of Rule-Based vs Lightweight ML Lead Scoring
          in Low-Resource CRM Systems

Week 1 deliverable: /health endpoint + placeholder route stubs
Full implementation: Week 4 (rule engine, logistic regression, random forest)

Run locally:
    pip3 install fastapi uvicorn
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Or via Docker Compose:
    docker-compose up -d
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="CRM Lead Scoring Microservice",
    description=(
        "Compares rule-based, logistic regression, and random forest "
        "lead scoring approaches. Week 1 stub — models not yet trained."
    ),
    version="0.1.0",
)


# ── Request / Response models ────────────────────────────────────────────────

class LeadFeatures(BaseModel):
    """Input features used by all scoring models."""
    leadId:        str
    emailOpens:    int   = 0
    websiteVisits: int   = 0
    formFills:     int   = 0
    companySize:   Optional[str] = None   # STARTUP | SME | ENTERPRISE
    industry:      Optional[str] = None
    status:        Optional[str] = None   # NEW | CONTACTED | QUALIFIED | CONVERTED | LOST
    source:        Optional[str] = None


class ScoreResult(BaseModel):
    leadId:    str
    score:     float
    category:  str    # COLD | WARM | HOT
    latencyMs: int


class CompareResult(BaseModel):
    leadId:       str
    ruleScore:    float
    mlScore:      float
    rfScore:      float
    delta:        float   # abs(ruleScore - mlScore)
    agreement:    bool    # True when all three agree on category
    ruleCategory: str
    mlCategory:   str
    rfCategory:   str
    ruleLatencyMs: int
    mlLatencyMs:   int
    rfLatencyMs:   int


class MetricsResult(BaseModel):
    model:     str
    f1:        float
    aucRoc:    float
    precision: float
    recall:    float
    avgLatencyMs: float
    nSamples:  int


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    """Service liveness check — used by Docker Compose healthcheck."""
    return {"status": "ok", "version": "0.1.0", "week": 1}


# ── Scoring stubs (Week 4 implementation) ────────────────────────────────────

@app.post(
    "/score/rules",
    response_model=ScoreResult,
    tags=["Scoring"],
    summary="Rule-based score (Week 4)",
)
def score_rules(lead: LeadFeatures):
    """
    Deterministic rule-based scoring engine.
    Implementation: Week 3/4 — returns placeholder until then.
    """
    return ScoreResult(
        leadId=lead.leadId,
        score=0.0,
        category="COLD",
        latencyMs=0,
    )


@app.post(
    "/score/ml",
    response_model=ScoreResult,
    tags=["Scoring"],
    summary="Logistic regression score (Week 4)",
)
def score_ml(lead: LeadFeatures):
    """
    Logistic regression model trained on synthetic_leads_sigma10.json.
    Implementation: Week 4 — returns placeholder until then.
    """
    return ScoreResult(
        leadId=lead.leadId,
        score=0.0,
        category="COLD",
        latencyMs=0,
    )


@app.post(
    "/score/rf",
    response_model=ScoreResult,
    tags=["Scoring"],
    summary="Random forest score (Week 4)",
)
def score_rf(lead: LeadFeatures):
    """
    Random forest model trained on synthetic_leads_sigma10.json.
    Implementation: Week 4 — returns placeholder until then.
    """
    return ScoreResult(
        leadId=lead.leadId,
        score=0.0,
        category="COLD",
        latencyMs=0,
    )


@app.post(
    "/score/compare",
    response_model=CompareResult,
    tags=["Scoring"],
    summary="Compare all three models (Week 4)",
)
def score_compare(lead: LeadFeatures):
    """
    Runs all three models and returns a comparison payload.
    NestJS ScoringService calls this endpoint and persists the result
    into the scoring_comparisons table.
    Implementation: Week 4.
    """
    return CompareResult(
        leadId=lead.leadId,
        ruleScore=0.0,
        mlScore=0.0,
        rfScore=0.0,
        delta=0.0,
        agreement=True,
        ruleCategory="COLD",
        mlCategory="COLD",
        rfCategory="COLD",
        ruleLatencyMs=0,
        mlLatencyMs=0,
        rfLatencyMs=0,
    )


# ── Research metrics endpoint (Week 5) ───────────────────────────────────────

@app.get(
    "/research/metrics",
    response_model=list[MetricsResult],
    tags=["Research"],
    summary="F1 / AUC-ROC / latency per model (Week 5)",
)
def research_metrics():
    """
    Aggregates scoring_comparisons + scoring_history to return
    F1, AUC-ROC, precision, recall, and mean latency for all models.
    This endpoint feeds the paper's results tables (H1, H2, H3).
    Implementation: Week 5.
    """
    return [
        MetricsResult(model=m, f1=0.0, aucRoc=0.0,
                      precision=0.0, recall=0.0, avgLatencyMs=0.0, nSamples=0)
        for m in ["rules", "logistic_regression", "random_forest"]
    ]
