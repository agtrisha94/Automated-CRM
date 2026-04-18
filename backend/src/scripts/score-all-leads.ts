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

      const { ruleScore, mlScore, rfScore } = response.data;

      // Create scoring comparison record
      await prisma.scoringComparison.create({
        data: {
          leadId: lead.id,
          ruleScore: ruleScore.score,
          mlScore: mlScore.probability * 100,
          rfScore: rfScore.probability * 100,
          delta: Math.abs(ruleScore.score - (mlScore.probability * 100)),
          ruleCategory: ruleScore.category as 'COLD' | 'WARM' | 'HOT',
          mlCategory: mlScore.category as 'COLD' | 'WARM' | 'HOT',
          rfCategory: rfScore.category as 'COLD' | 'WARM' | 'HOT',
          agreement: ruleScore.category === mlScore.category && mlScore.category === rfScore.category,
          ruleLatencyMs: 0,
          mlLatencyMs: 0,
          rfLatencyMs: 0
        }
      });

      // Update lead with scores
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          ruleScore: ruleScore.score,
          mlScore: mlScore.probability * 100,
          rfScore: rfScore.probability * 100,
          scoreCategory: ruleScore.category as 'COLD' | 'WARM' | 'HOT'
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