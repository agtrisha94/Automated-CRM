#!/bin/bash

# ============================================================================
# SCORING SERVICE DIAGNOSTIC SCRIPT
# ============================================================================
# Tests the full scoring chain: Frontend → NestJS Backend → FastAPI Service
# 
# Usage:
#   chmod +x scripts/diagnose-scoring.sh
#   ./scripts/diagnose-scoring.sh
#
# This script tests:
# 1. FastAPI health check
# 2. FastAPI /score/compare endpoint
# 3. NestJS health check
# 4. Database connectivity
# 5. Full compare flow
# ============================================================================

set -e  # Exit on error

FASTAPI_URL="http://localhost:8000"
NESTJS_URL="http://localhost:3000/api"
LEAD_ID="test-lead-001"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   SCORING SERVICE DIAGNOSTIC TOOL${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ──────────────────────────────────────────────────────────────────────────
# 1. FastAPI Service Check
# ──────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}1. Checking FastAPI Service (port 8000)...${NC}"

if curl -s "$FASTAPI_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FastAPI is running${NC}"
    HEALTH=$(curl -s "$FASTAPI_URL/health" | jq '.')
    echo "   $HEALTH"
else
    echo -e "${RED}❌ FastAPI is NOT running${NC}"
    echo "   Please start: cd scoring-service && uvicorn main:app --reload"
    exit 1
fi

echo ""

# ──────────────────────────────────────────────────────────────────────────
# 2. Test FastAPI /score/compare endpoint
# ──────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}2. Testing FastAPI /score/compare endpoint...${NC}"

COMPARE_PAYLOAD=$(cat <<EOF
{
  "leadId": "$LEAD_ID",
  "emailOpens": 5,
  "websiteVisits": 8,
  "formFills": 3,
  "companySize": "ENTERPRISE",
  "industry": "TECH",
  "status": "QUALIFIED",
  "source": "FORM",
  "createdAt": "2025-12-01T00:00:00Z",
  "lastActivityAt": "2026-04-17T10:00:00Z"
}
EOF
)

echo "   Payload: $COMPARE_PAYLOAD"
echo ""

COMPARE_RESPONSE=$(curl -s -X POST "$FASTAPI_URL/score/compare" \
  -H "Content-Type: application/json" \
  -d "$COMPARE_PAYLOAD")

if echo "$COMPARE_RESPONSE" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FastAPI /score/compare returned valid JSON${NC}"
    echo "$COMPARE_RESPONSE" | jq '.'
else
    echo -e "${RED}❌ FastAPI /score/compare returned invalid JSON${NC}"
    echo "   Response: $COMPARE_RESPONSE"
    exit 1
fi

echo ""

# ──────────────────────────────────────────────────────────────────────────
# 3. NestJS Service Check
# ──────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}3. Checking NestJS Backend (port 3000)...${NC}"

if curl -s "$NESTJS_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ NestJS is running${NC}"
else
    echo -e "${RED}❌ NestJS is NOT running${NC}"
    echo "   Please start: cd backend && npm run start:dev"
    exit 1
fi

echo ""

# ──────────────────────────────────────────────────────────────────────────
# 4. Database Check
# ──────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}4. Checking Database connectivity...${NC}"

LEADS_COUNT=$(curl -s "$NESTJS_URL/leads" | jq 'length')

if [ "$LEADS_COUNT" != "null" ]; then
    echo -e "${GREEN}✅ Database is accessible${NC}"
    echo "   Found $LEADS_COUNT leads in database"
else
    echo -e "${RED}❌ Database query failed${NC}"
    echo "   Please check DATABASE_URL and Prisma migrations"
    exit 1
fi

echo ""

# ──────────────────────────────────────────────────────────────────────────
# 5. Full Compare Flow Test
# ──────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}5. Testing full compare flow...${NC}"

# Check if test lead exists, if not create one
TEST_LEAD=$(curl -s "$NESTJS_URL/leads" | jq ".[] | select(.id == \"$LEAD_ID\")")

if [ -z "$TEST_LEAD" ] || [ "$TEST_LEAD" == "null" ]; then
    echo "   Creating test lead..."
    CREATE_RESPONSE=$(curl -s -X POST "$NESTJS_URL/leads" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Lead",
        "email": "test@example.com",
        "emailOpens": 5,
        "websiteVisits": 8,
        "formFills": 3,
        "companySize": "ENTERPRISE",
        "industry": "TECH"
      }')
    
    TEST_LEAD_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
    echo "   Created lead: $TEST_LEAD_ID"
else
    TEST_LEAD_ID=$(echo "$TEST_LEAD" | jq -r '.id')
    echo "   Using existing lead: $TEST_LEAD_ID"
fi

echo ""
echo "   Calling /scoring/$TEST_LEAD_ID/compare..."

FINAL_RESPONSE=$(curl -s -X POST "$NESTJS_URL/scoring/$TEST_LEAD_ID/compare")

if echo "$FINAL_RESPONSE" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Full compare flow successful!${NC}"
    echo "$FINAL_RESPONSE" | jq '.'
else
    echo -e "${RED}❌ Full compare flow failed${NC}"
    echo "   Response: $FINAL_RESPONSE"
    exit 1
fi

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   All diagnostics passed! ✅${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
