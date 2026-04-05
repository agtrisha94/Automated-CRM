import type { ScoringResult, ScoreHistoryEntry } from '@/types/Scoring.types'

// ── Scoring helper ──────────────────────────────────────────────
function category(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= 70) return 'HOT'
  if (score >= 40) return 'WARM'
  return 'COLD'
}

// ── Score history per lead ──────────────────────────────────────
const historyMap: Record<string, ScoreHistoryEntry[]> = {
  'lead-001': [
    { id: 'sh-001-1', leadId: 'lead-001', oldScore: 0,  newScore: 62, mode: 'RULE', latencyMs: 4,  scoredAt: '2026-01-03T09:14:25Z' },
    { id: 'sh-001-2', leadId: 'lead-001', oldScore: 62, newScore: 74, mode: 'LR',   latencyMs: 38, scoredAt: '2026-01-03T09:14:26Z' },
    { id: 'sh-001-3', leadId: 'lead-001', oldScore: 74, newScore: 79, mode: 'RF',   latencyMs: 71, scoredAt: '2026-01-03T09:14:27Z' },
  ],
  'lead-002': [
    { id: 'sh-002-1', leadId: 'lead-002', oldScore: 0,  newScore: 45, mode: 'RULE', latencyMs: 3,  scoredAt: '2026-01-05T11:30:05Z' },
    { id: 'sh-002-2', leadId: 'lead-002', oldScore: 45, newScore: 52, mode: 'LR',   latencyMs: 35, scoredAt: '2026-01-05T11:30:06Z' },
  ],
  'lead-003': [
    { id: 'sh-003-1', leadId: 'lead-003', oldScore: 0,  newScore: 80, mode: 'RULE', latencyMs: 5,  scoredAt: '2026-01-06T08:00:04Z' },
    { id: 'sh-003-2', leadId: 'lead-003', oldScore: 80, newScore: 87, mode: 'LR',   latencyMs: 40, scoredAt: '2026-01-06T08:00:05Z' },
    { id: 'sh-003-3', leadId: 'lead-003', oldScore: 87, newScore: 91, mode: 'RF',   latencyMs: 75, scoredAt: '2026-01-06T08:00:06Z' },
  ],
  'lead-006': [
    { id: 'sh-006-1', leadId: 'lead-006', oldScore: 0,  newScore: 88, mode: 'RULE', latencyMs: 4,  scoredAt: '2026-01-09T09:00:04Z' },
    { id: 'sh-006-2', leadId: 'lead-006', oldScore: 88, newScore: 94, mode: 'RF',   latencyMs: 68, scoredAt: '2026-01-09T09:00:05Z' },
  ],
}

