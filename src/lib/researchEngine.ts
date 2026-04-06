import type { CompanyProfile, Company } from '@/types'

// ======= REAL API RESEARCH =======

interface APIKeys {
  openai?: string
  anthropic?: string
  google?: string
  perplexity?: string
  serper?: string
}

export async function researchCompanyReal(company: Company, keys: APIKeys): Promise<{ profile: CompanyProfile; aiProvider: string; dataSources: string[]; errors?: string[] }> {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: company.name,
      domain: company.domain,
      linkedinUrl: company.linkedinUrl,
      keys,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Research API failed')

  const p = data.profile
  return {
    profile: {
      id: company.id + '_profile',
      companyId: company.id,
      industry: p.industry || 'Unknown',
      subindustry: p.subindustry || '',
      businessModel: p.businessModel || 'Unknown',
      customerType: p.customerType || 'Unknown',
      employeeBand: p.employeeBand || 'Unknown',
      revenueBand: p.revenueBand || 'Unknown',
      regions: p.regions || [],
      growthSignals: p.growthSignals || [],
      riskSignals: p.riskSignals || [],
      likelyInsuranceNeeds: p.likelyInsuranceNeeds || [],
      keywords: p.keywords || [],
      themes: p.themes || [],
      confidenceScore: p.confidenceScore || 50,
      dataSources: p.dataSources || data.dataSources || [],
      summary: p.summary || '',
      researchStatus: 'complete',
      lastResearchedAt: new Date().toISOString().split('T')[0],
    },
    aiProvider: data.aiProvider,
    dataSources: data.dataSources,
    errors: data.errors,
  }
}

export async function researchCompaniesReal(
  companies: Company[],
  keys: APIKeys,
  onProgress?: (done: number, total: number, current: string, errors?: string[]) => void,
): Promise<{ profiles: CompanyProfile[]; errors: string[] }> {
  const profiles: CompanyProfile[] = []
  const allErrors: string[] = []

  for (let i = 0; i < companies.length; i++) {
    const c = companies[i]
    onProgress?.(i, companies.length, c.name)
    try {
      const result = await researchCompanyReal(c, keys)
      profiles.push(result.profile)
      if (result.errors) allErrors.push(...result.errors)
    } catch (e: any) {
      allErrors.push(`${c.name}: ${e.message}`)
    }
    // Rate limit: 500ms between calls
    if (i < companies.length - 1) await new Promise(r => setTimeout(r, 500))
  }
  onProgress?.(companies.length, companies.length, 'Done')
  return { profiles, errors: allErrors }
}

// ======= SIMULATED RESEARCH (fallback) =======

const INDUSTRIES = ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail', 'Professional Services', 'Real Estate', 'Construction', 'Transportation', 'Energy', 'Education', 'Media & Entertainment']
const SUBINDUSTRIES: Record<string, string[]> = {
  Technology: ['SaaS', 'Cybersecurity', 'AI/ML', 'Cloud Infrastructure', 'Fintech', 'DevOps'],
  Healthcare: ['Digital Health', 'Biotech', 'Medical Devices', 'Telemedicine'],
  'Financial Services': ['Banking', 'Insurance', 'Wealth Management', 'Payments'],
  Manufacturing: ['Automotive', 'Aerospace', 'Electronics', 'Food & Beverage'],
  Retail: ['E-commerce', 'DTC', 'Marketplace', 'Luxury'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'IT Services'],
}
const EMPLOYEE_BANDS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
const REVENUE_BANDS = ['<$1M', '$1M-$5M', '$5M-$25M', '$25M-$100M', '$100M-$500M', '$500M+']
const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'SaaS', 'Platform', 'Services']
const CUSTOMER_TYPES = ['Enterprise', 'Mid-Market', 'SMB', 'Consumer', 'Government']
const REGIONS_LIST = ['North America', 'Europe', 'UK', 'Asia Pacific', 'Latin America', 'Middle East', 'Global']
const GROWTH_SIGNALS = ['Recent funding round', 'Headcount growth >20%', 'New product launch', 'International expansion', 'Strategic partnership', 'Revenue growth', 'Key hire in C-suite']
const RISK_SIGNALS = ['Recent layoffs', 'Negative press', 'Regulatory scrutiny', 'Key executive departure', 'Declining revenue', 'Lawsuit pending']
const INSURANCE_NEEDS = ['Cyber Liability', 'D&O Insurance', 'E&O / Professional Liability', 'General Liability', 'Property Insurance', 'Workers Compensation', 'Umbrella/Excess', 'Employment Practices Liability', 'Product Liability', 'Key Person Insurance']

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  return () => { h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 13), 0x45d9f3b); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
}

