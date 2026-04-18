import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const SCORING_SERVICE_URL = 'http://localhost:8000';

async function scoreAllLeads() {
  console.log('🚀 Starting batch scoring of all leads...');
  
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { ruleScore: null },
        { mlScore: null },
        { rfScore: null }
      ]
    }
  });

  console.log(`📊 Found ${leads.length} leads to score`);

  let scored = 0;
  for (const lead of leads) {
    try {
      // Score using all three methods
      const response = await axios.post(`${SCORING_SERVICE_URL}/score/compare`, {
        emailOpens: lead.emailOpens,
        websiteVisits: lead.websiteVisits,
        formFills: lead.formFills,
        companySize: lead.companySize,
        industry: lead.industry
      });

      const { 
        ruleScore, mlScore, rfScore, 
        ruleCategory, mlCategory, rfCategory,
        ruleLatencyMs, mlLatencyMs, rfLatencyMs,
        delta, agreement, timeRelevance
      } = response.data;

      // Create scoring comparison record
      await prisma.scoringComparison.create({
        data: {
          leadId: lead.id,
          ruleScore: Math.round(ruleScore),
          mlScore: mlScore,
          rfScore: rfScore,
          delta: delta,
          ruleCategory: ruleCategory as 'COLD' | 'WARM' | 'HOT',
          mlCategory: mlCategory as 'COLD' | 'WARM' | 'HOT',
          rfCategory: rfCategory as 'COLD' | 'WARM' | 'HOT',
          agreement: agreement,
          ruleLatencyMs: Math.round(ruleLatencyMs),
          mlLatencyMs: Math.round(mlLatencyMs),
          rfLatencyMs: Math.round(rfLatencyMs),
          daysSinceCreated: timeRelevance?.daysSinceCreated,
          daysSinceActivity: timeRelevance?.daysSinceActivity,
          recencyScore: timeRelevance?.recencyScore,
          engagementVelocity: timeRelevance?.engagementVelocity,
          activityFreshness: timeRelevance?.activityFreshness
        }
      });

      // Update lead with scores
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          ruleScore: Math.round(ruleScore),
          mlScore: mlScore,
          rfScore: rfScore,
          scoreCategory: ruleCategory as 'COLD' | 'WARM' | 'HOT',
          lastActivityAt: lead.lastActivityAt ? new Date(lead.lastActivityAt) : null,
          recencyScore: timeRelevance?.recencyScore,
          engagementVelocity: timeRelevance?.engagementVelocity,
          activityFreshness: timeRelevance?.activityFreshness
        }
      });

      scored++;
      if (scored % 100 === 0) {
        console.log(`✅ Scored ${scored}/${leads.length} leads`);
      }
    } catch (error) {
      console.error(`❌ Error scoring lead ${lead.id}:`, error.message);
    }
  }

  console.log(`🎉 Batch scoring complete! Scored ${scored} leads`);
  await prisma.$disconnect();
}

scoreAllLeads();