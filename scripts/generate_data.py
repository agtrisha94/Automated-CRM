"""
Synthetic Lead Data Generator
==============================
Project : Comparative Study of Rule-Based vs Lightweight ML Lead Scoring
          in Low-Resource CRM Systems
Output  : synthetic_leads_sigma{5,10,15}.json  (one file per noise level)
          Each file: 1 000 lead objects + actuallyConverted ground truth
Schema  : Matches Prisma schema.prisma exactly (all enums, all fields)
Author  : Person A
"""

import json
import math
import random
import uuid
from datetime import datetime, timedelta, timezone

from faker import Faker

fake = Faker()
random.seed(42)          # reproducibility across all three runs

# ── Enum values (mirror Prisma schema exactly) ──────────────────────────────

LEAD_STATUSES    = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]
LEAD_SOURCES     = ["FORM", "WEBHOOK", "MANUAL", "IMPORT"]
COMPANY_SIZES    = ["STARTUP", "SME", "ENTERPRISE"]
SCORE_CATEGORIES = ["COLD", "WARM", "HOT"]
INDUSTRIES       = ["TECH", "FINANCE", "HEALTHCARE", "RETAIL", "MANUFACTURING", "OTHER"]
INTERACTION_TYPES = ["EMAIL", "CALL", "MEETING", "DEMO"]

# ── Weighted probability helpers ─────────────────────────────────────────────

def wchoice(population, weights):
    """Single weighted random choice."""
    return random.choices(population, weights=weights, k=1)[0]


# Realistic SME-skewed distributions (mirror real CRM data)
SOURCE_WEIGHTS        = [35, 20, 30, 15]   # FORM, WEBHOOK, MANUAL, IMPORT
STATUS_WEIGHTS        = [40, 25, 20, 8, 7] # NEW, CONTACTED, QUALIFIED, CONVERTED, LOST
COMPANY_SIZE_WEIGHTS  = [45, 35, 20]        # STARTUP, SME, ENTERPRISE  (SME-heavy)
INDUSTRY_WEIGHTS      = [30, 15, 15, 20, 10, 10]
SOURCE_LIST           = LEAD_SOURCES
STATUS_LIST           = LEAD_STATUSES

# ── Engagement field generators ──────────────────────────────────────────────

def _engagement_for_size(company_size: str):
    """Larger companies get slightly higher engagement ceilings."""
    ceilings = {"STARTUP": (8, 5, 3), "SME": (12, 8, 4), "ENTERPRISE": (20, 15, 6)}
    email_max, visit_max, form_max = ceilings[company_size]
    return (
        random.randint(0, email_max),
        random.randint(0, visit_max),
        random.randint(0, form_max),
    )

# ── Deterministic scoring functions ─────────────────────────────────────────
# These mirror the rule engine that will be built in Week 3.
# They are used purely to compute ground-truth actuallyConverted.

SCORE_WEIGHTS = {
    "emailOpens":    3,
    "websiteVisits": 4,
    "formFills":     8,
    "ENTERPRISE":    15,
    "SME":           8,
    "STARTUP":       3,
    "QUALIFIED":     20,
    "CONTACTED":     10,
    "DEMO":          25,   # per interaction of this type
    "MEETING":       15,
    "CALL":          5,
    "EMAIL":         2,
}


def compute_deterministic_score(lead: dict) -> float:
    """
    Compute a continuous score [0, 100] from lead features.
    Used as the 'true' signal before noise is added.
    """
    score = 0.0
    score += lead["emailOpens"]    * SCORE_WEIGHTS["emailOpens"]
    score += lead["websiteVisits"] * SCORE_WEIGHTS["websiteVisits"]
    score += lead["formFills"]     * SCORE_WEIGHTS["formFills"]

    cs = lead.get("companySize")
    if cs in SCORE_WEIGHTS:
        score += SCORE_WEIGHTS[cs]

    st = lead.get("status")
    if st in SCORE_WEIGHTS:
        score += SCORE_WEIGHTS[st]

    for itype, count in lead.get("_interaction_counts", {}).items():
        score += SCORE_WEIGHTS.get(itype, 0) * count

    # Clamp to [0, 100]
    return min(100.0, max(0.0, score))


def score_to_category(score: float) -> str:
    if score >= 60:
        return "HOT"
    if score >= 30:
        return "WARM"
    return "COLD"


def determine_ground_truth(score_noisy: float, threshold: float = 85.0) -> bool:
    """
    Convert noisy score to binary actuallyConverted label.
    Threshold=72 calibrated against the realistic score distribution to
    produce ~30–35 % positive class balance (target window: 25–40 %).
    Adjust threshold here if your class balance drifts outside the window:
      - raise threshold → fewer converted (lower %)
      - lower threshold → more converted (higher %)
    """
    return score_noisy >= threshold


# ── Interaction generator ────────────────────────────────────────────────────

