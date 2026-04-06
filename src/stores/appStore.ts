import { create } from 'zustand'
import type { Company, CompanyProfile, TrainingSet, TrainingCompany, BaselineInsights, CriteriaModel, ScoredCompany, Activity, Tool } from '@/types'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

const DEMO_TOOLS: Tool[] = [
  { id: '1', name: 'Web Search', type: 'web_search', enabled: true, description: 'Search the web for company information', lastUsed: '2 min ago', successRate: 94 },
  { id: '2', name: 'LinkedIn Lookup', type: 'linkedin_lookup', enabled: true, description: 'Fetch company LinkedIn profile data', lastUsed: '5 min ago', successRate: 87 },
  { id: '3', name: 'Website Scraper', type: 'website_scraper', enabled: true, description: 'Extract data from company websites', lastUsed: '3 min ago', successRate: 91 },
  { id: '4', name: 'Company Enrichment', type: 'company_enrichment', enabled: false, description: 'Clearbit / ZoomInfo enrichment API', lastUsed: 'Never', successRate: 0 },
  { id: '5', name: 'Internal Database', type: 'database_lookup', enabled: true, description: 'Query internal company records', lastUsed: '1 min ago', successRate: 98 },
  { id: '6', name: 'News Lookup', type: 'news_lookup', enabled: true, description: 'Recent news articles about the company', lastUsed: '10 min ago', successRate: 82 },
  { id: '7', name: 'AI Synthesis', type: 'ai_synthesis', enabled: true, description: 'GPT-4 powered analysis and extraction', lastUsed: '1 min ago', successRate: 96 },
  { id: '8', name: 'CRM Lookup', type: 'crm_lookup', enabled: false, description: 'Salesforce / HubSpot CRM data', lastUsed: 'Never', successRate: 0 },
]

const DEMO_COMPANIES: Company[] = [
  { id: 'c1', name: 'Monzo', domain: 'monzo.com', linkedinUrl: 'linkedin.com/company/monzo', description: 'Digital banking platform', source: 'CSV Import', createdAt: '2026-03-15' },
  { id: 'c2', name: 'Revolut', domain: 'revolut.com', linkedinUrl: 'linkedin.com/company/revolut', description: 'Financial super app', source: 'CSV Import', createdAt: '2026-03-15' },
  { id: 'c3', name: 'Deliveroo', domain: 'deliveroo.co.uk', linkedinUrl: 'linkedin.com/company/deliveroo', description: 'Food delivery platform', source: 'Manual', createdAt: '2026-03-16' },
  { id: 'c4', name: 'Darktrace', domain: 'darktrace.com', linkedinUrl: 'linkedin.com/company/darktrace', description: 'AI cybersecurity platform', source: 'CSV Import', createdAt: '2026-03-15' },
  { id: 'c5', name: 'Brewdog', domain: 'brewdog.com', linkedinUrl: 'linkedin.com/company/brewdog', description: 'Craft beer brewery & bar chain', source: 'Manual', createdAt: '2026-03-17' },
  { id: 'c6', name: 'Ocado', domain: 'ocado.com', linkedinUrl: 'linkedin.com/company/ocado', description: 'Online grocery & robotics', source: 'CSV Import', createdAt: '2026-03-15' },
  { id: 'c7', name: 'Starling Bank', domain: 'starlingbank.com', linkedinUrl: 'linkedin.com/company/starling-bank', description: 'Digital bank for businesses', source: 'CSV Import', createdAt: '2026-03-15' },
  { id: 'c8', name: 'Local Plumber Ltd', domain: 'localplumber.co.uk', linkedinUrl: '', description: 'Local plumbing services', source: 'Manual', createdAt: '2026-03-18' },
]

