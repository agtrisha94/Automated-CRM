# API Contract — Automated CRM
> Version: 1.0 | Week 2 | Last updated: 2026-03-19
> Base URL: `http://localhost:3000/api`
> All requests: `Content-Type: application/json`
> All responses: `Content-Type: application/json`

---

## Authentication
None for prototype scope. Out of scope intentionally.

---

## Enums (shared reference)

| Enum | Values |
|------|--------|
| `LeadStatus` | `NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `LOST` |
| `LeadSource` | `FORM`, `WEBHOOK`, `MANUAL`, `IMPORT` |
| `CompanySize` | `STARTUP`, `SME`, `ENTERPRISE` |
| `Industry` | `TECH`, `FINANCE`, `HEALTHCARE`, `RETAIL`, `MANUFACTURING`, `OTHER` |
| `ScoreCategory` | `COLD`, `WARM`, `HOT` |
| `ScoringMode` | `RULES`, `ML` |
| `InteractionType` | `EMAIL`, `CALL`, `MEETING`, `DEMO` |

---

## 1. Leads

### `POST /leads`
Create a new lead.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+91-9876543210",
  "company": "Acme Corp",
  "jobTitle": "CTO",
  "companySize": "SME",
  "industry": "TECH",
  "source": "FORM",
  "emailOpens": 3,
  "websiteVisits": 5,
  "formFills": 1,
  "metadata": {}
}
```

**Required:** `name`, `email`
**Optional:** all others

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "status": "NEW",
  "source": "FORM",
  "scoreCategory": "COLD",
  "activeScore": 0,
  "ruleScore": null,
  "mlScore": null,
  "actuallyConverted": null,
  "createdAt": "2026-03-19T00:00:00.000Z",
  "updatedAt": "2026-03-19T00:00:00.000Z"
}
```

**Error `400`:** validation failure
```json
{
  "statusCode": 400,
  "timestamp": "2026-03-19T00:00:00.000Z",
  "path": "/api/leads",
  "message": ["email must be an email"]
}
```

---

### `GET /leads`
Get paginated list of leads with optional status filter.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page |
| `status` | LeadStatus | — | Filter by status |

**Example:** `GET /leads?page=1&limit=20&status=NEW`

**Response `200`:**
```json
{
  "data": [ /* Lead objects */ ],
  "total": 1000,
  "page": 1,
  "limit": 20
}
```

---

### `GET /leads/:id`
Get a single lead by UUID.

**Response `200`:** Lead object (same shape as POST response)

**Error `404`:**
```json
{
  "statusCode": 404,
  "timestamp": "2026-03-19T00:00:00.000Z",
  "path": "/api/leads/bad-id",
  "message": "Lead bad-id not found"
}
```

---

### `PATCH /leads/:id`
Update any fields on a lead. All fields optional.

**Request body:** any subset of CreateLead fields, e.g.:
```json
{
  "status": "CONTACTED",
  "jobTitle": "VP Engineering"
}
```

**Response `200`:** updated Lead object

---

### `DELETE /leads/:id`
Soft delete — sets `status = LOST`. Row is never removed from DB.

**Response `200`:** updated Lead object with `status: "LOST"`

---

## 2. Scoring (Week 3 — placeholder shapes for Person B)

### `POST /scoring/:id/score`
Trigger scoring for a lead. Calls FastAPI internally.

**Response `200`:**
```json
{
  "leadId": "uuid",
  "ruleScore": 72,
  "mlScore": 68.4,
  "delta": 3.6,
  "ruleCategory": "WARM",
  "mlCategory": "WARM",
  "agreement": true,
  "ruleLatencyMs": 12,
  "mlLatencyMs": 45
}
```

---

### `GET /scoring/:id/history`
Get scoring history for a lead.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "leadId": "uuid",
      "oldScore": 0,
      "newScore": 72,
      "scoringMode": "RULES",
      "reason": "emailOpens:3, websiteVisits:5",
      "triggeredBy": "manual",
      "latencyMs": 12,
      "createdAt": "2026-03-19T00:00:00.000Z"
    }
  ]
}
```

---

## 3. Analytics (Week 5 — placeholder shapes for Person B)

### `GET /analytics/overview`
Dashboard summary stats.

**Response `200`:**
```json
{
  "totalLeads": 1000,
  "byStatus": {
    "NEW": 400, "CONTACTED": 300, "QUALIFIED": 200, "CONVERTED": 80, "LOST": 20
  },
  "byScoreCategory": {
    "COLD": 500, "WARM": 350, "HOT": 150
  },
  "conversionRate": 0.08
}
```

---

### `GET /analytics/model-comparison`
Rule-based vs ML comparison metrics for the research dashboard.

**Response `200`:**
```json
{
  "totalComparisons": 1000,
  "agreementRate": 0.82,
  "avgDelta": 4.2,
  "ruleAvgLatencyMs": 11,
  "mlAvgLatencyMs": 43,
  "byCategory": {
    "COLD": { "agreement": 0.91, "count": 500 },
    "WARM": { "agreement": 0.79, "count": 350 },
    "HOT": { "agreement": 0.68, "count": 150 }
  }
}
```

---

## 4. Research Metrics (Week 6 — for paper results)

### `GET /research/metrics`
Returns F1, AUC-ROC, precision, recall, latency per model. Read by paper results section.

**Response `200`:**
```json
{
  "rules": {
    "f1": 0.74,
    "precision": 0.71,
    "recall": 0.77,
    "aucRoc": 0.79,
    "avgLatencyMs": 11
  },
  "logisticRegression": {
    "f1": 0.81,
    "precision": 0.79,
    "recall": 0.83,
    "aucRoc": 0.86,
    "avgLatencyMs": 43
  },
  "randomForest": {
    "f1": 0.83,
    "precision": 0.81,
    "recall": 0.85,
    "aucRoc": 0.88,
    "avgLatencyMs": 67
  }
}
```

---

## 5. n8n Webhooks (Week 4)

### `POST /webhooks/lead-intake`
Receives new lead data from n8n lead intake workflow.
Same request/response shape as `POST /leads`.

### `POST /webhooks/hot-lead-alert`
Called internally when `scoreCategory = HOT`.
Triggers n8n to send email/Slack notification.

**Request body:**
```json
{
  "leadId": "uuid",
  "name": "Jane Smith",
  "ruleScore": 88,
  "mlScore": 91.2,
  "scoreCategory": "HOT"
}
```

---

## Error Response Shape (all endpoints)
```json
{
  "statusCode": 400,
  "timestamp": "2026-03-19T00:00:00.000Z",
  "path": "/api/leads",
  "message": "string or array of validation errors"
}
```

| Code | Meaning |
|------|---------|
| `400` | Validation error |
| `404` | Resource not found |
| `500` | Internal server error |
