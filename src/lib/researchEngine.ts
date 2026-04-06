import type { CompanyProfile, Company } from '@/types'

const INDUSTRIES = ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail', 'Professional Services', 'Real Estate', 'Construction', 'Transportation', 'Energy', 'Education', 'Media & Entertainment', 'Agriculture', 'Hospitality']
const SUBINDUSTRIES: Record<string, string[]> = {
  Technology: ['SaaS', 'Cybersecurity', 'AI/ML', 'Cloud Infrastructure', 'Fintech', 'DevOps', 'Data Analytics', 'IoT'],
  Healthcare: ['Digital Health', 'Biotech', 'Medical Devices', 'Telemedicine', 'Pharmaceuticals', 'Health Insurance'],
  'Financial Services': ['Banking', 'Insurance', 'Wealth Management', 'Payments', 'Lending', 'Capital Markets'],
  Manufacturing: ['Automotive', 'Aerospace', 'Electronics', 'Food & Beverage', 'Chemicals', 'Textiles'],
  Retail: ['E-commerce', 'Brick & Mortar', 'DTC', 'Marketplace', 'Luxury', 'Grocery'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'Staffing', 'Marketing Agency', 'IT Services'],
  'Real Estate': ['Commercial', 'Residential', 'PropTech', 'REIT', 'Property Management'],
  Construction: ['General Contractor', 'Specialty Trade', 'Engineering', 'Architecture'],
}
const EMPLOYEE_BANDS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']
const REVENUE_BANDS = ['<$1M', '$1M-$5M', '$5M-$25M', '$25M-$100M', '$100M-$500M', '$500M+']
const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'SaaS', 'Platform', 'Services', 'Hybrid']
const CUSTOMER_TYPES = ['Enterprise', 'Mid-Market', 'SMB', 'Consumer', 'Government', 'Non-Profit']
const REGIONS_LIST = ['North America', 'Europe', 'UK', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa', 'Global']
const GROWTH_SIGNALS = ['Recent funding round', 'Headcount growth >20%', 'New product launch', 'International expansion', 'Strategic partnership', 'Revenue growth', 'New office opening', 'Key hire in C-suite', 'Award/recognition', 'Market expansion']
const RISK_SIGNALS = ['Recent layoffs', 'Negative press', 'Regulatory scrutiny', 'Key executive departure', 'Declining revenue', 'High debt', 'Lawsuit pending', 'Customer complaints', 'Data breach', 'Market contraction']
const INSURANCE_NEEDS = ['Cyber Liability', 'D&O Insurance', 'E&O / Professional Liability', 'General Liability', 'Property Insurance', 'Workers Compensation', 'Commercial Auto', 'Umbrella/Excess', 'Employment Practices Liability', 'Product Liability', 'Key Person Insurance', 'Business Interruption', 'Crime/Fidelity', 'Marine Cargo']

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
    h = (h ^ (h >>> 16)) >>> 0
    return h / 4294967296
  }
}

function inferFromDomain(domain: string): { industry: string; keywords: string[] } {
  const d = domain.toLowerCase()
  const keywords: string[] = []

  if (d.includes('tech') || d.includes('soft') || d.includes('.io') || d.includes('dev') || d.includes('cloud') || d.includes('data') || d.includes('ai') || d.includes('cyber')) {
    keywords.push('technology', 'software', 'digital')
    return { industry: 'Technology', keywords }
  }
  if (d.includes('health') || d.includes('med') || d.includes('pharma') || d.includes('bio') || d.includes('care')) {
    keywords.push('healthcare', 'medical', 'health')
    return { industry: 'Healthcare', keywords }
  }
  if (d.includes('bank') || d.includes('financ') || d.includes('capital') || d.includes('invest') || d.includes('fund')) {
    keywords.push('finance', 'banking', 'capital')
    return { industry: 'Financial Services', keywords }
  }
  if (d.includes('build') || d.includes('construct') || d.includes('prop') || d.includes('estate') || d.includes('home')) {
    keywords.push('construction', 'property', 'building')
    return { industry: 'Construction', keywords }
  }
  if (d.includes('law') || d.includes('legal') || d.includes('consult') || d.includes('adviso')) {
    keywords.push('professional', 'advisory', 'consulting')
    return { industry: 'Professional Services', keywords }
  }
  if (d.includes('shop') || d.includes('store') || d.includes('retail') || d.includes('buy') || d.includes('market')) {
    keywords.push('retail', 'commerce', 'consumer')
    return { industry: 'Retail', keywords }
  }
  if (d.includes('energy') || d.includes('power') || d.includes('solar') || d.includes('oil') || d.includes('gas')) {
    keywords.push('energy', 'utilities', 'power')
    return { industry: 'Energy', keywords }
  }
  if (d.includes('manufact') || d.includes('industr') || d.includes('auto') || d.includes('aero')) {
    keywords.push('manufacturing', 'industrial', 'production')
    return { industry: 'Manufacturing', keywords }
  }

  keywords.push('business', 'services')
  return { industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)], keywords }
}

