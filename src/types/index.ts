export type CompanyLabel = 'ideal' | 'good' | 'average' | 'poor' | 'reject'
export type QualBand = 'pursue_now' | 'pursue_caution' | 'manual_review' | 'reject'
export type CriteriaMode = 'manual' | 'learned' | 'blended'
export type RuleType = 'hard_filter' | 'positive' | 'negative' | 'review_flag'
export type KeywordSignal = 'strong_positive' | 'moderate_positive' | 'neutral' | 'negative' | 'disqualifying' | 'unknown'
export type ResearchStatus = 'pending' | 'researching' | 'complete' | 'failed'

export interface Company {
  id: string
  name: string
  domain: string
  linkedinUrl: string
  description: string
  source: string
  createdAt: string
}

export interface CompanyProfile {
  id: string
  companyId: string
  industry: string
  subindustry: string
  businessModel: string
  customerType: string
  employeeBand: string
  revenueBand: string
  regions: string[]
  growthSignals: string[]
  riskSignals: string[]
  likelyInsuranceNeeds: string[]
  keywords: string[]
  themes: string[]
  confidenceScore: number
  dataSources: string[]
  summary: string
  researchStatus: ResearchStatus
  lastResearchedAt: string
}

export interface TrainingCompany {
  id: string
  trainingSetId: string
  companyId: string
  label: CompanyLabel
  notes: string
  outcome: string
  productRelevance: string
}

export interface TrainingSet {
  id: string
  name: string
  createdAt: string
  companyCount: number
}

export interface BaselineInsights {
  id: string
  trainingSetId: string
  topKeywords: { word: string; count: number; signal: KeywordSignal }[]
  themes: { name: string; keywords: string[]; count: number }[]
  commonTraits: string[]
  negativeTraits: string[]
  differentiators: { trait: string; idealPct: number; poorPct: number }[]
  icpSummary: string
  confidenceScore: number
  topIndustries: { name: string; count: number }[]
  topRegions: { name: string; count: number }[]
}

export interface Criterion {
  id: string
  name: string
  description: string
  ruleType: RuleType
  weight: number
  source: 'manual' | 'learned' | 'keyword'
  productLines: string[]
  required: boolean
  confidenceScore?: number
  supportingCompanies?: string[]
  learningSource?: string
}

export interface CriteriaModel {
  id: string
  name: string
  version: number
  mode: CriteriaMode
  sourceWeights: { manual: number; learned: number; keywords: number }
  manualCriteria: Criterion[]
  learnedCriteria: Criterion[]
  keywordCriteria: Criterion[]
  qualBands: { band: QualBand; min: number; max: number; label: string; color: string }[]
  status: 'draft' | 'active'
  createdAt: string
}

export interface ScoredCompany {
  id: string
  companyId: string
  modelId: string
  fitScore: number
  needScore: number
  buyabilityScore: number
  totalScore: number
  qualBand: QualBand
  rationale: string
  matchedManual: { criterionId: string; name: string; impact: number; reason: string }[]
  matchedLearned: { criterionId: string; name: string; impact: number; reason: string }[]
  matchedKeywords: { keyword: string; signal: KeywordSignal; impact: number }[]
  recommendedProducts: string[]
  nextAction: string
  scoredAt: string
}

export interface Activity {
  id: string
  companyId: string
  assignedRep: string
  status: string
  notes: string
  followUpDate: string
}

export interface Tool {
  id: string
  name: string
  type: string
  enabled: boolean
  description: string
  lastUsed: string
  successRate: number
}