const DEMO_PROFILES: Record<string, CompanyProfile> = {
  c1: { id: 'p1', companyId: 'c1', industry: 'Financial Services', subindustry: 'Digital Banking', businessModel: 'B2C / B2B', customerType: 'B2C', employeeBand: '1000-5000', revenueBand: '£100M-£500M', regions: ['UK', 'Europe'], growthSignals: ['Series funding', 'Rapid hiring', 'Product expansion'], riskSignals: ['Regulatory scrutiny', 'High data sensitivity'], likelyInsuranceNeeds: ['Cyber', 'D&O', 'Professional Indemnity', 'Crime'], keywords: ['fintech', 'digital banking', 'regulated', 'FCA', 'payments', 'open banking'], themes: ['Fintech', 'Regulated Financial Services', 'Data-Heavy'], confidenceScore: 92, dataSources: ['web_search', 'linkedin_lookup', 'website_scraper', 'database_lookup', 'ai_synthesis'], summary: 'Monzo is a leading UK digital bank serving millions of personal and business customers. FCA regulated with significant cyber exposure and growing B2B operations.', researchStatus: 'complete', lastResearchedAt: '2026-03-20' },
  c2: { id: 'p2', companyId: 'c2', industry: 'Financial Services', subindustry: 'Digital Banking', businessModel: 'B2C / B2B', customerType: 'B2C', employeeBand: '5000+', revenueBand: '£500M+', regions: ['UK', 'Europe', 'Global'], growthSignals: ['Global expansion', 'Revenue growth', 'New product lines'], riskSignals: ['Regulatory challenges', 'Multi-jurisdiction'], likelyInsuranceNeeds: ['Cyber', 'D&O', 'Professional Indemnity', 'Crime', 'E&O'], keywords: ['fintech', 'super app', 'global', 'crypto', 'payments', 'trading'], themes: ['Fintech', 'Global Operations', 'Data-Heavy'], confidenceScore: 95, dataSources: ['web_search', 'linkedin_lookup', 'website_scraper', 'database_lookup', 'ai_synthesis', 'news_lookup'], summary: 'Revolut is a global financial super app with banking, crypto, trading, and insurance products. Operating in 35+ countries with extensive regulatory obligations.', researchStatus: 'complete', lastResearchedAt: '2026-03-20' },
  c4: { id: 'p4', companyId: 'c4', industry: 'Technology', subindustry: 'Cybersecurity', businessModel: 'B2B', customerType: 'B2B', employeeBand: '1000-5000', revenueBand: '£100M-£500M', regions: ['UK', 'US', 'Global'], growthSignals: ['IPO', 'Government contracts', 'AI leadership'], riskSignals: ['High-value target', 'Sensitive client data'], likelyInsuranceNeeds: ['Cyber', 'D&O', 'Professional Indemnity', 'Tech E&O'], keywords: ['cybersecurity', 'AI', 'enterprise', 'threat detection', 'autonomous response'], themes: ['Enterprise Tech', 'Cybersecurity', 'AI/ML'], confidenceScore: 90, dataSources: ['web_search', 'linkedin_lookup', 'website_scraper', 'ai_synthesis'], summary: 'Darktrace is a leading AI cybersecurity company providing autonomous threat detection and response for enterprises globally.', researchStatus: 'complete', lastResearchedAt: '2026-03-21' },
  c8: { id: 'p8', companyId: 'c8', industry: 'Trade Services', subindustry: 'Plumbing', businessModel: 'B2C', customerType: 'B2C', employeeBand: '1-10', revenueBand: '<£500K', regions: ['UK - Local'], growthSignals: [], riskSignals: [], likelyInsuranceNeeds: ['Public Liability'], keywords: ['local', 'plumbing', 'trade', 'residential'], themes: ['Local Services'], confidenceScore: 45, dataSources: ['web_search'], summary: 'Small local plumbing company with minimal digital presence. Low complexity, low insurance need beyond basic liability.', researchStatus: 'complete', lastResearchedAt: '2026-03-22' },
}

const DEMO_TRAINING_SET: TrainingSet = { id: 'ts1', name: 'Q1 2026 Baseline', createdAt: '2026-03-15', companyCount: 8 }

const DEMO_TRAINING_COMPANIES: TrainingCompany[] = [
  { id: 'tc1', trainingSetId: 'ts1', companyId: 'c1', label: 'ideal', notes: 'Perfect fintech target', outcome: 'won', productRelevance: 'Cyber, D&O' },
  { id: 'tc2', trainingSetId: 'ts1', companyId: 'c2', label: 'ideal', notes: 'Large fintech, complex needs', outcome: 'won', productRelevance: 'Cyber, D&O, Crime' },
  { id: 'tc3', trainingSetId: 'ts1', companyId: 'c3', label: 'good', notes: 'Tech platform, some complexity', outcome: 'in_progress', productRelevance: 'Cyber, Public Liability' },
  { id: 'tc4', trainingSetId: 'ts1', companyId: 'c4', label: 'ideal', notes: 'Enterprise cyber company', outcome: 'won', productRelevance: 'Cyber, D&O, Tech E&O' },
  { id: 'tc5', trainingSetId: 'ts1', companyId: 'c5', label: 'average', notes: 'Physical ops, some digital', outcome: 'lost', productRelevance: 'Property, Public Liability' },
  { id: 'tc6', trainingSetId: 'ts1', companyId: 'c6', label: 'good', notes: 'Tech + physical hybrid', outcome: 'won', productRelevance: 'Cyber, Property, D&O' },
  { id: 'tc7', trainingSetId: 'ts1', companyId: 'c7', label: 'ideal', notes: 'Digital bank', outcome: 'won', productRelevance: 'Cyber, D&O, PI' },
  { id: 'tc8', trainingSetId: 'ts1', companyId: 'c8', label: 'reject', notes: 'Too small, no complexity', outcome: 'rejected', productRelevance: 'N/A' },
]