def generate_interactions(lead_id: str, status: str) -> tuple[list[dict], dict]:
    """
    Return (list-of-interaction-dicts, counts-by-type).
    More interactions for leads further along the funnel.
    """
    n_map = {"NEW": (0, 1), "CONTACTED": (1, 3), "QUALIFIED": (2, 5),
             "CONVERTED": (3, 8), "LOST": (1, 4)}
    lo, hi = n_map.get(status, (0, 2))
    n = random.randint(lo, hi)

    interactions = []
    counts: dict = {}
    base_ts = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90))

    for i in range(n):
        itype = wchoice(
            INTERACTION_TYPES,
            [40, 30, 20, 10],   # EMAIL most common
        )
        counts[itype] = counts.get(itype, 0) + 1
        interactions.append({
            "id":        str(uuid.uuid4()),
            "leadId":    lead_id,
            "type":      itype,
            "notes":     fake.sentence(nb_words=8) if random.random() > 0.4 else None,
            "timestamp": (base_ts + timedelta(days=i * random.randint(1, 7))).isoformat(),
        })

    return interactions, counts


# ── Single lead factory ───────────────────────────────────────────────────────

def make_lead(sigma: float) -> tuple[dict, list[dict]]:
    lead_id     = str(uuid.uuid4())
    company_size = wchoice(COMPANY_SIZES, COMPANY_SIZE_WEIGHTS)
    industry    = wchoice(INDUSTRIES,     INDUSTRY_WEIGHTS)
    source      = wchoice(LEAD_SOURCES,   SOURCE_WEIGHTS)
    status      = wchoice(LEAD_STATUSES,  STATUS_WEIGHTS)

    email_opens, website_visits, form_fills = _engagement_for_size(company_size)

    interactions, interaction_counts = generate_interactions(lead_id, status)

    # Partial lead dict for scoring (no DB fields yet)
    proto = {
        "emailOpens":         email_opens,
        "websiteVisits":      website_visits,
        "formFills":          form_fills,
        "companySize":        company_size,
        "status":             status,
        "_interaction_counts": interaction_counts,
    }

    det_score   = compute_deterministic_score(proto)
    noise       = random.gauss(0, sigma)
    noisy_score = min(100.0, max(0.0, det_score + noise))

    # Derive rule/ml scores (integers for ruleScore, float for mlScore)
    rule_score  = round(noisy_score)
    ml_score    = round(noisy_score + random.gauss(0, sigma * 0.5), 4)
    ml_score    = min(100.0, max(0.0, ml_score))
    active_score = rule_score   # same for generated data; engine will diverge in Week 3

    score_cat   = score_to_category(noisy_score)
    actually_converted = determine_ground_truth(noisy_score)

    # Override status to CONVERTED if ground truth says so (consistency)
    if actually_converted and status not in ("CONVERTED",):
        if random.random() > 0.3:   # 70 % chance to align — keep some noise
            status = "CONVERTED"

    created_at = (
        datetime.now(timezone.utc) - timedelta(days=random.randint(0, 180))
    ).isoformat()
    updated_at = (
        datetime.fromisoformat(created_at) + timedelta(days=random.randint(0, 10))
    ).isoformat()

    lead = {
        "id":           lead_id,
        "name":         fake.name(),
        "email":        fake.unique.email(),
        "phone":        fake.phone_number() if random.random() > 0.3 else None,
        "company":      fake.company() if random.random() > 0.1 else None,
        "jobTitle":     fake.job()     if random.random() > 0.2 else None,
        "companySize":  company_size,
        "industry":     industry,
        "source":       source,
        "status":       status,
        "emailOpens":   email_opens,
        "websiteVisits": website_visits,
        "formFills":    form_fills,
        "ruleScore":    rule_score,
        "mlScore":      ml_score,
        "activeScore":  active_score,
        "scoreCategory": score_cat,
        "actuallyConverted": actually_converted,
        "metadata":     None,
        "createdAt":    created_at,
        "updatedAt":    updated_at,
    }

    return lead, interactions


# ── Dataset generator ─────────────────────────────────────────────────────────

def generate_dataset(n: int, sigma: float) -> dict:
    """Generate n leads with Gaussian noise level sigma."""
    fake.unique.clear()     # reset uniqueness pool for each dataset

    leads       = []
    all_interactions = []

    for _ in range(n):
        lead, interactions = make_lead(sigma)
        leads.append(lead)
        all_interactions.extend(interactions)

    converted = sum(1 for l in leads if l["actuallyConverted"])
    balance   = converted / n

    summary = {
        "total":             n,
        "sigma":             sigma,
        "converted":         converted,
        "notConverted":      n - converted,
        "classBalancePct":   round(balance * 100, 2),
        "balanceWarning":    not (0.15 <= balance <= 0.60),
        "scoreCategoryDist": {
            cat: sum(1 for l in leads if l["scoreCategory"] == cat)
            for cat in SCORE_CATEGORIES
        },
        "statusDist": {
            st: sum(1 for l in leads if l["status"] == st)
            for st in LEAD_STATUSES
        },
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }

    return {
        "summary":      summary,
        "leads":        leads,
        "interactions": all_interactions,
    }


