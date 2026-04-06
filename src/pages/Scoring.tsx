import { useAppStore } from '@/stores/appStore'
import { researchCompany } from '@/lib/researchEngine'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, ArrowUpRight, Zap, Download, RefreshCw, Play } from 'lucide-react'
import { exportScoresCSV, exportScoresExcel, downloadCSV } from '@/lib/fileIO'

export default function Scoring() {
  const { companies, scores, model, profiles, addCompany, setProfile, scoreCompany } = useAppStore()
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [scoring, setScoring] = useState(false)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [bulkScoring, setBulkScoring] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })

  const scoredMap = new Map(scores.map(s => [s.companyId, s]))
  const unscored = companies.filter(c => !scoredMap.has(c.id) && profiles[c.id])
  const unscoredNoProfile = companies.filter(c => !scoredMap.has(c.id) && !profiles[c.id])

  const handleQuickScore = async () => {
    if (!newName.trim()) return
    setScoring(true)
    const id = addCompany({ name: newName, domain: newDomain, linkedinUrl: '', description: '', source: 'Quick Score' })
    await new Promise(r => setTimeout(r, 400))
    const profile = researchCompany({ id, name: newName, domain: newDomain, linkedinUrl: '', description: '', source: 'Quick Score', createdAt: '' })
    setProfile(id, profile)
    await new Promise(r => setTimeout(r, 300))
    scoreCompany(id)
    setNewName('')
    setNewDomain('')
    setScoring(false)
  }

  const handleScoreOne = async (companyId: string) => {
    setScoringId(companyId)
    await new Promise(r => setTimeout(r, 300))
    scoreCompany(companyId)
    setScoringId(null)
  }

  const handleScoreAll = async () => {
    if (unscored.length === 0) return
    setBulkScoring(true)
    setProgress({ done: 0, total: unscored.length })
    for (let i = 0; i < unscored.length; i++) {
      await new Promise(r => setTimeout(r, 150))
      scoreCompany(unscored[i].id)
      setProgress({ done: i + 1, total: unscored.length })
    }
    setBulkScoring(false)
  }

  const handleResearchAndScoreAll = async () => {
    const toProcess = [...unscored, ...unscoredNoProfile]
    if (toProcess.length === 0) return
    setBulkScoring(true)
    setProgress({ done: 0, total: toProcess.length })
    for (let i = 0; i < toProcess.length; i++) {
      const c = toProcess[i]
      if (!profiles[c.id]) {
        const profile = researchCompany(c)
        setProfile(c.id, profile)
        await new Promise(r => setTimeout(r, 200))
      }
      scoreCompany(c.id)
      setProgress({ done: i + 1, total: toProcess.length })
      await new Promise(r => setTimeout(r, 100))
    }
    setBulkScoring(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Score Companies</h1>
          <p className="text-sm text-[#52525B] mt-1">{scores.length} scored · {unscored.length + unscoredNoProfile.length} remaining</p>
        </div>
        <div className="flex gap-2">
          {unscored.length > 0 && (
            <button onClick={handleScoreAll} disabled={bulkScoring} className="h-9 px-4 rounded-lg border border-[#10B981]/30 text-[#10B981] text-sm font-medium flex items-center gap-2 hover:bg-[#10B981]/10 disabled:opacity-50">
              <Zap size={14} /> Score Ready ({unscored.length})
            </button>
          )}
          {(unscored.length + unscoredNoProfile.length) > 0 && (
            <button onClick={handleResearchAndScoreAll} disabled={bulkScoring} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50">
              {bulkScoring ? <><RefreshCw size={14} className="animate-spin" /> {progress.done}/{progress.total}</> : <><Zap size={14} /> Research & Score All ({unscored.length + unscoredNoProfile.length})</>}
            </button>
          )}
        </div>
      </div>

      {/* Quick Score */}
      <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Quick Research & Score</h2>
        <div className="flex gap-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Company name" className="flex-1 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" />
          <input value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="Domain (optional)" className="w-48 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" />
          <button onClick={handleQuickScore} disabled={!newName.trim() || scoring} className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40">
            {scoring ? <><RefreshCw size={14} className="animate-spin" /> Scoring...</> : <><Zap size={14} /> Research & Score</>}
          </button>
        </div>
      </div>

      {/* Scored */}
      {scores.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#52525B]">Scored Companies ({scores.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => downloadCSV(exportScoresCSV(scores, companies), 'cq_scores.csv')} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04]"><Download size={12} /> CSV</button>
              <button onClick={() => exportScoresExcel(scores, companies)} className="h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04]"><Download size={12} /> Excel</button>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            <div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_100px] gap-3 px-4 py-3 text-xs text-[#52525B] font-medium">
              <span>Score</span><span>Company</span><span>Fit</span><span>Need</span><span>Buy</span><span>Band</span><span></span>
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
                  <div><div className="text-sm text-[#3B82F6] font-medium">{s.fitScore}</div></div>
                  <div><div className="text-sm text-[#10B981] font-medium">{s.needScore}</div></div>
                  <div><div className="text-sm text-[#8B5CF6] font-medium">{s.buyabilityScore}</div></div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full w-fit" style={{ color: band?.color, background: `${band?.color}15` }}>{band?.label}</span>
                  <Link to={`/company/${s.companyId}`} className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">Details <ArrowUpRight size={12} /></Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {scores.length === 0 && companies.length === 0 && (
        <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
          <Zap size={32} className="mx-auto mb-3 text-[#3F3F46]" />
          <div className="text-sm font-medium text-[#A1A1AA] mb-1">No companies scored yet</div>
          <div className="text-xs text-[#52525B] mb-4">Use Quick Score above, or add companies via Training Set first</div>
        </div>
      )}

      {/* Ready to Score */}
      {unscored.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Ready to Score ({unscored.length})</h2>
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            {unscored.map(c => {
              const profile = profiles[c.id]
              const isScoring = scoringId === c.id
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div>
                    <div className="text-sm text-[#F4F4F5]">{c.name}</div>
                    <div className="text-xs text-[#3F3F46]">{profile?.industry} · {profile?.confidenceScore}% confidence</div>
                  </div>
                  <button onClick={() => handleScoreOne(c.id)} disabled={isScoring} className="h-8 px-3 rounded-lg border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/10 flex items-center gap-1 disabled:opacity-50">
                    {isScoring ? <RefreshCw size={10} className="animate-spin" /> : <Play size={10} />} Score
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Need Research */}
      {unscoredNoProfile.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Needs Research First ({unscoredNoProfile.length})</h2>
          <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
            <div className="text-xs text-[#71717A] mb-2">{unscoredNoProfile.length} companies need to be researched before scoring.</div>
            <Link to="/research" className="text-xs text-[#3B82F6] hover:underline">Go to Research →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