const DEMO_INSIGHTS: BaselineInsights = {
  id: 'bi1', trainingSetId: 'ts1',
  topKeywords: [
    { word: 'fintech', count: 4, signal: 'strong_positive' },
    { word: 'regulated', count: 3, signal: 'strong_positive' },
    { word: 'digital banking', count: 3, signal: 'strong_positive' },
    { word: 'cyber exposure', count: 5, signal: 'strong_positive' },
    { word: 'enterprise', count: 3, signal: 'moderate_positive' },
    { word: 'B2B', count: 4, signal: 'moderate_positive' },
    { word: 'AI', count: 2, signal: 'moderate_positive' },
    { word: 'local services', count: 1, signal: 'negative' },
    { word: 'low complexity', count: 1, signal: 'disqualifying' },
    { word: 'payments', count: 3, signal: 'strong_positive' },
    { word: 'data-heavy', count: 4, signal: 'strong_positive' },
    { word: 'global', count: 2, signal: 'moderate_positive' },
  ],
  themes: [
    { name: 'Fintech', keywords: ['fintech', 'digital banking', 'payments', 'open banking', 'crypto'], count: 5 },
    { name: 'Data-Heavy', keywords: ['data sensitivity', 'cyber exposure', 'PII', 'regulated data'], count: 4 },
    { name: 'Enterprise Tech', keywords: ['enterprise', 'SaaS', 'B2B', 'platform'], count: 3 },
    { name: 'Regulated Industries', keywords: ['FCA', 'regulated', 'compliance', 'licenced'], count: 3 },
  ],
  commonTraits: ['FCA or PRA regulated', 'Significant digital operations', 'Handles sensitive customer data', 'Revenue >£10M', '100+ employees', 'B2B or B2B2C model'],
  negativeTraits: ['Local-only operations', 'Sub-10 employees', 'No digital presence', 'Low data sensitivity', 'Simple service business'],
  differentiators: [
    { trait: 'Handles regulated data', idealPct: 100, poorPct: 0 },
    { trait: 'Revenue >£50M', idealPct: 85, poorPct: 10 },
    { trait: 'B2B component', idealPct: 90, poorPct: 20 },
    { trait: 'Tech-first business', idealPct: 95, poorPct: 15 },
    { trait: 'Multi-region operations', idealPct: 70, poorPct: 5 },
  ],
  icpSummary: 'Ideal targets are UK-based technology or fintech companies with £50M+ revenue, 100+ employees, significant digital operations, high data sensitivity, regulatory obligations, and complex insurance needs (Cyber, D&O, PI). They typically handle sensitive customer data and operate in multiple jurisdictions.',
  confidenceScore: 88,
  topIndustries: [{ name: 'Financial Services', count: 4 }, { name: 'Technology', count: 2 }, { name: 'E-commerce/Logistics', count: 1 }],
  topRegions: [{ name: 'UK', count: 8 }, { name: 'Europe', count: 3 }, { name: 'Global', count: 2 }],
}

