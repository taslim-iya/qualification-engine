import type { Company, CompanyProfile, TrainingCompany, BaselineInsights, KeywordSignal } from '@/types'

/**
 * Generate baseline insights from training companies and their profiles.
 * This runs client-side. When API keys are configured, this can be swapped
 * for an AI-powered version.
 */
export function generateInsights(
  trainingCompanies: TrainingCompany[],
  companies: Company[],
  profiles: Record<string, CompanyProfile>,
  trainingSetId: string,
): BaselineInsights {
  const idealIds = new Set(trainingCompanies.filter(tc => tc.label === 'ideal' || tc.label === 'good').map(tc => tc.companyId))
  const poorIds = new Set(trainingCompanies.filter(tc => tc.label === 'poor' || tc.label === 'reject').map(tc => tc.companyId))

  // Gather all keywords from profiles
  const keywordCounts: Record<string, { count: number; idealCount: number; poorCount: number }> = {}
  const industryCounts: Record<string, number> = {}
  const regionCounts: Record<string, number> = {}
  const allThemes: Record<string, Set<string>> = {}
  const idealTraits: string[] = []
  const poorTraits: string[] = []

  for (const tc of trainingCompanies) {
    const profile = profiles[tc.companyId]
    const company = companies.find(c => c.id === tc.companyId)
    if (!profile && !company) continue

    // Keywords from profile
    const keywords = profile?.keywords || []
    // Also extract keywords from company description
    if (company?.description) {
      const words = company.description.toLowerCase().split(/\W+/).filter(w => w.length > 3)
      keywords.push(...words.slice(0, 10))
    }
    // Also extract from domain
    if (company?.name) {
      const nameWords = company.name.toLowerCase().split(/\W+/).filter(w => w.length > 2)
      keywords.push(...nameWords)
    }

    for (const kw of keywords) {
      if (!keywordCounts[kw]) keywordCounts[kw] = { count: 0, idealCount: 0, poorCount: 0 }
      keywordCounts[kw].count++
      if (idealIds.has(tc.companyId)) keywordCounts[kw].idealCount++
      if (poorIds.has(tc.companyId)) keywordCounts[kw].poorCount++
    }

    // Industry
    if (profile?.industry) {
      industryCounts[profile.industry] = (industryCounts[profile.industry] || 0) + 1
    }

    // Regions
    if (profile?.regions) {
      for (const r of profile.regions) {
        regionCounts[r] = (regionCounts[r] || 0) + 1
      }
    }

    // Themes
    if (profile?.themes) {
      for (const t of profile.themes) {
        if (!allThemes[t]) allThemes[t] = new Set()
        for (const kw of keywords.slice(0, 5)) allThemes[t].add(kw)
      }
    }

    // Traits
    if (profile?.growthSignals && (tc.label === 'ideal' || tc.label === 'good')) {
      idealTraits.push(...profile.growthSignals)
    }
    if (profile?.riskSignals && (tc.label === 'poor' || tc.label === 'reject')) {
      poorTraits.push(...profile.riskSignals)
    }
  }

  // If no profiles exist, generate insights from company names/descriptions
  if (Object.keys(keywordCounts).length === 0) {
    for (const tc of trainingCompanies) {
      const company = companies.find(c => c.id === tc.companyId)
      if (!company) continue
      const words = (company.name + ' ' + company.description + ' ' + company.domain).toLowerCase().split(/\W+/).filter(w => w.length > 3)
      for (const w of words) {
        if (!keywordCounts[w]) keywordCounts[w] = { count: 0, idealCount: 0, poorCount: 0 }
        keywordCounts[w].count++
        if (idealIds.has(tc.companyId)) keywordCounts[w].idealCount++
        if (poorIds.has(tc.companyId)) keywordCounts[w].poorCount++
      }
    }
  }

  // Build top keywords
  const sortedKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 20)

  const topKeywords = sortedKeywords.map(([word, data]) => {
    let signal: KeywordSignal = 'neutral'
    if (data.idealCount > data.poorCount * 2) signal = 'strong_positive'
    else if (data.idealCount > data.poorCount) signal = 'moderate_positive'
    else if (data.poorCount > data.idealCount * 2) signal = 'disqualifying'
    else if (data.poorCount > data.idealCount) signal = 'negative'
    return { word, count: data.count, signal }
  })

  // Build themes
  const themes = Object.entries(allThemes).map(([name, kws]) => ({
    name,
    keywords: [...kws].slice(0, 6),
    count: Math.ceil(trainingCompanies.length * 0.3),
  })).slice(0, 6)

  // If no themes from profiles, create from keyword clusters
  if (themes.length === 0) {
    const positiveKws = topKeywords.filter(k => k.signal === 'strong_positive' || k.signal === 'moderate_positive')
    const negativeKws = topKeywords.filter(k => k.signal === 'negative' || k.signal === 'disqualifying')
    if (positiveKws.length > 0) themes.push({ name: 'Positive Signals', keywords: positiveKws.map(k => k.word).slice(0, 6), count: positiveKws.length })
    if (negativeKws.length > 0) themes.push({ name: 'Risk Signals', keywords: negativeKws.map(k => k.word).slice(0, 6), count: negativeKws.length })
    const neutralKws = topKeywords.filter(k => k.signal === 'neutral')
    if (neutralKws.length > 0) themes.push({ name: 'General', keywords: neutralKws.map(k => k.word).slice(0, 6), count: neutralKws.length })
  }

  // Differentiators
  const differentiators = topKeywords.slice(0, 8).map(k => {
    const data = keywordCounts[k.word]
    const total = data.idealCount + data.poorCount || 1
    return {
      trait: k.word,
      idealPct: Math.round((data.idealCount / total) * 100),
      poorPct: Math.round((data.poorCount / total) * 100),
    }
  }).filter(d => Math.abs(d.idealPct - d.poorPct) > 10)

  // Common traits
  const uniqueIdealTraits = [...new Set(idealTraits)].slice(0, 8)
  const uniquePoorTraits = [...new Set(poorTraits)].slice(0, 8)

  // If no traits from profiles, use label-based summary
  if (uniqueIdealTraits.length === 0) {
    const idealCompanies = trainingCompanies.filter(tc => tc.label === 'ideal' || tc.label === 'good')
    idealCompanies.forEach(tc => {
      const c = companies.find(co => co.id === tc.companyId)
      if (c?.description) uniqueIdealTraits.push(c.description.slice(0, 60))
    })
  }
  if (uniquePoorTraits.length === 0) {
    const poorCompanies = trainingCompanies.filter(tc => tc.label === 'poor' || tc.label === 'reject')
    poorCompanies.forEach(tc => {
      const c = companies.find(co => co.id === tc.companyId)
      if (c?.description) uniquePoorTraits.push(c.description.slice(0, 60))
    })
  }

  // Top industries
  const topIndustries = Object.entries(industryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))

  // Top regions
  const topRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))

  const totalCompanies = trainingCompanies.length
  const idealCount = trainingCompanies.filter(tc => tc.label === 'ideal' || tc.label === 'good').length
  const confidence = totalCompanies >= 20 ? 85 : totalCompanies >= 10 ? 70 : totalCompanies >= 5 ? 55 : 35

  const icpSummary = totalCompanies > 0
    ? `Based on ${totalCompanies} training companies (${idealCount} ideal/good), the best-fit companies tend to share keywords like ${topKeywords.slice(0, 3).map(k => k.word).join(', ')}${topIndustries.length > 0 ? ` in industries such as ${topIndustries.slice(0, 2).map(i => i.name).join(', ')}` : ''}. ${differentiators.length > 0 ? `Key differentiators: ${differentiators.slice(0, 2).map(d => d.trait).join(', ')}.` : ''} Confidence is ${confidence}% — add more labelled companies to improve accuracy.`
    : 'No training data available. Upload companies and label them to generate insights.'

  return {
    id: Date.now().toString(36),
    trainingSetId,
    topKeywords,
    themes,
    commonTraits: uniqueIdealTraits.length > 0 ? uniqueIdealTraits : ['Add more ideal/good companies to identify positive traits'],
    negativeTraits: uniquePoorTraits.length > 0 ? uniquePoorTraits : ['Add more poor/reject companies to identify negative traits'],
    differentiators: differentiators.length > 0 ? differentiators : [{ trait: 'More data needed', idealPct: 50, poorPct: 50 }],
    icpSummary,
    confidenceScore: confidence,
    topIndustries: topIndustries.length > 0 ? topIndustries : [{ name: 'Not enough data', count: 0 }],
    topRegions: topRegions.length > 0 ? topRegions : [{ name: 'Not enough data', count: 0 }],
  }
}
