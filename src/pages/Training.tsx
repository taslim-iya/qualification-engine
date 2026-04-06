import { useAppStore } from '@/stores/appStore'
import { Upload, Plus, Building2 } from 'lucide-react'
import { useState } from 'react'

const labelColors: Record<string, string> = { ideal: '#10B981', good: '#3B82F6', average: '#F59E0B', poor: '#EF4444', reject: '#71717A' }

export default function Training() {
  const { trainingSets, trainingCompanies, companies } = useAppStore()
  const [tab, setTab] = useState<'companies' | 'upload'>('companies')
  const ts = trainingSets[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Training Set</h1>
        <p className="text-sm text-[#52525B] mt-1">Upload baseline companies to train the qualification model</p>
      </div>

      {/* Active Set */}
      {ts && (
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-semibold text-[#F4F4F5]">{ts.name}</div>
              <div className="text-xs text-[#52525B]">Created {ts.createdAt} · {ts.companyCount} companies</div>
            </div>
            <div className="flex gap-2">
              {['ideal', 'good', 'average', 'poor', 'reject'].map(l => {
                const count = trainingCompanies.filter(tc => tc.label === l).length
                return (
                  <span key={l} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: labelColors[l], background: `${labelColors[l]}15` }}>
                    {l}: {count}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {(['companies', 'upload'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t ? 'border-[#3B82F6] text-[#F4F4F5]' : 'border-transparent text-[#52525B] hover:text-[#A1A1AA]'}`}>
            {t === 'companies' ? 'Training Companies' : 'Upload / Add'}
          </button>
        ))}
      </div>

      {tab === 'companies' && (
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs text-[#52525B] font-medium">
            <span>Company</span><span>Label</span><span>Outcome</span><span>Products</span><span>Notes</span>
          </div>
          {trainingCompanies.map(tc => {
            const company = companies.find(c => c.id === tc.companyId)
            return (
              <div key={tc.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-[#3F3F46]" />
                  <div>
                    <div className="text-sm text-[#F4F4F5]">{company?.name}</div>
                    <div className="text-xs text-[#3F3F46]">{company?.domain}</div>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full w-fit" style={{ color: labelColors[tc.label], background: `${labelColors[tc.label]}15` }}>{tc.label}</span>
                <span className="text-xs text-[#71717A]">{tc.outcome}</span>
                <span className="text-xs text-[#71717A]">{tc.productRelevance}</span>
                <span className="text-xs text-[#52525B] truncate">{tc.notes}</span>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'upload' && (
        <div className="space-y-6">
          {/* CSV Upload */}
          <div className="rounded-xl p-8 border-2 border-dashed border-white/[0.08] text-center hover:border-[#3B82F6]/30 transition cursor-pointer">
            <Upload size={32} className="mx-auto mb-3 text-[#3F3F46]" />
            <div className="text-sm font-medium text-[#A1A1AA] mb-1">Upload CSV file</div>
            <div className="text-xs text-[#3F3F46]">Columns: company_name, domain, linkedin_url, label, notes, outcome, products</div>
          </div>
          {/* Manual */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Add Company Manually</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Company Name', 'Domain', 'LinkedIn URL', 'Label'].map(f => (
                <div key={f}>
                  <label className="text-xs text-[#52525B] mb-1 block">{f}</label>
                  <input className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" placeholder={f} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-[#52525B] mb-1 block">Notes</label>
              <textarea className="w-full h-20 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46] resize-none" placeholder="Additional notes..." />
            </div>
            <button className="mt-4 h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add to Training Set</button>
          </div>
          {/* Paste */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Paste Company List</h3>
            <textarea className="w-full h-32 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46] resize-none font-mono" placeholder="One company per line: name, domain&#10;Monzo, monzo.com&#10;Revolut, revolut.com" />
            <button className="mt-3 h-9 px-4 rounded-lg border border-white/[0.08] text-[#A1A1AA] text-sm font-medium hover:bg-white/[0.04]">Parse & Import</button>
          </div>
        </div>
      )}
    </div>
  )
}