const DEMO_MODEL: CriteriaModel = {
  id: 'cm1', name: 'Q1 2026 Model', version: 1, mode: 'blended',
  sourceWeights: { manual: 0.5, learned: 0.35, keywords: 0.15 },
  manualCriteria: [
    { id: 'mc1', name: 'UK or US operations', description: 'Company must operate in UK or US', ruleType: 'hard_filter', weight: 1, source: 'manual', productLines: ['All'], required: true },
    { id: 'mc2', name: 'Revenue >£10M', description: 'Minimum revenue threshold', ruleType: 'hard_filter', weight: 1, source: 'manual', productLines: ['All'], required: true },
    { id: 'mc3', name: 'B2B SaaS premium', description: 'Higher score for B2B SaaS companies', ruleType: 'positive', weight: 0.8, source: 'manual', productLines: ['Cyber', 'Tech E&O'], required: false },
    { id: 'mc4', name: 'Low-complexity retail penalty', description: 'Lower score for simple retail', ruleType: 'negative', weight: 0.6, source: 'manual', productLines: ['All'], required: false },
    { id: 'mc5', name: 'No cyber exposure flag', description: 'Flag if unclear cyber risk', ruleType: 'review_flag', weight: 0.3, source: 'manual', productLines: ['Cyber'], required: false },
  ],
  learnedCriteria: [
    { id: 'lc1', name: 'FCA regulated entity', description: 'Companies regulated by FCA score significantly higher', ruleType: 'positive', weight: 0.9, source: 'learned', productLines: ['D&O', 'PI', 'Cyber'], required: false, confidenceScore: 92, supportingCompanies: ['Monzo', 'Revolut', 'Starling Bank'], learningSource: 'Baseline analysis' },
    { id: 'lc2', name: 'Handles PII at scale', description: 'Companies processing large volumes of personal data', ruleType: 'positive', weight: 0.85, source: 'learned', productLines: ['Cyber', 'Crime'], required: false, confidenceScore: 88, supportingCompanies: ['Monzo', 'Revolut', 'Deliveroo'], learningSource: 'Keyword extraction' },
    { id: 'lc3', name: 'Sub-50 employees disqualifier', description: 'Very small companies rarely convert', ruleType: 'negative', weight: 0.7, source: 'learned', productLines: ['All'], required: false, confidenceScore: 78, supportingCompanies: ['Local Plumber Ltd'], learningSource: 'Outcome analysis' },
  ],
  keywordCriteria: [
    { id: 'kc1', name: 'Fintech keywords', description: 'fintech, digital banking, payments', ruleType: 'positive', weight: 0.7, source: 'keyword', productLines: ['Cyber', 'D&O'], required: false },
    { id: 'kc2', name: 'Enterprise tech keywords', description: 'enterprise, SaaS, platform, B2B', ruleType: 'positive', weight: 0.6, source: 'keyword', productLines: ['Cyber', 'Tech E&O'], required: false },
    { id: 'kc3', name: 'Local services keywords', description: 'local, residential, trade', ruleType: 'negative', weight: 0.5, source: 'keyword', productLines: ['All'], required: false },
  ],
  qualBands: [
    { band: 'pursue_now', min: 80, max: 100, label: 'Pursue Now', color: '#10B981' },
    { band: 'pursue_caution', min: 60, max: 79, label: 'Pursue with Caution', color: '#F59E0B' },
    { band: 'manual_review', min: 40, max: 59, label: 'Manual Review', color: '#3B82F6' },
    { band: 'reject', min: 0, max: 39, label: 'Reject', color: '#EF4444' },
  ],
  status: 'active', createdAt: '2026-03-20',
}

const DEMO_SCORES: ScoredCompany[] = [
  { id: 's1', companyId: 'c1', modelId: 'cm1', fitScore: 92, needScore: 88, buyabilityScore: 85, totalScore: 89, qualBand: 'pursue_now', rationale: 'Monzo is an ideal target: FCA-regulated digital bank with extensive cyber exposure, handling millions of customer records. Strong fit across Cyber, D&O, and PI lines. Revenue and scale meet all thresholds.', matchedManual: [{ criterionId: 'mc1', name: 'UK or US operations', impact: 10, reason: 'UK-headquartered' }, { criterionId: 'mc2', name: 'Revenue >£10M', impact: 10, reason: 'Revenue £100M-£500M' }], matchedLearned: [{ criterionId: 'lc1', name: 'FCA regulated entity', impact: 15, reason: 'FCA regulated bank' }, { criterionId: 'lc2', name: 'Handles PII at scale', impact: 14, reason: 'Millions of customer accounts' }], matchedKeywords: [{ keyword: 'fintech', signal: 'strong_positive', impact: 8 }, { keyword: 'digital banking', signal: 'strong_positive', impact: 7 }], recommendedProducts: ['Cyber Liability', 'D&O', 'Professional Indemnity', 'Crime'], nextAction: 'Priority outreach — prepare tailored Cyber + D&O proposal', scoredAt: '2026-03-20' },
  { id: 's4', companyId: 'c4', modelId: 'cm1', fitScore: 88, needScore: 82, buyabilityScore: 78, totalScore: 83, qualBand: 'pursue_now', rationale: 'Darktrace is a strong target: listed cybersecurity company with significant enterprise client base. High exposure to tech E&O and cyber claims. D&O needs driven by public company status.', matchedManual: [{ criterionId: 'mc1', name: 'UK or US operations', impact: 10, reason: 'UK + US operations' }, { criterionId: 'mc3', name: 'B2B SaaS premium', impact: 12, reason: 'Enterprise B2B software' }], matchedLearned: [{ criterionId: 'lc2', name: 'Handles PII at scale', impact: 10, reason: 'Accesses client security data' }], matchedKeywords: [{ keyword: 'cybersecurity', signal: 'strong_positive', impact: 8 }, { keyword: 'enterprise', signal: 'moderate_positive', impact: 5 }], recommendedProducts: ['Cyber Liability', 'D&O', 'Tech E&O'], nextAction: 'Research recent contracts — approach with tech-specific proposal', scoredAt: '2026-03-21' },
  { id: 's8', companyId: 'c8', modelId: 'cm1', fitScore: 12, needScore: 15, buyabilityScore: 20, totalScore: 15, qualBand: 'reject', rationale: 'Local Plumber Ltd fails multiple criteria: sub-10 employees, sub-£500K revenue, no digital complexity, no cyber exposure. Only basic public liability need which is outside our focus.', matchedManual: [{ criterionId: 'mc4', name: 'Low-complexity retail penalty', impact: -15, reason: 'Simple local service business' }], matchedLearned: [{ criterionId: 'lc3', name: 'Sub-50 employees disqualifier', impact: -20, reason: '1-10 employees' }], matchedKeywords: [{ keyword: 'local', signal: 'negative', impact: -8 }], recommendedProducts: ['None — outside target profile'], nextAction: 'No action — does not meet minimum criteria', scoredAt: '2026-03-22' },
]