function inferIndustry(domain: string): { industry: string; keywords: string[] } {
  const d = domain.toLowerCase()
  if (d.includes('tech') || d.includes('soft') || d.includes('.io') || d.includes('ai') || d.includes('cyber')) return { industry: 'Technology', keywords: ['technology', 'software'] }
  if (d.includes('health') || d.includes('med') || d.includes('pharma')) return { industry: 'Healthcare', keywords: ['healthcare', 'medical'] }
  if (d.includes('bank') || d.includes('financ') || d.includes('capital')) return { industry: 'Financial Services', keywords: ['finance', 'banking'] }
  if (d.includes('build') || d.includes('construct') || d.includes('prop')) return { industry: 'Construction', keywords: ['construction', 'property'] }
  if (d.includes('law') || d.includes('legal') || d.includes('consult')) return { industry: 'Professional Services', keywords: ['professional', 'consulting'] }
  if (d.includes('shop') || d.includes('retail') || d.includes('store')) return { industry: 'Retail', keywords: ['retail', 'commerce'] }
  return { industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)], keywords: ['business'] }
}

export function researchCompanySimulated(company: Company): CompanyProfile {
  const rand = seededRandom(company.id + company.name)
  const { industry, keywords } = inferIndustry(company.domain || company.name)
  const subs = SUBINDUSTRIES[industry] || ['General']
  const empIdx = Math.min(Math.floor(rand() * EMPLOYEE_BANDS.length), EMPLOYEE_BANDS.length - 1)
  const allKeywords = [...new Set([...keywords, ...company.name.toLowerCase().split(/\W+/).filter(w => w.length > 2)])]

  return {
    id: company.id + '_profile',
    companyId: company.id,
    industry,
    subindustry: subs[Math.floor(rand() * subs.length)],
    businessModel: BUSINESS_MODELS[Math.floor(rand() * BUSINESS_MODELS.length)],
    customerType: CUSTOMER_TYPES[Math.floor(rand() * CUSTOMER_TYPES.length)],
    employeeBand: EMPLOYEE_BANDS[empIdx],
    revenueBand: REVENUE_BANDS[Math.min(empIdx + Math.floor(rand() * 2), REVENUE_BANDS.length - 1)],
    regions: pick(REGIONS_LIST, 1 + Math.floor(rand() * 3)),
    growthSignals: pick(GROWTH_SIGNALS, 1 + Math.floor(rand() * 3)),
    riskSignals: pick(RISK_SIGNALS, Math.floor(rand() * 3)),
    likelyInsuranceNeeds: pick(INSURANCE_NEEDS, 2 + Math.floor(rand() * 4)),
    keywords: allKeywords.slice(0, 8),
    themes: [subs[Math.floor(rand() * subs.length)], industry],
    confidenceScore: 25 + Math.floor(rand() * 20),
    dataSources: ['simulated'],
    summary: `${company.name} (simulated profile — no API keys configured). Appears to be a ${industry.toLowerCase()} company. Add OpenAI, Anthropic, or Google API keys for real research.`,
    researchStatus: 'complete',
    lastResearchedAt: new Date().toISOString().split('T')[0],
  }
}