function inferFromName(name: string): string[] {
  const n = name.toLowerCase()
  const keywords: string[] = []
  const nameWords = n.split(/\W+/).filter(w => w.length > 2)
  keywords.push(...nameWords)
  if (n.includes('global') || n.includes('international')) keywords.push('international', 'global')
  if (n.includes('solutions') || n.includes('services')) keywords.push('services')
  if (n.includes('group') || n.includes('holdings')) keywords.push('conglomerate', 'diversified')
  return keywords
}

/**
 * Generate a simulated company profile based on available data.
 * In production, this would call AI APIs. For now, uses domain/name inference
 * with seeded randomness for consistency.
 */
export function researchCompany(company: Company): CompanyProfile {
  const rand = seededRandom(company.id + company.name + company.domain)
  const { industry, keywords: domainKeywords } = inferFromDomain(company.domain || company.name)
  const nameKeywords = inferFromName(company.name)
  const subs = SUBINDUSTRIES[industry] || ['General']
  const subindustry = subs[Math.floor(rand() * subs.length)]

  const empIdx = Math.min(Math.floor(rand() * EMPLOYEE_BANDS.length), EMPLOYEE_BANDS.length - 1)
  const revIdx = Math.min(empIdx + Math.floor(rand() * 2), REVENUE_BANDS.length - 1)

  const numGrowth = 1 + Math.floor(rand() * 3)
  const numRisk = Math.floor(rand() * 3)
  const numNeeds = 2 + Math.floor(rand() * 4)
  const numRegions = 1 + Math.floor(rand() * 3)

  const allKeywords = [...new Set([...domainKeywords, ...nameKeywords, industry.toLowerCase(), subindustry.toLowerCase()])]
  const themes = [subindustry, industry]
  if (rand() > 0.5) themes.push('Growth Stage')
  if (rand() > 0.6) themes.push('Risk Aware')

  const dataSources: string[] = ['web_search']
  if (company.domain) dataSources.push('website_scraper')
  if (company.linkedinUrl) dataSources.push('linkedin_lookup')
  if (rand() > 0.3) dataSources.push('news_lookup')
  if (rand() > 0.5) dataSources.push('ai_synthesis')

  const confidenceBase = 30
  const confidenceBonus = dataSources.length * 10 + (company.description ? 10 : 0) + (company.domain ? 5 : 0) + (company.linkedinUrl ? 5 : 0)
  const confidence = Math.min(95, confidenceBase + confidenceBonus + Math.floor(rand() * 10))

  const summary = `${company.name} is a ${EMPLOYEE_BANDS[empIdx]} employee ${subindustry.toLowerCase()} company in the ${industry.toLowerCase()} sector. ${BUSINESS_MODELS[Math.floor(rand() * BUSINESS_MODELS.length)]} model targeting ${CUSTOMER_TYPES[Math.floor(rand() * CUSTOMER_TYPES.length)].toLowerCase()} customers. Research based on ${dataSources.length} data sources with ${confidence}% confidence.`

  return {
    id: company.id + '_profile',
    companyId: company.id,
    industry,
    subindustry,
    businessModel: BUSINESS_MODELS[Math.floor(rand() * BUSINESS_MODELS.length)],
    customerType: CUSTOMER_TYPES[Math.floor(rand() * CUSTOMER_TYPES.length)],
    employeeBand: EMPLOYEE_BANDS[empIdx],
    revenueBand: REVENUE_BANDS[revIdx],
    regions: pick(REGIONS_LIST, numRegions),
    growthSignals: pick(GROWTH_SIGNALS, numGrowth),
    riskSignals: pick(RISK_SIGNALS, numRisk),
    likelyInsuranceNeeds: pick(INSURANCE_NEEDS, numNeeds),
    keywords: allKeywords.slice(0, 8),
    themes,
    confidenceScore: confidence,
    dataSources,
    summary,
    researchStatus: 'complete',
    lastResearchedAt: new Date().toISOString().split('T')[0],
  }
}

/**
 * Research multiple companies with a simulated delay.
 */
export function researchCompanies(companies: Company[], onProgress?: (done: number, total: number) => void): Promise<CompanyProfile[]> {
  return new Promise(resolve => {
    const profiles: CompanyProfile[] = []
    let i = 0
    const tick = () => {
      if (i >= companies.length) { resolve(profiles); return }
      profiles.push(researchCompany(companies[i]))
      i++
      onProgress?.(i, companies.length)
      setTimeout(tick, 150 + Math.random() * 200)
    }
    tick()
  })
}