function defaultHistory(leadId: string, ruleScore: number): ScoreHistoryEntry[] {
  return [
    {
      id: `sh-${leadId}-1`,
      leadId,
      oldScore: 0,
      newScore: ruleScore,
      mode: 'RULE',
      latencyMs: Math.floor(Math.random() * 3) + 3,
      scoredAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]
}

// ── Main scoring fixture ────────────────────────────────────────
export const mockScoring: Record<string, ScoringResult> = {
  'lead-001': { leadId: 'lead-001', ruleScore: 62, lrScore: 74, rfScore: 79, ruleCategory: category(62), lrCategory: category(74), rfCategory: category(79), ruleLatencyMs: 4, lrLatencyMs: 38, rfLatencyMs: 71, agreement: false, delta: 17, history: historyMap['lead-001'] },
  'lead-002': { leadId: 'lead-002', ruleScore: 45, lrScore: 52, rfScore: 49, ruleCategory: category(45), lrCategory: category(52), rfCategory: category(49), ruleLatencyMs: 3, lrLatencyMs: 35, rfLatencyMs: 64, agreement: true, delta: 7, history: historyMap['lead-002'] },
  'lead-003': { leadId: 'lead-003', ruleScore: 80, lrScore: 87, rfScore: 91, ruleCategory: category(80), lrCategory: category(87), rfCategory: category(91), ruleLatencyMs: 5, lrLatencyMs: 40, rfLatencyMs: 75, agreement: true, delta: 11, history: historyMap['lead-003'] },
  'lead-004': { leadId: 'lead-004', ruleScore: 38, lrScore: 44, rfScore: 41, ruleCategory: category(38), lrCategory: category(44), rfCategory: category(41), ruleLatencyMs: 3, lrLatencyMs: 33, rfLatencyMs: 62, agreement: false, delta: 6, history: defaultHistory('lead-004', 38) },
  'lead-005': { leadId: 'lead-005', ruleScore: 18, lrScore: 22, rfScore: 20, ruleCategory: category(18), lrCategory: category(22), rfCategory: category(20), ruleLatencyMs: 2, lrLatencyMs: 30, rfLatencyMs: 58, agreement: true, delta: 4, history: defaultHistory('lead-005', 18) },
  'lead-006': { leadId: 'lead-006', ruleScore: 88, lrScore: 91, rfScore: 94, ruleCategory: category(88), lrCategory: category(91), rfCategory: category(94), ruleLatencyMs: 4, lrLatencyMs: 39, rfLatencyMs: 68, agreement: true, delta: 6, history: historyMap['lead-006'] },
  'lead-007': { leadId: 'lead-007', ruleScore: 58, lrScore: 65, rfScore: 61, ruleCategory: category(58), lrCategory: category(65), rfCategory: category(61), ruleLatencyMs: 4, lrLatencyMs: 36, rfLatencyMs: 66, agreement: true, delta: 7, history: defaultHistory('lead-007', 58) },
  'lead-008': { leadId: 'lead-008', ruleScore: 22, lrScore: 27, rfScore: 25, ruleCategory: category(22), lrCategory: category(27), rfCategory: category(25), ruleLatencyMs: 2, lrLatencyMs: 31, rfLatencyMs: 59, agreement: true, delta: 5, history: defaultHistory('lead-008', 22) },
  'lead-009': { leadId: 'lead-009', ruleScore: 64, lrScore: 71, rfScore: 68, ruleCategory: category(64), lrCategory: category(71), rfCategory: category(68), ruleLatencyMs: 4, lrLatencyMs: 37, rfLatencyMs: 67, agreement: false, delta: 7, history: defaultHistory('lead-009', 64) },
  'lead-010': { leadId: 'lead-010', ruleScore: 15, lrScore: 19, rfScore: 17, ruleCategory: category(15), lrCategory: category(19), rfCategory: category(17), ruleLatencyMs: 2, lrLatencyMs: 29, rfLatencyMs: 57, agreement: true, delta: 4, history: defaultHistory('lead-010', 15) },
  'lead-011': { leadId: 'lead-011', ruleScore: 72, lrScore: 78, rfScore: 81, ruleCategory: category(72), lrCategory: category(78), rfCategory: category(81), ruleLatencyMs: 4, lrLatencyMs: 38, rfLatencyMs: 70, agreement: true, delta: 9, history: defaultHistory('lead-011', 72) },
  'lead-012': { leadId: 'lead-012', ruleScore: 85, lrScore: 90, rfScore: 93, ruleCategory: category(85), lrCategory: category(90), rfCategory: category(93), ruleLatencyMs: 4, lrLatencyMs: 42, rfLatencyMs: 73, agreement: true, delta: 8, history: historyMap['lead-012'] },
  'lead-013': { leadId: 'lead-013', ruleScore: 50, lrScore: 57, rfScore: 54, ruleCategory: category(50), lrCategory: category(57), rfCategory: category(54), ruleLatencyMs: 3, lrLatencyMs: 34, rfLatencyMs: 63, agreement: true, delta: 7, history: defaultHistory('lead-013', 50) },
  'lead-014': { leadId: 'lead-014', ruleScore: 20, lrScore: 24, rfScore: 22, ruleCategory: category(20), lrCategory: category(24), rfCategory: category(22), ruleLatencyMs: 2, lrLatencyMs: 30, rfLatencyMs: 58, agreement: true, delta: 4, history: defaultHistory('lead-014', 20) },
  'lead-015': { leadId: 'lead-015', ruleScore: 82, lrScore: 88, rfScore: 90, ruleCategory: category(82), lrCategory: category(88), rfCategory: category(90), ruleLatencyMs: 5, lrLatencyMs: 41, rfLatencyMs: 72, agreement: true, delta: 8, history: defaultHistory('lead-015', 82) },
  'lead-016': { leadId: 'lead-016', ruleScore: 12, lrScore: 16, rfScore: 14, ruleCategory: category(12), lrCategory: category(16), rfCategory: category(14), ruleLatencyMs: 2, lrLatencyMs: 28, rfLatencyMs: 56, agreement: true, delta: 4, history: defaultHistory('lead-016', 12) },
  'lead-017': { leadId: 'lead-017', ruleScore: 60, lrScore: 68, rfScore: 64, ruleCategory: category(60), lrCategory: category(68), rfCategory: category(64), ruleLatencyMs: 4, lrLatencyMs: 37, rfLatencyMs: 67, agreement: true, delta: 8, history: defaultHistory('lead-017', 60) },
  'lead-018': { leadId: 'lead-018', ruleScore: 90, lrScore: 93, rfScore: 95, ruleCategory: category(90), lrCategory: category(93), rfCategory: category(95), ruleLatencyMs: 5, lrLatencyMs: 43, rfLatencyMs: 76, agreement: true, delta: 5, history: defaultHistory('lead-018', 90) },
  'lead-019': { leadId: 'lead-019', ruleScore: 48, lrScore: 55, rfScore: 51, ruleCategory: category(48), lrCategory: category(55), rfCategory: category(51), ruleLatencyMs: 3, lrLatencyMs: 34, rfLatencyMs: 63, agreement: true, delta: 7, history: defaultHistory('lead-019', 48) },
  'lead-020': { leadId: 'lead-020', ruleScore: 28, lrScore: 34, rfScore: 31, ruleCategory: category(28), lrCategory: category(34), rfCategory: category(31), ruleLatencyMs: 3, lrLatencyMs: 31, rfLatencyMs: 60, agreement: true, delta: 6, history: defaultHistory('lead-020', 28) },
  'lead-021': { leadId: 'lead-021', ruleScore: 84, lrScore: 89, rfScore: 92, ruleCategory: category(84), lrCategory: category(89), rfCategory: category(92), ruleLatencyMs: 5, lrLatencyMs: 41, rfLatencyMs: 72, agreement: true, delta: 8, history: defaultHistory('lead-021', 84) },
  'lead-022': { leadId: 'lead-022', ruleScore: 42, lrScore: 49, rfScore: 46, ruleCategory: category(42), lrCategory: category(49), rfCategory: category(46), ruleLatencyMs: 3, lrLatencyMs: 33, rfLatencyMs: 62, agreement: true, delta: 7, history: defaultHistory('lead-022', 42) },
  'lead-023': { leadId: 'lead-023', ruleScore: 91, lrScore: 94, rfScore: 96, ruleCategory: category(91), lrCategory: category(94), rfCategory: category(96), ruleLatencyMs: 5, lrLatencyMs: 44, rfLatencyMs: 77, agreement: true, delta: 5, history: defaultHistory('lead-023', 91) },
  'lead-024': { leadId: 'lead-024', ruleScore: 44, lrScore: 51, rfScore: 48, ruleCategory: category(44), lrCategory: category(51), rfCategory: category(48), ruleLatencyMs: 3, lrLatencyMs: 34, rfLatencyMs: 63, agreement: true, delta: 7, history: defaultHistory('lead-024', 44) },
  'lead-025': { leadId: 'lead-025', ruleScore: 66, lrScore: 73, rfScore: 70, ruleCategory: category(66), lrCategory: category(73), rfCategory: category(70), ruleLatencyMs: 4, lrLatencyMs: 37, rfLatencyMs: 68, agreement: false, delta: 7, history: defaultHistory('lead-025', 66) },
  'lead-026': { leadId: 'lead-026', ruleScore: 8, lrScore: 11, rfScore: 10, ruleCategory: category(8), lrCategory: category(11), rfCategory: category(10), ruleLatencyMs: 2, lrLatencyMs: 27, rfLatencyMs: 55, agreement: true, delta: 3, history: defaultHistory('lead-026', 8) },
  'lead-027': { leadId: 'lead-027', ruleScore: 56, lrScore: 63, rfScore: 60, ruleCategory: category(56), lrCategory: category(63), rfCategory: category(60), ruleLatencyMs: 3, lrLatencyMs: 36, rfLatencyMs: 65, agreement: true, delta: 7, history: defaultHistory('lead-027', 56) },
  'lead-028': { leadId: 'lead-028', ruleScore: 34, lrScore: 40, rfScore: 37, ruleCategory: category(34), lrCategory: category(40), rfCategory: category(37), ruleLatencyMs: 3, lrLatencyMs: 32, rfLatencyMs: 61, agreement: false, delta: 6, history: defaultHistory('lead-028', 34) },
  'lead-029': { leadId: 'lead-029', ruleScore: 30, lrScore: 36, rfScore: 33, ruleCategory: category(30), lrCategory: category(36), rfCategory: category(33), ruleLatencyMs: 3, lrLatencyMs: 31, rfLatencyMs: 60, agreement: true, delta: 6, history: defaultHistory('lead-029', 30) },
  'lead-030': { leadId: 'lead-030', ruleScore: 70, lrScore: 76, rfScore: 79, ruleCategory: category(70), lrCategory: category(76), rfCategory: category(79), ruleLatencyMs: 4, lrLatencyMs: 38, rfLatencyMs: 69, agreement: true, delta: 9, history: defaultHistory('lead-030', 70) },
  'lead-031': { leadId: 'lead-031', ruleScore: 46, lrScore: 53, rfScore: 50, ruleCategory: category(46), lrCategory: category(53), rfCategory: category(50), ruleLatencyMs: 3, lrLatencyMs: 34, rfLatencyMs: 63, agreement: true, delta: 7, history: defaultHistory('lead-031', 46) },
  'lead-032': { leadId: 'lead-032', ruleScore: 83, lrScore: 88, rfScore: 91, ruleCategory: category(83), lrCategory: category(88), rfCategory: category(91), ruleLatencyMs: 5, lrLatencyMs: 41, rfLatencyMs: 72, agreement: true, delta: 8, history: defaultHistory('lead-032', 83) },
  'lead-033': { leadId: 'lead-033', ruleScore: 40, lrScore: 47, rfScore: 44, ruleCategory: category(40), lrCategory: category(47), rfCategory: category(44), ruleLatencyMs: 3, lrLatencyMs: 33, rfLatencyMs: 62, agreement: true, delta: 7, history: defaultHistory('lead-033', 40) },
  'lead-034': { leadId: 'lead-034', ruleScore: 36, lrScore: 29, rfScore: 32, ruleCategory: category(36), lrCategory: category(29), rfCategory: category(32), ruleLatencyMs: 3, lrLatencyMs: 32, rfLatencyMs: 61, agreement: false, delta: -7, history: defaultHistory('lead-034', 36) },
  'lead-035': { leadId: 'lead-035', ruleScore: 62, lrScore: 69, rfScore: 66, ruleCategory: category(62), lrCategory: category(69), rfCategory: category(66), ruleLatencyMs: 4, lrLatencyMs: 37, rfLatencyMs: 67, agreement: true, delta: 7, history: defaultHistory('lead-035', 62) },
  'lead-036': { leadId: 'lead-036', ruleScore: 10, lrScore: 14, rfScore: 12, ruleCategory: category(10), lrCategory: category(14), rfCategory: category(12), ruleLatencyMs: 2, lrLatencyMs: 28, rfLatencyMs: 56, agreement: true, delta: 4, history: defaultHistory('lead-036', 10) },
  'lead-037': { leadId: 'lead-037', ruleScore: 76, lrScore: 82, rfScore: 85, ruleCategory: category(76), lrCategory: category(82), rfCategory: category(85), ruleLatencyMs: 4, lrLatencyMs: 39, rfLatencyMs: 70, agreement: true, delta: 9, history: defaultHistory('lead-037', 76) },
  'lead-038': { leadId: 'lead-038', ruleScore: 68, lrScore: 74, rfScore: 71, ruleCategory: category(68), lrCategory: category(74), rfCategory: category(71), ruleLatencyMs: 4, lrLatencyMs: 38, rfLatencyMs: 68, agreement: false, delta: 6, history: defaultHistory('lead-038', 68) },
  'lead-039': { leadId: 'lead-039', ruleScore: 40, lrScore: 46, rfScore: 43, ruleCategory: category(40), lrCategory: category(46), rfCategory: category(43), ruleLatencyMs: 3, lrLatencyMs: 33, rfLatencyMs: 62, agreement: true, delta: 6, history: defaultHistory('lead-039', 40) },
  'lead-040': { leadId: 'lead-040', ruleScore: 52, lrScore: 58, rfScore: 55, ruleCategory: category(52), lrCategory: category(58), rfCategory: category(55), ruleLatencyMs: 3, lrLatencyMs: 35, rfLatencyMs: 64, agreement: true, delta: 6, history: defaultHistory('lead-040', 52) },
  'lead-041': { leadId: 'lead-041', ruleScore: 86, lrScore: 91, rfScore: 93, ruleCategory: category(86), lrCategory: category(91), rfCategory: category(93), ruleLatencyMs: 5, lrLatencyMs: 42, rfLatencyMs: 74, agreement: true, delta: 7, history: defaultHistory('lead-041', 86) },
  'lead-042': { leadId: 'lead-042', ruleScore: 58, lrScore: 65, rfScore: 62, ruleCategory: category(58), lrCategory: category(65), rfCategory: category(62), ruleLatencyMs: 3, lrLatencyMs: 36, rfLatencyMs: 66, agreement: true, delta: 7, history: defaultHistory('lead-042', 58) },
  'lead-043': { leadId: 'lead-043', ruleScore: 38, lrScore: 44, rfScore: 41, ruleCategory: category(38), lrCategory: category(44), rfCategory: category(41), ruleLatencyMs: 3, lrLatencyMs: 33, rfLatencyMs: 62, agreement: false, delta: 6, history: defaultHistory('lead-043', 38) },
  'lead-044': { leadId: 'lead-044', ruleScore: 81, lrScore: 87, rfScore: 90, ruleCategory: category(81), lrCategory: category(87), rfCategory: category(90), ruleLatencyMs: 5, lrLatencyMs: 41, rfLatencyMs: 72, agreement: true, delta: 9, history: defaultHistory('lead-044', 81) },
  'lead-045': { leadId: 'lead-045', ruleScore: 14, lrScore: 18, rfScore: 16, ruleCategory: category(14), lrCategory: category(18), rfCategory: category(16), ruleLatencyMs: 2, lrLatencyMs: 28, rfLatencyMs: 56, agreement: true, delta: 4, history: defaultHistory('lead-045', 14) },
  'lead-046': { leadId: 'lead-046', ruleScore: 60, lrScore: 67, rfScore: 64, ruleCategory: category(60), lrCategory: category(67), rfCategory: category(64), ruleLatencyMs: 4, lrLatencyMs: 37, rfLatencyMs: 67, agreement: true, delta: 7, history: defaultHistory('lead-046', 60) },
  'lead-047': { leadId: 'lead-047', ruleScore: 55, lrScore: 62, rfScore: 59, ruleCategory: category(55), lrCategory: category(62), rfCategory: category(59), ruleLatencyMs: 3, lrLatencyMs: 35, rfLatencyMs: 65, agreement: true, delta: 7, history: defaultHistory('lead-047', 55) },
  'lead-048': { leadId: 'lead-048', ruleScore: 92, lrScore: 95, rfScore: 97, ruleCategory: category(92), lrCategory: category(95), rfCategory: category(97), ruleLatencyMs: 5, lrLatencyMs: 44, rfLatencyMs: 77, agreement: true, delta: 5, history: defaultHistory('lead-048', 92) },
  'lead-049': { leadId: 'lead-049', ruleScore: 26, lrScore: 32, rfScore: 29, ruleCategory: category(26), lrCategory: category(32), rfCategory: category(29), ruleLatencyMs: 3, lrLatencyMs: 31, rfLatencyMs: 60, agreement: true, delta: 6, history: defaultHistory('lead-049', 26) },
  'lead-050': { leadId: 'lead-050', ruleScore: 68, lrScore: 75, rfScore: 72, ruleCategory: category(68), lrCategory: category(75), rfCategory: category(72), ruleLatencyMs: 4, lrLatencyMs: 38, rfLatencyMs: 68, agreement: true, delta: 7, history: defaultHistory('lead-050', 68) },
}