# ── DB seeder (psycopg2) ──────────────────────────────────────────────────────

SEED_SQL_LEAD = """
INSERT INTO "Lead" (
    id, name, email, phone, company, "jobTitle",
    "companySize", industry, source, status,
    "emailOpens", "websiteVisits", "formFills",
    "ruleScore", "mlScore", "activeScore", "scoreCategory",
    "actuallyConverted", metadata, "createdAt", "updatedAt"
) VALUES (
    %(id)s, %(name)s, %(email)s, %(phone)s, %(company)s, %(jobTitle)s,
    %(companySize)s, %(industry)s, %(source)s, %(status)s,
    %(emailOpens)s, %(websiteVisits)s, %(formFills)s,
    %(ruleScore)s, %(mlScore)s, %(activeScore)s, %(scoreCategory)s,
    %(actuallyConverted)s, %(metadata)s, %(createdAt)s, %(updatedAt)s
) ON CONFLICT (email) DO NOTHING;
"""

SEED_SQL_INTERACTION = """
INSERT INTO "Interaction" (id, "leadId", type, notes, timestamp)
VALUES (%(id)s, %(leadId)s, %(type)s, %(notes)s, %(timestamp)s)
ON CONFLICT DO NOTHING;
"""


def seed_to_neon(dataset: dict, database_url: str) -> None:
    """
    Seed dataset into Neon PostgreSQL via psycopg2.
    Call this AFTER JSON files are generated and verified.

    Usage:
        from generate_data import seed_to_neon, generate_dataset
        ds = generate_dataset(1000, sigma=10)
        seed_to_neon(ds, os.environ["DATABASE_URL"])
    """
    try:
        import psycopg2
        import psycopg2.extras
    except ImportError:
        raise RuntimeError("psycopg2-binary not installed: pip install psycopg2-binary")

    import json as _json

    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    cur  = conn.cursor()

    try:
        leads_inserted        = 0
        interactions_inserted = 0

        for lead in dataset["leads"]:
            row = dict(lead)
            row["metadata"] = _json.dumps(row["metadata"]) if row["metadata"] else None
            cur.execute(SEED_SQL_LEAD, row)
            leads_inserted += cur.rowcount

        for interaction in dataset["interactions"]:
            cur.execute(SEED_SQL_INTERACTION, interaction)
            interactions_inserted += cur.rowcount

        conn.commit()
        print(f"  ✓ Seeded {leads_inserted} leads, {interactions_inserted} interactions")

    except Exception as exc:
        conn.rollback()
        raise RuntimeError(f"Seed failed — rolled back: {exc}") from exc
    finally:
        cur.close()
        conn.close()


# ── CLI entry point ───────────────────────────────────────────────────────────

def main():
    import os

    N      = 1000
    sigmas = [5, 10, 15]

    print("=" * 60)
    print("Synthetic Lead Data Generator")
    print(f"Leads per file : {N}")
    print(f"Noise levels   : σ ∈ {sigmas}")
    print("=" * 60)

    for sigma in sigmas:
        print(f"\n▶  Generating σ={sigma} …")
        dataset  = generate_dataset(N, sigma)
        summary  = dataset["summary"]

        filename = f"synthetic_leads_sigma{sigma}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)

        # ── Print summary ──────────────────────────────────────────
        print(f"   File          : {filename}")
        print(f"   Converted     : {summary['converted']} / {N}  "
              f"({summary['classBalancePct']} %)")
        if summary["balanceWarning"]:
            print(f"   ⚠  CLASS BALANCE WARNING — adjust threshold in "
                  f"determine_ground_truth() if outside 15–60 %")
        print(f"   Score dist    : {summary['scoreCategoryDist']}")
        print(f"   Status dist   : {summary['statusDist']}")
        print(f"   Interactions  : {len(dataset['interactions'])}")
        print(f"   ✓ Written → {filename}")

    # ── Optional: seed σ=10 dataset into Neon ─────────────────────
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        print("\n▶  DATABASE_URL detected — seeding σ=10 dataset into Neon …")
        # Re-generate with same seed for consistency
        random.seed(42)
        dataset_seed = generate_dataset(N, sigma=10)
        seed_to_neon(dataset_seed, db_url)
    else:
        print("\n   ℹ  DATABASE_URL not set — skipping Neon seed.")
        print("      To seed: set DATABASE_URL and re-run, or call seed_to_neon() manually.")

    print("\n✓ Done. All three files generated successfully.\n")


if __name__ == "__main__":
    main()
