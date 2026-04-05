import type { ScoreCategory } from './Scoring.types';

// ──── Enums (matching Prisma schema) ────
export const LeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST',
} as const;

export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];

export const LeadSource = {
  FORM: 'FORM',
  WEBHOOK: 'WEBHOOK',
  MANUAL: 'MANUAL',
  IMPORT: 'IMPORT',
} as const;

export type LeadSource = typeof LeadSource[keyof typeof LeadSource];

export const CompanySize = {
  STARTUP: 'STARTUP',
  SME: 'SME',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type CompanySize = typeof CompanySize[keyof typeof CompanySize];

export const Industry = {
  TECH: 'TECH',
  FINANCE: 'FINANCE',
  HEALTHCARE: 'HEALTHCARE',
  RETAIL: 'RETAIL',
  MANUFACTURING: 'MANUFACTURING',
  OTHER: 'OTHER',
} as const;

export type Industry = typeof Industry[keyof typeof Industry];

export const InteractionType = {
  EMAIL: 'EMAIL',
  CALL: 'CALL',
  MEETING: 'MEETING',
  DEMO: 'DEMO',
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

// ──── Lead Interface (matching Prisma schema) ────
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  companySize?: CompanySize | null;
  industry?: Industry | null;
  source: LeadSource;
  status: LeadStatus;

  emailOpens: number;
  websiteVisits: number;
  formFills: number;

  ruleScore?: number | null;
  mlScore?: number | null;
  activeScore: number;
  scoreCategory: ScoreCategory;

  actuallyConverted?: boolean | null;

  metadata?: Record<string, unknown> | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Fields collected by the creation form (id, createdAt, updatedAt, ruleScore, mlScore, activeScore, scoreCategory are system-assigned) */
export type LeadFormInput = Omit<
  Lead,
  'id' | 'createdAt' | 'updatedAt' | 'ruleScore' | 'mlScore' | 'activeScore' | 'scoreCategory'
>;

export interface LeadFilters {
  scoreCategories: ScoreCategory[];
  statuses: LeadStatus[];
  sources: LeadSource[];
  dateFrom: string | null;
  dateTo: string | null;
  searchQuery: string;
}

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}