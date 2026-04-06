/**
 * Leads API Service
 * Handles all lead-related API calls to NestJS backend
 */
import { nestjsClient } from '../clients'
import { mockLeads } from '@/mocks/Leads.mock'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import type { Lead, LeadStatus, InteractionType, CompanySize, Industry, LeadSource } from '@/types/Leads.types'
import { LeadStatus as LeadStatusEnum, LeadSource as LeadSourceEnum } from '@/types/Leads.types'
import { ScoreCategory as ScoreCategoryEnum } from '@/types/Scoring.types'
import { config } from '../config'

export interface LeadsListResponse {
  data: Lead[]
  total: number
  page: number
  limit: number
}

export interface CreateLeadInput {
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  companySize?: string
  industry?: string
  source?: string
  emailOpens?: number
  websiteVisits?: number
  formFills?: number
  metadata?: Record<string, any>
}

export interface InteractionInput {
  type: InteractionType
  notes?: string
  duration?: number
  metadata?: Record<string, any>
}

/**
 * Get paginated list of leads with optional filters
 */
export async function getLeads(
  page: number = 1,
  limit: number = DEFAULT_PAGE_SIZE,
  filters?: {
    status?: LeadStatus
    search?: string
    category?: string
    source?: string
  }
): Promise<LeadsListResponse> {
  if (config.USE_MOCKS) {
    // Mock implementation: filter locally and return paginated result
    let filtered = [...mockLeads]

    // Apply filters
    if (filters?.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status)
    }
    if (filters?.source) {
      filtered = filtered.filter((lead) => lead.source === filters.source)
    }
    if (filters?.category) {
      filtered = filtered.filter((lead) => lead.scoreCategory === filters.category)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          (lead.company?.toLowerCase().includes(q) ?? false)
      )
    }

    // Apply pagination
    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return { data, total, page, limit }
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.category && { category: filters.category }),
    ...(filters?.source && { source: filters.source }),
  })

  const { data } = await nestjsClient.get<LeadsListResponse>(`/leads?${params}`)
  return data
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: string): Promise<Lead> {
  if (config.USE_MOCKS) {
    const lead = mockLeads.find((l) => l.id === id)
    if (!lead) {
      throw new Error(`Lead ${id} not found`)
    }
    return lead
  }

  const { data } = await nestjsClient.get<Lead>(`/leads/${id}`)
  return data
}

/**
 * Create a new lead
 */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  if (config.USE_MOCKS) {
    // Mock: Generate new lead with generated ID and timestamps
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      jobTitle: input.jobTitle,
      companySize: input.companySize as CompanySize | undefined,
      industry: input.industry as Industry | undefined,
      source: (input.source as LeadSource) || LeadSourceEnum.MANUAL,
      status: LeadStatusEnum.NEW,
      emailOpens: input.emailOpens || 0,
      websiteVisits: input.websiteVisits || 0,
      formFills: input.formFills || 0,
      activeScore: 0,
      scoreCategory: ScoreCategoryEnum.COLD,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: input.metadata || {},
    }
    mockLeads.push(newLead)
    return newLead
  }

  const { data } = await nestjsClient.post<Lead>('/leads', input)
  return data
}

/**
 * Update lead status
 */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  if (config.USE_MOCKS) {
    // Mock: Find lead and update status
    const lead = mockLeads.find((l) => l.id === id)
    if (!lead) {
      throw new Error(`Lead ${id} not found`)
    }
    lead.status = status
    lead.updatedAt = new Date().toISOString()
    return lead
  }

  const { data } = await nestjsClient.patch<Lead>(`/leads/${id}`, { status })
  return data
}

/**
 * Add interaction to a lead (email, call, meeting, demo, etc.)
 */
export async function addInteraction(id: string, interaction: InteractionInput): Promise<Lead> {
  if (config.USE_MOCKS) {
    // Mock: Find lead and update timestamp
    const lead = mockLeads.find((l) => l.id === id)
    if (!lead) {
      throw new Error(`Lead ${id} not found`)
    }
    lead.updatedAt = new Date().toISOString()
    return lead
  }

  const { data } = await nestjsClient.post<Lead>(`/leads/${id}/interactions`, interaction)
  return data
}
