-- AlterTable
ALTER TABLE "ScoringComparison" ADD COLUMN     "rfCategory" "ScoreCategory",
ADD COLUMN     "rfLatencyMs" INTEGER,
ADD COLUMN     "rfScore" DOUBLE PRECISION;
