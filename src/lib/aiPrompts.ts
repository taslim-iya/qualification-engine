/**
 * Core AI system prompts for the Qualification Engine.
 * These are used by the research orchestration layer when calling AI synthesis.
 * Designed to be sent as the system message to GPT-4 / Claude / etc.
 */

export const RESEARCH_SYSTEM_PROMPT = `You are the research, insight, and qualification engine inside an insurance sales intelligence app.

Your job is to analyze companies using all available tools and produce structured, explainable outputs.

## Rules

* Always attempt to gather information from multiple sources when available.
* Prefer this sequence: internal data, APIs, official website, web search, LinkedIn, other tools.
* Never rely on one source if other enabled tools are available.
* If sources conflict, note the conflict and lower confidence.
* If data is incomplete, say so clearly.
* Do not invent facts.
* Output structured JSON plus a concise human-readable explanation.

## For baseline / sample companies

1. Resolve the identity of each company.
2. Gather information from enabled tools.
3. Extract:
   * industry
   * business model
   * company size
   * geography
   * growth signals
   * risk signals
   * likely insurance needs
   * keywords
   * themes
   * positive fit indicators
   * negative fit indicators
   * missing information
4. Produce a normalized company profile.
5. Aggregate the baseline companies and identify:
   * recurring keywords
   * recurring themes
   * common traits
   * negative traits
   * strongest differentiators
   * suggested criteria
6. Classify suggested criteria into:
   * manual-compatible criteria
   * learned/database-derived criteria
   * keyword-derived criteria
7. Provide confidence scores.

## For new companies

1. Resolve the identity of the company.
2. Gather information from enabled tools.
3. Extract:
   * industry
   * business model
   * company size
   * geography
   * growth signals
   * risk signals
   * likely insurance needs
   * keywords
   * themes
   * positive fit indicators
   * negative fit indicators
   * missing information
4. Produce a normalized company profile.
5. Score the company using the active scoring model.
6. Clearly identify which score components came from:
   * manual criteria
   * learned/database criteria
   * keyword/theme criteria
7. Explain why the company received that score.
8. Recommend next sales action.

## Objective

Help the sales team prioritize the right companies for insurance outreach with high accuracy, clear reasoning, structured outputs, keyword insight extraction, and user-controlled weighting across manual and learned criteria.`

export const COMPANY_PROFILE_SCHEMA = {
  company_name: '',
  domain: '',
  industry: '',
  subindustry: '',
  business_model: '',
  customer_type: '',
  employee_band: '',
  revenue_band: '',
  regions: [],
  growth_signals: [],
  risk_signals: [],
  likely_insurance_needs: [],
  keywords: [],
  themes: [],
  positive_fit_indicators: [],
  negative_fit_indicators: [],
  missing_information: [],
  confidence_score: 0,
}

export const BASELINE_INSIGHTS_SCHEMA = {
  top_keywords: [],
  top_positive_keywords: [],
  top_negative_keywords: [],
  themes: [],
  common_traits: [],
  negative_traits: [],
  differentiators: [],
  suggested_manual_criteria: [],
  suggested_learned_criteria: [],
  suggested_keyword_criteria: [],
  icp_summary: '',
  confidence_score: 0,
}

export const SCORING_OUTPUT_SCHEMA = {
  fit_score: 0,
  need_score: 0,
  buyability_score: 0,
  total_score: 0,
  qualification_band: '',
  matched_manual_criteria: [],
  matched_learned_criteria: [],
  matched_keyword_criteria: [],
  rationale: '',
  recommended_products: [],
  next_action: '',
  confidence_score: 0,
}

/**
 * Build the research prompt for a specific company.
 */
export function buildCompanyResearchPrompt(companyName: string, domain: string, context: string = '') {
  return \`Research the following company and produce a structured company profile.

Company: \${companyName}
Domain: \${domain}
\${context ? \`Additional context: \${context}\` : ''}

Use ALL available data sources. Return the result as JSON matching this schema:
\${JSON.stringify(COMPANY_PROFILE_SCHEMA, null, 2)}

Also provide a 2-3 sentence human-readable summary.\`
}

/**
 * Build the baseline insights prompt for a set of companies.
 */
export function buildBaselineInsightsPrompt(companies: { name: string; label: string; profile: string }[]) {
  return \`Analyze the following baseline companies and extract patterns, keywords, themes, and suggested scoring criteria.

Companies:
\${companies.map(c => \`- \${c.name} (label: \${c.label}): \${c.profile}\`).join('\\n')}

Return the result as JSON matching this schema:
\${JSON.stringify(BASELINE_INSIGHTS_SCHEMA, null, 2)}

Also provide a concise ICP summary.\`
}

/**
 * Build the scoring prompt for a company against a criteria model.
 */
export function buildScoringPrompt(companyProfile: string, criteriaModel: string) {
  return \`Score the following company against the provided criteria model.

Company Profile:
\${companyProfile}

Scoring Model:
\${criteriaModel}

Return the result as JSON matching this schema:
\${JSON.stringify(SCORING_OUTPUT_SCHEMA, null, 2)}

Clearly identify which manual criteria, learned criteria, and keyword criteria matched.
Explain the reasoning for the score.
Recommend specific insurance products and next sales action.\`
}
