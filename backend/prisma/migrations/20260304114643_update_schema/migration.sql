-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('FORM', 'WEBHOOK', 'MANUAL', 'IMPORT');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SME', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ScoreCategory" AS ENUM ('COLD', 'WARM', 'HOT');

-- CreateEnum
CREATE TYPE "ScoringMode" AS ENUM ('RULES', 'ML');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('EMAIL', 'CALL', 'MEETING', 'DEMO');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('TECH', 'FINANCE', 'HEALTHCARE', 'RETAIL', 'MANUFACTURING', 'OTHER');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "companySize" "CompanySize",
    "industry" "Industry",
    "source" "LeadSource" NOT NULL DEFAULT 'MANUAL',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "emailOpens" INTEGER NOT NULL DEFAULT 0,
    "websiteVisits" INTEGER NOT NULL DEFAULT 0,
    "formFills" INTEGER NOT NULL DEFAULT 0,
    "ruleScore" INTEGER,
    "mlScore" DOUBLE PRECISION,
    "activeScore" INTEGER NOT NULL DEFAULT 0,
    "scoreCategory" "ScoreCategory" NOT NULL DEFAULT 'COLD',
    "actuallyConverted" BOOLEAN,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "oldScore" INTEGER NOT NULL,
    "newScore" INTEGER NOT NULL,
    "scoringMode" "ScoringMode" NOT NULL,
    "reason" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringComparison" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "ruleScore" INTEGER NOT NULL,
    "mlScore" DOUBLE PRECISION NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "ruleCategory" "ScoreCategory" NOT NULL,
    "mlCategory" "ScoreCategory" NOT NULL,
    "agreement" BOOLEAN NOT NULL,
    "ruleLatencyMs" INTEGER NOT NULL,
    "mlLatencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "conversionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lifetimeValue" DOUBLE PRECISION,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_scoreCategory_idx" ON "Lead"("status", "scoreCategory");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_ruleScore_mlScore_idx" ON "Lead"("ruleScore", "mlScore");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringRule_ruleName_key" ON "ScoringRule"("ruleName");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_leadId_key" ON "Customer"("leadId");

-- AddForeignKey
ALTER TABLE "ScoringHistory" ADD CONSTRAINT "ScoringHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringComparison" ADD CONSTRAINT "ScoringComparison_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
