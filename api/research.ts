import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ResearchRequest {
  companyName: string
  domain?: string
  linkedinUrl?: string
  keys: {
    openai?: string
    anthropic?: string
    google?: string
    perplexity?: string
    serper?: string
  }
}

interface SearchResult {
  title: string
  snippet: string
  link: string
}

// ======= WEB SEARCH =======

async function searchSerper(query: string, apiKey: string): Promise<SearchResult[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 8 }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.organic || []).map((r: any) => ({ title: r.title, snippet: r.snippet, link: r.link }))
}

async function searchPerplexity(query: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: `Research this company thoroughly. Return key facts about industry, size, products, customers, growth signals, risks, and insurance needs: ${query}` }],
    }),
  })
  if (!res.ok) return ''
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function scrapeWebsite(domain: string): Promise<string> {
  try {
    const url = domain.startsWith('http') ? domain : `https://${domain}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CQBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return ''
    const html = await res.text()
    // Extract text content (strip tags, scripts, styles)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)
    return text
  } catch {
    return ''
  }
}

// ======= AI SYNTHESIS =======

const SYSTEM_PROMPT = `You are a company research analyst for an insurance sales qualification engine. Given raw data about a company, produce a structured JSON profile.

Return ONLY valid JSON with this exact schema:
{
  "industry": "string",
  "subindustry": "string",
  "businessModel": "B2B|B2C|B2B2C|SaaS|Platform|Services|Marketplace|Hybrid",
  "customerType": "Enterprise|Mid-Market|SMB|Consumer|Government",
  "employeeBand": "1-10|11-50|51-200|201-500|501-1000|1001-5000|5000+",
  "revenueBand": "<$1M|$1M-$5M|$5M-$25M|$25M-$100M|$100M-$500M|$500M+",
  "regions": ["string"],
  "growthSignals": ["string"],
  "riskSignals": ["string"],
  "likelyInsuranceNeeds": ["Cyber Liability","D&O Insurance","E&O / Professional Liability","General Liability","Property Insurance","Workers Compensation","Commercial Auto","Umbrella/Excess","Employment Practices Liability","Product Liability","Key Person Insurance","Business Interruption"],
  "keywords": ["string"],
  "themes": ["string"],
  "summary": "2-3 sentence summary",
  "confidenceScore": 0-100
}

Be accurate. If unsure, lower the confidence score. Never invent specific revenue numbers or employee counts — use bands.`

async function synthesizeOpenAI(rawData: string, companyName: string, apiKey: string): Promise<any> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Research data for "${companyName}":\n\n${rawData}\n\nProduce the structured JSON profile.` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`OpenAI: ${err}`) }
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

async function synthesizeAnthropic(rawData: string, companyName: string, apiKey: string): Promise<any> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Research data for "${companyName}":\n\n${rawData}\n\nProduce the structured JSON profile. Return ONLY JSON.` }],
    }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`Anthropic: ${err}`) }
  const data = await res.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

async function synthesizeGoogle(rawData: string, companyName: string, apiKey: string): Promise<any> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nResearch data for "${companyName}":\n\n${rawData}\n\nProduce the structured JSON profile. Return ONLY JSON.` }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) { const err = await res.text(); throw new Error(`Google: ${err}`) }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

// ======= HANDLER =======

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { companyName, domain, linkedinUrl, keys } = req.body as ResearchRequest
  if (!companyName) return res.status(400).json({ error: 'companyName required' })

  const dataSources: string[] = []
  const rawParts: string[] = []
  const errors: string[] = []

  try {
    // 1. Web search
    if (keys.serper) {
      try {
        const results = await searchSerper(`${companyName} ${domain || ''} company insurance`, keys.serper)
        if (results.length > 0) {
          dataSources.push('web_search')
          rawParts.push('=== WEB SEARCH RESULTS ===\n' + results.map(r => `${r.title}\n${r.snippet}\n${r.link}`).join('\n\n'))
        }
      } catch (e: any) { errors.push(`Serper: ${e.message}`) }
    }

    // 2. Perplexity deep research
    if (keys.perplexity) {
      try {
        const research = await searchPerplexity(`${companyName} ${domain || ''}`, keys.perplexity)
        if (research) {
          dataSources.push('perplexity_research')
          rawParts.push('=== PERPLEXITY RESEARCH ===\n' + research)
        }
      } catch (e: any) { errors.push(`Perplexity: ${e.message}`) }
    }

    // 3. Website scrape
    if (domain) {
      try {
        const text = await scrapeWebsite(domain)
        if (text.length > 100) {
          dataSources.push('website_scraper')
          rawParts.push('=== WEBSITE CONTENT ===\n' + text)
        }
      } catch (e: any) { errors.push(`Scraper: ${e.message}`) }
    }

    // 4. LinkedIn mention (no scrape — just note it)
    if (linkedinUrl) {
      dataSources.push('linkedin_noted')
      rawParts.push(`=== LINKEDIN ===\nLinkedIn URL: ${linkedinUrl}`)
    }

    // If no search data at all, use just the company name
    if (rawParts.length === 0) {
      rawParts.push(`Company name: ${companyName}\nDomain: ${domain || 'unknown'}\nNo external data could be gathered. Analyze based on name and domain alone.`)
    }

    const rawData = rawParts.join('\n\n')

    // 5. AI Synthesis (try in order: OpenAI → Anthropic → Google)
    let profile: any = null
    let aiProvider = ''

    if (keys.openai) {
      try {
        profile = await synthesizeOpenAI(rawData, companyName, keys.openai)
        aiProvider = 'openai'
        dataSources.push('ai_synthesis_openai')
      } catch (e: any) { errors.push(`OpenAI synthesis: ${e.message}`) }
    }
    if (!profile && keys.anthropic) {
      try {
        profile = await synthesizeAnthropic(rawData, companyName, keys.anthropic)
        aiProvider = 'anthropic'
        dataSources.push('ai_synthesis_anthropic')
      } catch (e: any) { errors.push(`Anthropic synthesis: ${e.message}`) }
    }
    if (!profile && keys.google) {
      try {
        profile = await synthesizeGoogle(rawData, companyName, keys.google)
        aiProvider = 'google'
        dataSources.push('ai_synthesis_google')
      } catch (e: any) { errors.push(`Google synthesis: ${e.message}`) }
    }

    if (!profile) {
      return res.status(422).json({
        error: 'No AI provider could synthesize the data. Add at least one AI API key (OpenAI, Anthropic, or Google).',
        errors,
        rawDataLength: rawData.length,
        dataSources,
      })
    }

    return res.status(200).json({
      profile: {
        ...profile,
        dataSources,
        researchStatus: 'complete',
        lastResearchedAt: new Date().toISOString().split('T')[0],
      },
      aiProvider,
      dataSources,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (e: any) {
    return res.status(500).json({ error: e.message, errors })
  }
}