interface AppState {
  companies: Company[]
  profiles: Record<string, CompanyProfile>
  trainingSets: TrainingSet[]
  trainingCompanies: TrainingCompany[]
  insights: BaselineInsights | null
  model: CriteriaModel
  scores: ScoredCompany[]
  activities: Activity[]
  tools: Tool[]
  addCompany: (c: Omit<Company, 'id' | 'createdAt'>) => string
  updateModel: (m: Partial<CriteriaModel>) => void
  scoreCompany: (companyId: string) => ScoredCompany | null
}

export const useAppStore = create<AppState>((set, get) => ({
  companies: DEMO_COMPANIES,
  profiles: DEMO_PROFILES,
  trainingSets: [DEMO_TRAINING_SET],
  trainingCompanies: DEMO_TRAINING_COMPANIES,
  insights: DEMO_INSIGHTS,
  model: DEMO_MODEL,
  scores: DEMO_SCORES,
  activities: [
    { id: 'a1', companyId: 'c1', assignedRep: 'Sarah K.', status: 'Proposal Sent', notes: 'Sent Cyber + D&O proposal 20 Mar', followUpDate: '2026-04-05' },
    { id: 'a4', companyId: 'c4', assignedRep: 'James T.', status: 'Initial Outreach', notes: 'Researching recent contracts', followUpDate: '2026-04-08' },
  ],
  tools: DEMO_TOOLS,
  addCompany: (c) => {
    const id = uid()
    set(s => ({ companies: [...s.companies, { ...c, id, createdAt: new Date().toISOString().split('T')[0] }] }))
    return id
  },
  updateModel: (m) => set(s => ({ model: { ...s.model, ...m } })),
  scoreCompany: (companyId) => {
    const { profiles, model } = get()
    const profile = profiles[companyId]
    if (!profile) return null
    const fitScore = Math.min(100, Math.round(profile.confidenceScore * 0.9 + (profile.keywords.length * 2)))
    const needScore = Math.min(100, Math.round(profile.likelyInsuranceNeeds.length * 18))
    const buyabilityScore = Math.min(100, Math.round(profile.confidenceScore * 0.7 + (profile.regions.length * 10)))
    const totalScore = Math.round(fitScore * 0.4 + needScore * 0.35 + buyabilityScore * 0.25)
    const qualBand = model.qualBands.find(b => totalScore >= b.min && totalScore <= b.max)?.band || 'manual_review'
    const scored: ScoredCompany = {
      id: uid(), companyId, modelId: model.id, fitScore, needScore, buyabilityScore, totalScore, qualBand,
      rationale: `Score based on ${profile.dataSources.length} data sources. Industry: ${profile.industry}. Key signals: ${profile.growthSignals.join(', ') || 'none detected'}.`,
      matchedManual: [], matchedLearned: [], matchedKeywords: profile.keywords.map(k => ({ keyword: k, signal: 'moderate_positive' as const, impact: 3 })),
      recommendedProducts: profile.likelyInsuranceNeeds,
      nextAction: totalScore >= 80 ? 'Priority outreach' : totalScore >= 60 ? 'Research further, then approach' : totalScore >= 40 ? 'Needs manual review' : 'No action recommended',
      scoredAt: new Date().toISOString().split('T')[0],
    }
    set(s => ({ scores: [...s.scores, scored] }))
    return scored
  },
}))
