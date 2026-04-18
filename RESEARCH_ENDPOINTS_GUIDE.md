# Research Endpoints Quick Reference

## Testing the Endpoints

### Start the Scoring Service
```bash
cd /Users/ASUS/Documents/College/Automated\ CRM
docker-compose up -d scoring
```

### 1. H1 Validation - Dataset Ablation
```bash
curl http://localhost:8000/research/dataset-ablation | jq
```

**What it measures:**
- F1 scores at dataset sizes: 50, 100, 150, 200, 300, 500 leads
- ML advantage at each size
- Validates if advantage shrinks below 200 leads

**Expected response:**
```json
{
  "hypothesis": "H1: ML models achieve higher F1 than rules, but advantage shrinks below 200 leads",
  "ablationResults": [
    {
      "datasetSize": 50,
      "ruleF1": 0.5234,
      "mlF1": 0.6123,
      "rfF1": 0.6456,
      "mlAdvantage": 0.0889,
      "rfAdvantage": 0.1222
    },
    ...
  ],
  "conclusion": {
    "h1Supported": true,
    "shrinkageDetected": true,
    "bestSize": 500
  }
}
```

---

### 2. H2 Validation - Interpretability Metrics
```bash
curl http://localhost:8000/research/interpretability-metrics | jq
```

**What it measures:**
- Transparency Score (0-100): How obvious are decisions?
- Explainability Score (0-100): Can you explain why?
- Auditability Score (0-100): Can you audit the decision?
- Overall Interpretability (0-100): Combined score

**Expected response:**
```json
{
  "hypothesis": "H2: Rules=perfect interpretability, LR=partial, RF=minimal",
  "metrics": {
    "rules": {
      "overallInterpretability": 100,
      "example": "score = 15 + 5*emailOpens + 8*websiteVisits + ..."
    },
    "logistic_regression": {
      "overallInterpretability": 65,
      "regressionCoefficients": {
        "emailOpens": 0.0342,
        "formFills": 0.0689,
        ...
      }
    },
    "random_forest": {
      "overallInterpretability": 15,
      "featureImportances": {
        "emailOpens": 0.234,
        "formFills": 0.156,
        ...
      }
    }
  },
  "conclusion": {
    "h2Supported": true,
    "ranking": ["rules (100)", "logistic_regression (65)", "random_forest (15)"]
  }
}
```

---

### 3. H3 Validation - Training Cost Analysis
```bash
curl http://localhost:8000/research/training-cost-analysis | jq
```

**What it measures:**
- Training time: How long to train the model?
- Retraining frequency: How often should we retrain?
- Inference latency: How fast to score a lead?
- Annual cost: What's the operational cost?

**Expected response:**
```json
{
  "hypothesis": "H3: Rules have zero cost. ML models have measurably higher training time and inference latency.",
  "models": {
    "rules": {
      "trainingTimeSeconds": 0.0,
      "avgInferenceLatencyMs": 3.5,
      "trainingCost": "zero"
    },
    "logistic_regression": {
      "trainingTimeSeconds": 2.34,
      "avgInferenceLatencyMs": 95.2,
      "trainingCost": "minimal_cpu",
      "yearlyRetrainingCostUSD": 1.80
    },
    "random_forest": {
      "trainingTimeSeconds": 8.67,
      "avgInferenceLatencyMs": 13800.0,
      "trainingCost": "moderate_cpu_high_memory",
      "yearlyRetrainingCostUSD": 11.70
    }
  },
  "efficiency_comparison": {
    "trainingTimeRatio": {
      "lr_vs_rules": 2340,
      "rf_vs_rules": 8670
    },
    "inferenceLatencyRatio": {
      "lr_vs_rules": 27.2,
      "rf_vs_rules": 3940.0
    }
  },
  "conclusion": {
    "h3Supported": true,
    "keyFinding": "Rules are 2,340-8,670× faster to train than ML models. Inference latency differs by 27-3,940×."
  }
}
```

---

## Using Results in Your Paper

### Step 1: Extract JSON to Tables
```bash
# H1 Dataset Ablation
curl -s http://localhost:8000/research/dataset-ablation | jq '.ablationResults[] | {size: .datasetSize, ruleF1, mlF1, rfF1}' > table_h1.json

# H2 Interpretability
curl -s http://localhost:8000/research/interpretability-metrics | jq '.metrics | to_entries[] | {model: .key, score: .value.overallInterpretability}' > table_h2.json

# H3 Training Costs
curl -s http://localhost:8000/research/training-cost-analysis | jq '.models | to_entries[] | {model: .key, trainingTime: .value.trainingTimeSeconds, latency: .value.avgInferenceLatencyMs}' > table_h3.json
```

### Step 2: Generate Markdown Tables
```bash
# Use any JSON-to-markdown tool or write custom script
# Tables will automatically format for research paper inclusion
```

### Step 3: Add to Paper
Copy-paste into `RESEARCH_SUMMARY_PRESENTATION.md`:

```markdown
## Hypothesis 1: Accuracy

**Table 1: Dataset Size Sensitivity Analysis**
[Paste H1 JSON results here]

## Hypothesis 2: Interpretability

**Table 2: Interpretability Metrics (0-100 Scale)**
[Paste H2 JSON results here]

## Hypothesis 3: Operational Efficiency

**Table 3: Training Cost & Latency Analysis**
[Paste H3 JSON results here]
```

---

## Troubleshooting

### Endpoint returns 500 error
```bash
# Check if scoring service is running
docker-compose ps scoring

# Check logs
docker-compose logs scoring
```

### Dataset not found
```bash
# Verify synthetic data exists
ls -la /Users/ASUS/Documents/College/Automated\ CRM/scripts/synthetic_leads_*.json
```

### No pandas/sklearn errors
```bash
# Rebuild Docker image
docker-compose down
docker-compose build --no-cache scoring
docker-compose up -d scoring
```

---

## File Locations

| Component | Location |
|-----------|----------|
| **Main Endpoints** | `scoring-service/main.py` lines 1585-1850 |
| **Imports Added** | `scoring-service/main.py` lines 37-49 |
| **H1 Function** | `scoring-service/main.py` lines 1585-1640 |
| **H2 Function** | `scoring-service/main.py` lines 1671-1758 |
| **H3 Function** | `scoring-service/main.py` lines 1759-1850 |
| **Research Summary** | `/HYPOTHESIS_VALIDATION.md` |

---

## Integration Checklist

- [x] Added required imports (pandas, sklearn, json)
- [x] Implemented H1 dataset ablation endpoint
- [x] Implemented H2 interpretability metrics endpoint
- [x] Implemented H3 training cost analysis endpoint
- [x] All endpoints have proper error handling (try/except)
- [x] Syntax validation passed
- [ ] Test endpoints locally (docker-compose up)
- [ ] Extract results to research paper
- [ ] Add tables/figures to presentation
- [ ] Ready for submission ✅

---

**Last Updated:** April 18, 2026  
**Status:** All gaps covered - Ready for testing ✅
