-- AddTimeRelevanceFields
-- Week 5: Add time-based features to Lead and ScoringComparison models

-- Add time relevance columns to Lead table
ALTER TABLE "Lead" ADD COLUMN "lastActivityAt" TIMESTAMP(3),
ADD COLUMN "recencyScore" DOUBLE PRECISION,
ADD COLUMN "engagementVelocity" DOUBLE PRECISION,
ADD COLUMN "activityFreshness" TEXT;

-- Create index on lastActivityAt for faster queries
CREATE INDEX "Lead_lastActivityAt_idx" ON "Lead"("lastActivityAt");

-- Add time relevance columns to ScoringComparison table
ALTER TABLE "ScoringComparison" ADD COLUMN "daysSinceCreated" DOUBLE PRECISION,
ADD COLUMN "daysSinceActivity" DOUBLE PRECISION,
ADD COLUMN "recencyScore" DOUBLE PRECISION,
ADD COLUMN "engagementVelocity" DOUBLE PRECISION,
ADD COLUMN "activityFreshness" TEXT;
