import { useAppStore } from '@/stores/appStore'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, ArrowUpRight, Zap, Download } from 'lucide-react'
import { exportScoresCSV, exportScoresExcel, downloadCSV } from '@/lib/fileIO'

export default function Scoring() {
  const { companies, scores, model, profiles } = useAppStore()
  const [newCompany, setNewCompany] = useState('')

  const scoredMap = new Map(scores.map(s => [s.companyId, s]))
  const unscored = companies.filter(c => !scoredMap.has(c.id) && profiles[c.id])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Score Companies</h1>
        <p className="text-sm text-[#52525B] mt-1">Run companies against your scoring model</p>
      </div>

      {/* Quick Score */}
      <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Score a New Company</h2>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
            <Search size={16} className="text-[#3F3F46]" />
            <input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Enter company name or domain..." className="flex-1 bg-transparent text-sm text-[#F4F4F5] outline-none placeholder-[#3F3F46]" />
          </div>
          <button className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2"><Zap size={16} /> Research & Score</button>
        </div>
      </div>

      {/* Scored */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[#52525B]">Scored Companies ({scores.length})</h2>
          {scores.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => downloadCSV(exportScoresCSV(scores, companies), 'cq_scores.csv')} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04]"><Download size={12} /> CSV</button>
              <button onClick={() => exportScoresExcel(scores, companies)} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04]"><Download size={12} /> Excel</button>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
          <div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_100px] gap-3 px-4 py-3 text-xs text-[#52525B] font-medium">
            <span>Score</span><span>Company</span><span>Fit</span><span>Need</span><span>Buyability</span><span>Band</span><span></span>
          </div>
          {scores.map(s => {
            const company = companies.find(c => c.id === s.companyId)
            const band = model.qualBands.find(b => b.band === s.qualBand)
            return (
              <div key={s.id} className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_100px] gap-3 px-4 py-3 items-center hover:bg-white/[0.02] transition">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.08] text-sm font-bold" style={{ color: band?.color, background: `${band?.color}10` }}>{s.totalScore}</div>
                <div>
                  <div className="text-sm text-[#F4F4F5]">{company?.name}</div>
                  <div className="text-xs text-[#3F3F46]">{company?.domain}</div>
                </div>
                <div><div className="text-sm text-[#3B82F6] font-medium">{s.fitScore}</div><div className="text-[10px] text-[#3F3F46]">Fit</div></div>
                <div><div className="text-sm text-[#10B981] font-medium">{s.needScore}</div><div className="text-[10px] text-[#3F3F46]">Need</div></div>
                <div><div className="text-sm text-[#8B5CF6] font-medium">{s.buyabilityScore}</div><div className="text-[10px] text-[#3F3F46]">Buy</div></div>
                <span className="text-xs font-medium px-2 py-1 rounded-full w-fit" style={{ color: band?.color, background: `${band?.color}15` }}>{band?.label}</span>
                <Link to={`/company/${s.companyId}`} className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">Details <ArrowUpRight size={12} /></Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unscored */}
      {unscored.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Ready to Score ({unscored.length})</h2>
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            {unscored.map(c => {
              const profile = profiles[c.id]
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div>
                    <div className="text-sm text-[#F4F4F5]">{c.name}</div>
                    <div className="text-xs text-[#3F3F46]">{profile?.industry} · {profile?.confidenceScore}% confidence</div>
                  </div>
                  <button className="h-8 px-3 rounded-lg border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/10 transition">Score Now</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
