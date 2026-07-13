export type Lead = {
  leadId: string
  date: string
  customerName: string
  customerEmail: string
  customerPhone: string
  leadSource: string
  zip: string
  service: string
  mode: string
  propertyType: string
  quantity: number
  estimateLow: number
  estimateHigh: number
  confidence: string
  reviewFlag: string
  subPayoutLow: number
  subPayoutHigh: number
  companyGrossLow: number
  companyGrossHigh: number
  passThroughCosts: number
  photosUploaded: string
  wonLostPending: string
  finalPrice: number | null
  lostReason: string
  upsellsAccepted: string
  recurringOpportunity: string
  notes: string
  strategicAccount: string
  rangeMath: string
  passThroughCoveredBy: string
  passThroughType: string
  actualJobDifficulty: number | null
  cleaningPhase: string
  debrisLevel: string
  estimateMode: string
}

export type Metrics = {
  totalLeads: number
  totalEstimateLow: number
  totalEstimateHigh: number
  averageTicket: number
  wonDealsTotal: number
  winRate: number
  reviewFlaggedPct: number
  byRevenueBucket: Array<{ bucket: string; estLow: number; leads: number }>
  byLeadSource: Array<{ source: string; leads: number }>
  byMode: Array<{ mode: string; leads: number }>
  byPropertyType: Array<{ type: string; leads: number }>
  byService: Array<{ service: string; leads: number; estLow: number }>
  byZip: Array<{ zip: string; leads: number; avgTicket: number }>
  byConfidence: Array<{ confidence: string; leads: number }>
  dailyLeads: Array<{ date: string; leads: number }>
  strategicLeads: Lead[]
  reviewFlaggedLeads: Lead[]
  byRecurringOpportunity: Array<{ tier: string; leads: number }>
  byEstimateMode: Array<{ mode: string; leads: number }>
  contactableLeads: Lead[]
}
