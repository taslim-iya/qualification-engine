/**
 * Core AI system prompts for the Qualification Engine.
 */

export const RESEARCH_SYSTEM_PROMPT = "You are the research, insight, and qualification engine inside an insurance sales intelligence app.\n\nYour job is to analyze companies using all available tools and produce structured, explainable outputs.\n\n## Rules\n\n* Always attempt to gather information from multiple sources when available.\n* Prefer this sequence: internal data, APIs, official website, web search, LinkedIn, other tools.\n* Never rely on one source if other enabled tools are available.\n* If sources conflict, note the conflict and lower confidence.\n* If data is incomplete, say so clearly.\n* Do not invent facts.\n* Output structured JSON plus a concise human-readable explanation.\n\n## For baseline / sample companies\n\n1. Resolve the identity of each company.\n2. Gather information from enabled tools.\n3. Extract:\n   * industry\n   * business model\n   * company size\n   * geography\n   * growth signals\n   * risk signals\n   * likely insurance needs\n   * keywords\n   * themes\n   * positive fit indicators\n   * negative fit indicators\n   * missing information\n4. Produce a normalized company profile.\n5. Aggregate the baseline companies and identify:\n   * recurring keywords\n   * recurring themes\n   * common traits\n   * negative traits\n   * strongest differentiators\n   * suggested criteria\n6. Classify suggested criteria into:\n   * manual-compatible criteria\n   * learned/database-derived criteria\n   * keyword-derived criteria\n7. Provide confidence scores.\n\n## For new companies\n\n1. Resolve the identity of the company.\n2. Gather information from enabled tools.\n3. Extract:\n   * industry\n   * business model\n   * company size\n   * geography\n   * growth signals\n   * risk signals\n   * likely insurance needs\n   * keywords\n   * themes\n   * positive fit indicators\n   * negative fit indicators\n   * missing information\n4. Produce a normalized company profile.\n5. Score the company using the active scoring model.\n6. Clearly identify which score components came from:\n   * manual criteria\n   * learned/database criteria\n   * keyword/theme criteria\n7. Explain why the company received that score.\n8. Recommend next sales action.\n\n## Objective\n\nHelp the sales team prioritize the right companies for insurance outreach with high accuracy, clear reasoning, structured outputs, keyword insight extraction, and user-controlled weighting across manual and learned criteria."

export const COMPANY_PROFILE_SCHEMA = {
  company_name: '',
  domain: '',
  industry: '',
  subindustry: '',
  business_model: '',
  customer_type: '',
  employee_band: '',
  revenue_band: '',
  regions: [] as string[],
  growth_signals: [] as string[],
  risk_signals: [] as string[],
  likely_insurance_needs: [] as string[],
  keywords: [] as string[],
  themes: [] as string[],
  positive_fit_indicators: [] as string[],
  negative_fit_indicators: [] as string[],
  missing_information: [] as string[],
  confidence_score: 0,
}

export const BASELINE_INSIGHTS_SCHEMA = {
  top_keywords: [] as string[],
  top_positive_keywords: [] as string[],
  top_negative_keywords: [] as string[],
  themes: [] as string[],
  common_traits: [] as string[],
  negative_traits: [] as string[],
  differentiators: [] as string[],
  suggested_manual_criteria: [] as string[],
  suggested_learned_criteria: [] as string[],
  suggested_keyword_criteria: [] as string[],
  icp_summary: '',
  confidence_score: 0,
}

export const SCORING_OUTPUT_SCHEMA = {
  fit_score: 0,
  need_score: 0,
  buyability_score: 0,
  total_score: 0,
  qualification_band: '',
  matched_manual_criteria: [] as string[],
  matched_learned_criteria: [] as string[],
  matched_keyword_criteria: [] as string[],
  rationale: '',
  recommended_products: [] as string[],
  next_action: '',
  confidence_score: 0,
}

export function buildCompanyResearchPrompt(companyName: string, domain: string, context: string = '') {
  const parts = [
    'Research the following company and produce a structured company profile.',
    '',
    'Company: ' + companyName,
    'Domain: ' + domain,
  ]
  if (context) parts.push('Additional context: ' + context)
  parts.push('', 'Use ALL available data sources. Return the result as JSON matching this schema:')
  parts.push(JSON.stringify(COMPANY_PROFILE_SCHEMA, null, 2))
  parts.push('', 'Also provide a 2-3 sentence human-readable summary.')
  return parts.join('\n')
}

export function buildBaselineInsightsPrompt(companies: { name: string; label: string; profile: string }[]) {
  const list = companies.map(c => '- ' + c.name + ' (label: ' + c.label + '): ' + c.profile).join('\n')
  return [
    'Analyze the following baseline companies and extract patterns, keywords, themes, and suggested scoring criteria.',
    '', 'Companies:', list,
    '', 'Return the result as JSON matching this schema:',
    JSON.stringify(BASELINE_INSIGHTS_SCHEMA, null, 2),
    '', 'Also provide a concise ICP summary.',
  ].join('\n')
}

export function buildScoringPrompt(companyProfile: string, criteriaModel: string) {
  return [
    'Score the following company against the provided criteria model.',
    '', 'Company Profile:', companyProfile,
    '', 'Scoring Model:', criteriaModel,
    '', 'Return the result as JSON matching this schema:',
    JSON.stringify(SCORING_OUTPUT_SCHEMA, null, 2),
    '', 'Clearly identify which manual criteria, learned criteria, and keyword criteria matched.',
    'Explain the reasoning for the score.',
    'Recommend specific insurance products and next sales action.',
  ].join('\n')
}
