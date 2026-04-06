import { useAppStore } from '@/stores/appStore'
import { parseCSV, parseExcel, parsePastedList, exportCompaniesCSV, exportCompaniesExcel, downloadCSV } from '@/lib/fileIO'
import type { ParsedCompanyRow } from '@/lib/fileIO'
import type { CompanyLabel } from '@/types'
import { Upload, Plus, Building2, Download, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'

const labelColors: Record<string, string> = { ideal: '#10B981', good: '#3B82F6', average: '#F59E0B', poor: '#EF4444', reject: '#71717A' }
const LABELS: CompanyLabel[] = ['ideal', 'good', 'average', 'poor', 'reject']

export default function Training() {
  const { trainingSets, trainingCompanies, companies, addCompany, addCompanies, createTrainingSet, addTrainingCompany, removeTrainingCompany } = useAppStore()
  const [tab, setTab] = useState<'companies' | 'upload'>('companies')
  const [pasteText, setPasteText] = useState('')
  const [preview, setPreview] = useState<ParsedCompanyRow[]>([])
  const [manualName, setManualName] = useState('')
  const [manualDomain, setManualDomain] = useState('')
  const [manualLinkedin, setManualLinkedin] = useState('')
  const [manualLabel, setManualLabel] = useState<CompanyLabel>('ideal')
  const [manualNotes, setManualNotes] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const ts = trainingSets[0]

  const ensureTrainingSet = () => {
    if (trainingSets.length > 0) return trainingSets[0].id
    return createTrainingSet('Training Set 1')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.name.endsWith('.csv')) {
      const text = await file.text()
      setPreview(parseCSV(text))
    } else {
      const buffer = await file.arrayBuffer()
      setPreview(parseExcel(buffer))
    }
  }

  const handlePaste = () => {
    if (!pasteText.trim()) return
    setPreview(parsePastedList(pasteText))
  }

  const importPreview = () => {
    const tsId = ensureTrainingSet()
    preview.forEach(row => {
      const id = addCompany({ name: row.name, domain: row.domain, linkedinUrl: row.linkedinUrl, description: row.description, source: row.source })
      addTrainingCompany({ trainingSetId: tsId, companyId: id, label: row.label || 'average', notes: row.notes || '', outcome: row.outcome || '', productRelevance: row.productRelevance || '' })
    })
    setPreview([])
    setPasteText('')
    setTab('companies')
  }

  const handleManualAdd = () => {
    if (!manualName.trim()) return
    const tsId = ensureTrainingSet()
    const id = addCompany({ name: manualName, domain: manualDomain, linkedinUrl: manualLinkedin, description: '', source: 'Manual Entry' })
    addTrainingCompany({ trainingSetId: tsId, companyId: id, label: manualLabel, notes: manualNotes, outcome: '', productRelevance: '' })
    setManualName(''); setManualDomain(''); setManualLinkedin(''); setManualNotes('')
  }

  const tcCompanies = trainingCompanies.map(tc => ({ ...tc, company: companies.find(c => c.id === tc.companyId) }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Training Set</h1>
          <p className="text-sm text-[#52525B] mt-1">Upload baseline companies to train the qualification model</p>
        </div>
        {companies.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => downloadCSV(exportCompaniesCSV(companies), 'cq_companies.csv')} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04]"><Download size={12} /> CSV</button>
            <button onClick={() => exportCompaniesExcel(companies)} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04]"><Download size={12} /> Excel</button>
          </div>
        )}
      </div>

      {/* Stats */}
      {ts && (
        <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[#F4F4F5]">{ts.name}</div>
            <div className="text-xs text-[#52525B]">{trainingCompanies.length} companies · Created {ts.createdAt}</div>
          </div>
          <div className="flex gap-2">
            {LABELS.map(l => {
              const count = trainingCompanies.filter(tc => tc.label === l).length
              if (count === 0) return null
              return <span key={l} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: labelColors[l], background: `${labelColors[l]}15` }}>{l}: {count}</span>
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {([['companies', 'Training Companies'], ['upload', 'Upload / Add']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === key ? 'border-[#3B82F6] text-[#F4F4F5]' : 'border-transparent text-[#52525B] hover:text-[#A1A1AA]'}`}>{label}</button>
        ))}
      </div>

      {tab === 'companies' && (
        tcCompanies.length === 0 ? (
          <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
            <Building2 size={32} className="mx-auto mb-3 text-[#3F3F46]" />
            <div className="text-sm font-medium text-[#A1A1AA] mb-1">No training companies yet</div>
            <div className="text-xs text-[#52525B] mb-4">Upload a CSV/Excel or add companies manually</div>
            <button onClick={() => setTab('upload')} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">Add Companies</button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-3 text-xs text-[#52525B] font-medium">
              <span>Company</span><span>Label</span><span>Outcome</span><span>Notes</span><span></span>
            </div>
            {tcCompanies.map(tc => (
              <div key={tc.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-3 items-center hover:bg-white/[0.02]">
                <div><div className="text-sm text-[#F4F4F5]">{tc.company?.name}</div><div className="text-xs text-[#3F3F46]">{tc.company?.domain}</div></div>
                <span className="text-xs font-medium px-2 py-1 rounded-full w-fit" style={{ color: labelColors[tc.label], background: `${labelColors[tc.label]}15` }}>{tc.label}</span>
                <span className="text-xs text-[#71717A]">{tc.outcome || '—'}</span>
                <span className="text-xs text-[#52525B] truncate">{tc.notes || '—'}</span>
                <button onClick={() => removeTrainingCompany(tc.id)} className="p-1 rounded hover:bg-[#EF4444]/10"><Trash2 size={14} className="text-[#52525B]" /></button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'upload' && (
        <div className="space-y-6">
          {/* File Upload */}
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          <div onClick={() => fileRef.current?.click()} className="rounded-xl p-8 border-2 border-dashed border-white/[0.08] text-center hover:border-[#3B82F6]/30 transition cursor-pointer">
            <Upload size={32} className="mx-auto mb-3 text-[#3F3F46]" />
            <div className="text-sm font-medium text-[#A1A1AA] mb-1">Upload CSV or Excel file</div>
            <div className="text-xs text-[#3F3F46]">Supported columns: company_name, domain, linkedin_url, label, notes, outcome, products</div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="rounded-xl p-5 border border-[#3B82F6]/20 bg-[#3B82F6]/[0.03]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#3B82F6]">{preview.length} companies parsed</span>
                <div className="flex gap-2">
                  <button onClick={importPreview} className="h-8 px-3 rounded-lg bg-[#3B82F6] text-white text-xs font-medium">Import All</button>
                  <button onClick={() => setPreview([])} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA]">Cancel</button>
                </div>
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {preview.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs p-2 rounded bg-white/[0.03]">
                    <span className="text-[#F4F4F5] font-medium">{r.name}</span>
                    <span className="text-[#52525B]">{r.domain}</span>
                    {r.label && <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ color: labelColors[r.label], background: `${labelColors[r.label]}15` }}>{r.label}</span>}
                  </div>
                ))}
                {preview.length > 10 && <div className="text-xs text-[#52525B] p-2">...and {preview.length - 10} more</div>}
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Add Company Manually</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#52525B] mb-1 block">Company Name *</label>
                <input value={manualName} onChange={e => setManualName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" placeholder="Acme Inc" />
              </div>
              <div>
                <label className="text-xs text-[#52525B] mb-1 block">Domain</label>
                <input value={manualDomain} onChange={e => setManualDomain(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" placeholder="acme.com" />
              </div>
              <div>
                <label className="text-xs text-[#52525B] mb-1 block">LinkedIn URL</label>
                <input value={manualLinkedin} onChange={e => setManualLinkedin(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" placeholder="linkedin.com/company/acme" />
              </div>
              <div>
                <label className="text-xs text-[#52525B] mb-1 block">Label</label>
                <select value={manualLabel} onChange={e => setManualLabel(e.target.value as CompanyLabel)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none">
                  {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-[#52525B] mb-1 block">Notes</label>
              <textarea value={manualNotes} onChange={e => setManualNotes(e.target.value)} className="w-full h-20 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46] resize-none" placeholder="Additional notes..." />
            </div>
            <button onClick={handleManualAdd} disabled={!manualName.trim()} className="mt-4 h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40"><Plus size={16} /> Add to Training Set</button>
          </div>

          {/* Paste */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Paste Company List</h3>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} className="w-full h-32 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46] resize-none font-mono" placeholder={'One per line: name, domain, linkedin_url\nMonzo, monzo.com, linkedin.com/company/monzo\nRevolut, revolut.com'} />
            <button onClick={handlePaste} disabled={!pasteText.trim()} className="mt-3 h-9 px-4 rounded-lg border border-white/[0.08] text-[#A1A1AA] text-sm font-medium hover:bg-white/[0.04] disabled:opacity-40">Parse & Preview</button>
          </div>
        </div>
      )}
    </div>
  )
}
