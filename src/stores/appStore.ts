import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company, CompanyProfile, TrainingSet, TrainingCompany, BaselineInsights, CriteriaModel, ScoredCompany, Activity, Tool, QualBand } from '@/types'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

const DEFAULT_TOOLS: Tool[] = [
  { id: '1', name: 'Web Search', type: 'web_search', enabled: true, description: 'Search the web for company information', lastUsed: 'Never', successRate: 0 },
  { id: '2', name: 'LinkedIn Lookup', type: 'linkedin_lookup', enabled: false, description: 'Fetch company LinkedIn profile data', lastUsed: 'Never', successRate: 0 },
  { id: '3', name: 'Website Scraper', type: 'website_scraper', enabled: true, description: 'Extract data from company websites', lastUsed: 'Never', successRate: 0 },
  { id: '4', name: 'Company Enrichment', type: 'company_enrichment', enabled: false, description: 'Clearbit / ZoomInfo enrichment API', lastUsed: 'Never', successRate: 0 },
  { id: '5', name: 'Internal Database', type: 'database_lookup', enabled: true, description: 'Query internal company records', lastUsed: 'Never', successRate: 0 },
  { id: '6', name: 'News Lookup', type: 'news_lookup', enabled: true, description: 'Recent news articles about the company', lastUsed: 'Never', successRate: 0 },
  { id: '7', name: 'AI Synthesis', type: 'ai_synthesis', enabled: true, description: 'LLM-powered analysis and extraction', lastUsed: 'Never', successRate: 0 },
  { id: '8', name: 'CRM Lookup', type: 'crm_lookup', enabled: false, description: 'Salesforce / HubSpot CRM data', lastUsed: 'Never', successRate: 0 },
]

const DEFAULT_MODEL: CriteriaModel = {
  id: 'cm1', name: 'Default Model', version: 1, mode: 'blended',
  sourceWeights: { manual: 0.5, learned: 0.35, keywords: 0.15 },
  manualCriteria: [], learnedCriteria: [], keywordCriteria: [],
  qualBands: [
    { band: 'pursue_now', min: 80, max: 100, label: 'Pursue Now', color: '#10B981' },
    { band: 'pursue_caution', min: 60, max: 79, label: 'Pursue with Caution', color: '#F59E0B' },
    { band: 'manual_review', min: 40, max: 59, label: 'Manual Review', color: '#3B82F6' },
    { band: 'reject', min: 0, max: 39, label: 'Reject', color: '#EF4444' },
  ],
  status: 'draft', createdAt: new Date().toISOString().split('T')[0],
}

export interface APIKey {
  id: string
  provider: string
  label: string
  key: string
  addedAt: string
  lastUsed: string
  status: 'active' | 'invalid' | 'untested'
}

interface AppState {
  // Data
  companies: Company[]
  profiles: Record<string, CompanyProfile>
  trainingSets: TrainingSet[]
  trainingCompanies: TrainingCompany[]
  insights: BaselineInsights | null
  model: CriteriaModel
  scores: ScoredCompany[]
  activities: Activity[]
  tools: Tool[]
  apiKeys: APIKey[]

  // Actions - Companies
  addCompany: (c: Omit<Company, 'id' | 'createdAt'>) => string
  addCompanies: (cs: Omit<Company, 'id' | 'createdAt'>[]) => string[]
  removeCompany: (id: string) => void

  // Actions - Training
  createTrainingSet: (name: string) => string
  addTrainingCompany: (tc: Omit<TrainingCompany, 'id'>) => void
  removeTrainingCompany: (id: string) => void

  // Actions - Profiles
  setProfile: (companyId: string, profile: CompanyProfile) => void

  // Actions - Insights
  setInsights: (insights: BaselineInsights) => void

  // Actions - Model
  updateModel: (m: Partial<CriteriaModel>) => void

  // Actions - Scoring
  addScore: (score: Omit<ScoredCompany, 'id'>) => void
  scoreCompany: (companyId: string) => ScoredCompany | null

  // Actions - Tools
  toggleTool: (id: string) => void

  // Actions - API Keys
  addAPIKey: (key: Omit<APIKey, 'id' | 'addedAt' | 'lastUsed' | 'status'>) => void
  removeAPIKey: (id: string) => void
  getAPIKey: (provider: string) => string | null

