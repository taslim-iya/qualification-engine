import { useAppStore } from '@/stores/appStore'
import { researchCompany, researchCompanies } from '@/lib/researchEngine'
import { Link } from 'react-router-dom'
import { Search, CheckCircle, AlertCircle, Clock, ExternalLink, Play, RefreshCw, Zap } from 'lucide-react'
import { useState } from 'react'

const statusIcons: Record<string, typeof CheckCircle> = { complete: CheckCircle, pending: Clock, researching: Clock, failed: AlertCircle }
const statusColors: Record<string, string> = { complete: '#10B981', pending: '#71717A', researching: '#F59E0B', failed: '#EF4444' }

export default function Research() {
  const { companies, profiles, setProfile, addCompany } = useAppStore()
  const [search, setSearch] = useState('')
  const [researching, setResearching] = useState<Set<string>>(new Set())
  const [bulkResearching, setBulkResearching] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [quickName, setQuickName] = useState('')
  const [quickDomain, setQuickDomain] = useState('')

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()))
  const unresearched = companies.filter(c => !profiles[c.id])
  const researched = companies.filter(c => !!profiles[c.id])

  const handleResearchOne = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId)
    if (!company) return
    setResearching(prev => new Set(prev).add(companyId))
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
    const profile = researchCompany(company)
    setProfile(companyId, profile)
    setResearching(prev => { const n = new Set(prev); n.delete(companyId); return n })
  }

  const handleResearchAll = async () => {
    if (unresearched.length === 0) return
    setBulkResearching(true)
    setProgress({ done: 0, total: unresearched.length })
    const profiles = await researchCompanies(unresearched, (done, total) => setProgress({ done, total }))
    for (const p of profiles) setProfile(p.companyId, p)
    setBulkResearching(false)
  }

  const handleQuickAdd = () => {
    if (!quickName.trim()) return
    const id = addCompany({ name: quickName, domain: quickDomain, linkedinUrl: '', description: '', source: 'Quick Add' })
    setQuickName('')
    setQuickDomain('')
    handleResearchOne(id)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Company Research</h1>
          <p className="text-sm text-[#52525B] mt-1">{researched.length} researched · {unresearched.length} pending</p>
        </div>
        {unresearched.length > 0 && (
          <button onClick={handleResearchAll} disabled={bulkResearching} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60">
            {bulkResearching ? <><RefreshCw size={14} className="animate-spin" /> {progress.done}/{progress.total}</> : <><Zap size={14} /> Research All ({unresearched.length})</>}
          </button>
        )}
      </div>

      {/* Quick Add + Research */}
      <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Quick Research</h2>
        <div className="flex gap-3">
          <input value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="Company name" className="flex-1 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" />
          <input value={quickDomain} onChange={e => setQuickDomain(e.target.value)} placeholder="Domain (optional)" className="w-48 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" />
          <button onClick={handleQuickAdd} disabled={!quickName.trim()} className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40"><Play size={14} /> Add & Research</button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
        <Search size={16} className="text-[#3F3F46]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="flex-1 bg-transparent text-sm text-[#F4F4F5] outline-none placeholder-[#3F3F46]" />
      </div>

      {/* Empty state */}
      {companies.length === 0 && (
        <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
          <Search size={32} className="mx-auto mb-3 text-[#3F3F46]" />
          <div className="text-sm font-medium text-[#A1A1AA] mb-1">No companies to research</div>
          <div className="text-xs text-[#52525B] mb-4">Add companies via Training Set upload, or use Quick Research above</div>
          <Link to="/training" className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium inline-flex items-center gap-2">Go to Training Set</Link>
        </div>
      )}

      {/* Company List */}
      {filtered.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-3 px-4 py-3 text-xs text-[#52525B] font-medium">
            <span>Company</span><span>Industry</span><span>Sources</span><span>Confidence</span><span>Status</span><span></span>
          </div>
          {filtered.map(c => {
            const profile = profiles[c.id]
            const isResearching = researching.has(c.id)
            const StatusIcon = statusIcons[isResearching ? 'researching' : (profile?.researchStatus || 'pending')]
            const color = statusColors[isResearching ? 'researching' : (profile?.researchStatus || 'pending')]
            return (
              <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-3 px-4 py-3 items-center hover:bg-white/[0.02] transition">
                <div>
                  <div className="text-sm text-[#F4F4F5]">{c.name}</div>
                  <div className="text-xs text-[#3F3F46]">{c.domain || 'No domain'}</div>
                </div>
                <span className="text-xs text-[#71717A]">{profile?.industry || '—'}</span>
                <div className="flex items-center gap-1">
                  {profile?.dataSources.slice(0, 3).map(s => <div key={s} className="w-5 h-5 rounded bg-white/[0.05] flex items-center justify-center text-[8px] text-[#71717A]" title={s}>{s.charAt(0).toUpperCase()}</div>)}
                  {(profile?.dataSources.length || 0) > 3 && <span className="text-[10px] text-[#52525B]">+{(profile?.dataSources.length || 0) - 3}</span>}
                  {!profile && <span className="text-xs text-[#3F3F46]">—</span>}
                </div>
                <div className="flex items-center gap-2">
                  {profile ? (
                    <>
                      <div className="h-2 rounded-full bg-white/[0.05] flex-1 max-w-[60px]"><div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${profile.confidenceScore}%` }} /></div>
                      <span className="text-xs text-[#71717A]">{profile.confidenceScore}%</span>
                    </>
                  ) : <span className="text-xs text-[#3F3F46]">—</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon size={14} style={{ color }} />
                  <span className="text-xs" style={{ color }}>{isResearching ? 'researching' : (profile?.researchStatus || 'pending')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!profile && !isResearching && (
                    <button onClick={() => handleResearchOne(c.id)} className="h-7 px-2.5 rounded-lg border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/10 flex items-center gap-1"><Play size={10} /> Research</button>
                  )}
                  {isResearching && <RefreshCw size={14} className="animate-spin text-[#F59E0B]" />}
                  {profile && <Link to={`/company/${c.id}`} className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">View <ExternalLink size={12} /></Link>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
