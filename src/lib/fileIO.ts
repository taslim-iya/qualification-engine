import * as XLSX from 'xlsx'
import type { Company, ScoredCompany, TrainingCompany, CompanyLabel } from '@/types'

// ==================== PARSING ====================

export interface ParsedCompanyRow {
  name: string
  domain: string
  linkedinUrl: string
  description: string
  source: string
  label?: CompanyLabel
  notes?: string
  outcome?: string
  productRelevance?: string
}

const LABEL_MAP: Record<string, CompanyLabel> = {
  ideal: 'ideal', good: 'good', average: 'average', poor: 'poor', reject: 'reject',
  best: 'ideal', great: 'good', ok: 'average', bad: 'poor', no: 'reject',
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

function mapRow(row: Record<string, string>): ParsedCompanyRow {
  const norm: Record<string, string> = {}
  for (const [k, v] of Object.entries(row)) norm[normalizeHeader(k)] = String(v || '').trim()

  return {
    name: norm.company_name || norm.name || norm.company || '',
    domain: norm.domain || norm.website || norm.url || '',
    linkedinUrl: norm.linkedin_url || norm.linkedin || norm.li_url || '',
    description: norm.description || norm.desc || norm.about || '',
    source: norm.source || 'CSV Import',
    label: LABEL_MAP[(norm.label || norm.tier || norm.category || '').toLowerCase()] || undefined,
    notes: norm.notes || norm.note || '',
    outcome: norm.outcome || norm.deal_outcome || norm.result || '',
    productRelevance: norm.product_relevance || norm.products || norm.product || '',
  }
}

export function parseCSV(text: string): ParsedCompanyRow[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return mapRow(row)
  }).filter(r => r.name)
}

export function parseExcel(buffer: ArrayBuffer): ParsedCompanyRow[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
  return json.map(mapRow).filter(r => r.name)
}

export function parsePastedList(text: string): ParsedCompanyRow[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  return lines.map(line => {
    const parts = line.split(/[,\t]/).map(p => p.trim())
    return {
      name: parts[0] || '',
      domain: parts[1] || '',
      linkedinUrl: parts[2] || '',
      description: '',
      source: 'Paste Import',
      notes: parts[3] || '',
    }
  }).filter(r => r.name)
}

// ==================== EXPORT ====================

export function exportCompaniesCSV(companies: Company[]): string {
  const headers = ['company_name', 'domain', 'linkedin_url', 'description', 'source', 'created_at']
  const rows = companies.map(c => [c.name, c.domain, c.linkedinUrl, c.description, c.source, c.createdAt].map(v => `"${v}"`).join(','))
  return [headers.join(','), ...rows].join('\n')
}

export function exportScoresCSV(scores: ScoredCompany[], companies: Company[]): string {
  const headers = ['company_name', 'domain', 'fit_score', 'need_score', 'buyability_score', 'total_score', 'qualification_band', 'recommended_products', 'next_action', 'rationale', 'scored_at']
  const rows = scores.map(s => {
    const c = companies.find(co => co.id === s.companyId)
    return [c?.name || '', c?.domain || '', s.fitScore, s.needScore, s.buyabilityScore, s.totalScore, s.qualBand, s.recommendedProducts.join('; '), s.nextAction, `"${s.rationale.replace(/"/g, '""')}"`, s.scoredAt].join(',')
  })
  return [headers.join(','), ...rows].join('\n')
}

export function exportCompaniesExcel(companies: Company[]) {
  const data = companies.map(c => ({
    'Company Name': c.name, Domain: c.domain, LinkedIn: c.linkedinUrl,
    Description: c.description, Source: c.source, 'Created At': c.createdAt,
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Companies')
  XLSX.writeFile(wb, 'cq_companies.xlsx')
}

export function exportScoresExcel(scores: ScoredCompany[], companies: Company[]) {
  const data = scores.map(s => {
    const c = companies.find(co => co.id === s.companyId)
    return {
      'Company Name': c?.name || '', Domain: c?.domain || '',
      'Fit Score': s.fitScore, 'Need Score': s.needScore, 'Buyability Score': s.buyabilityScore,
      'Total Score': s.totalScore, 'Qualification Band': s.qualBand,
      'Recommended Products': s.recommendedProducts.join('; '),
      'Next Action': s.nextAction, Rationale: s.rationale, 'Scored At': s.scoredAt,
    }
  })
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Scores')
  XLSX.writeFile(wb, 'cq_scores.xlsx')
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