  // Actions - Activities
  addActivity: (a: Omit<Activity, 'id'>) => void

  // Actions - Reset
  clearAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      companies: [],
      profiles: {},
      trainingSets: [],
      trainingCompanies: [],
      insights: null,
      model: DEFAULT_MODEL,
      scores: [],
      activities: [],
      tools: DEFAULT_TOOLS,
      apiKeys: [],

      addCompany: (c) => {
        const id = uid()
        set(s => ({ companies: [...s.companies, { ...c, id, createdAt: new Date().toISOString().split('T')[0] }] }))
        return id
      },
      addCompanies: (cs) => {
        const ids: string[] = []
        const newCompanies = cs.map(c => {
          const id = uid()
          ids.push(id)
          return { ...c, id, createdAt: new Date().toISOString().split('T')[0] }
        })
        set(s => ({ companies: [...s.companies, ...newCompanies] }))
        return ids
      },
      removeCompany: (id) => set(s => ({
        companies: s.companies.filter(c => c.id !== id),
        trainingCompanies: s.trainingCompanies.filter(tc => tc.companyId !== id),
        scores: s.scores.filter(sc => sc.companyId !== id),
        activities: s.activities.filter(a => a.companyId !== id),
      })),

      createTrainingSet: (name) => {
        const id = uid()
        set(s => ({ trainingSets: [...s.trainingSets, { id, name, createdAt: new Date().toISOString().split('T')[0], companyCount: 0 }] }))
        return id
      },
      addTrainingCompany: (tc) => {
        const id = uid()
        set(s => {
          const updated = s.trainingSets.map(ts => ts.id === tc.trainingSetId ? { ...ts, companyCount: ts.companyCount + 1 } : ts)
          return { trainingCompanies: [...s.trainingCompanies, { ...tc, id }], trainingSets: updated }
        })
      },
      removeTrainingCompany: (id) => set(s => ({
        trainingCompanies: s.trainingCompanies.filter(tc => tc.id !== id),
      })),

      setProfile: (companyId, profile) => set(s => ({ profiles: { ...s.profiles, [companyId]: profile } })),
      setInsights: (insights) => set({ insights }),
      updateModel: (m) => set(s => ({ model: { ...s.model, ...m } })),

      addScore: (score) => {
        const id = uid()
        set(s => ({ scores: [...s.scores, { ...score, id } as ScoredCompany] }))
      },
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
          id: uid(), companyId, modelId: model.id, fitScore, needScore, buyabilityScore, totalScore, qualBand: qualBand as QualBand,
          rationale: `Score based on ${profile.dataSources.length} data sources. Industry: ${profile.industry}. Key signals: ${profile.growthSignals.join(', ') || 'none detected'}.`,
          matchedManual: [], matchedLearned: [],
          matchedKeywords: profile.keywords.map(k => ({ keyword: k, signal: 'moderate_positive' as const, impact: 3 })),
          recommendedProducts: profile.likelyInsuranceNeeds,
          nextAction: totalScore >= 80 ? 'Priority outreach' : totalScore >= 60 ? 'Research further, then approach' : totalScore >= 40 ? 'Needs manual review' : 'No action recommended',
          scoredAt: new Date().toISOString().split('T')[0],
        }
        set(s => ({ scores: [...s.scores, scored] }))
        return scored
      },

      toggleTool: (id) => set(s => ({
        tools: s.tools.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t),
      })),

      addAPIKey: (key) => set(s => ({
        apiKeys: [...s.apiKeys, { ...key, id: uid(), addedAt: new Date().toISOString().split('T')[0], lastUsed: 'Never', status: 'untested' }],
      })),
      removeAPIKey: (id) => set(s => ({ apiKeys: s.apiKeys.filter(k => k.id !== id) })),
      getAPIKey: (provider) => {
        const key = get().apiKeys.find(k => k.provider === provider && k.status !== 'invalid')
        return key?.key || null
      },

      addActivity: (a) => set(s => ({ activities: [...s.activities, { ...a, id: uid() }] })),

      clearAll: () => set({
        companies: [], profiles: {}, trainingSets: [], trainingCompanies: [],
        insights: null, model: DEFAULT_MODEL, scores: [], activities: [],
        tools: DEFAULT_TOOLS, apiKeys: [],
      }),
    }),
    { name: 'cq-store' }
  )
)
