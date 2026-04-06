import { useAppStore } from '@/stores/appStore'
import { researchCompanyReal, researchCompaniesReal, researchCompanySimulated } from '@/lib/researchEngine'
import { Link } from 'react-router-dom'
import { Search, CheckCircle, AlertCircle, Clock, ExternalLink, Play, RefreshCw, Zap, Key, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

const statusIcons: Record<string, typeof CheckCircle> = { complete: CheckCircle, pending: Clock, researching: Clock, failed: AlertCircle }
const statusColors: Record<string, string> = { complete: '#10B981', pending: '#71717A', researching: '#F59E0B', failed: '#EF4444' }

function useAPIKeys() {
  const { apiKeys } = useAppStore()
  const get = (provider: string) => apiKeys.find(k => k.provider === provider)?.key
  return { openai: get('openai'), anthropic: get('anthropic'), google: get('google'), perplexity: get('perplexity'), serper: get('serper') }
}

function hasAnyAIKey(keys: ReturnType<typeof useAPIKeys>) {
  return !!(keys.openai || keys.anthropic || keys.google)
}

export default function Research() {
  const { companies, profiles, setProfile, addCompany } = useAppStore()
  const keys = useAPIKeys()
  const hasAI = hasAnyAIKey(keys)
  const [search, setSearch] = useState('')
  const [researching, setResearching] = useState<Set<string>>(new Set())
  const [bulkResearching, setBulkResearching] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0, current: '' })
  const [quickName, setQuickName] = useState('')
  const [quickDomain, setQuickDomain] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()))
  const unresearched = companies.filter(c => !profiles[c.id])
  const researched = companies.filter(c => !!profiles[c.id])

  const handleResearchOne = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId)
    if (!company) return
    setResearching(prev => new Set(prev).add(companyId))
    setErrors([])

    try {
      if (hasAI) {
        const result = await researchCompanyReal(company, keys)
        setProfile(companyId, result.profile)
        if (result.errors?.length) setErrors(prev => [...prev, ...result.errors!])
      } else {
        await new Promise(r => setTimeout(r, 500))
        setProfile(companyId, researchCompanySimulated(company))
      }
    } catch (e: any) {
      setErrors(prev => [...prev, `${company.name}: ${e.message}`])
      // Fallback to simulated
      setProfile(companyId, researchCompanySimulated(company))
    }

    setResearching(prev => { const n = new Set(prev); n.delete(companyId); return n })
  }

  const handleResearchAll = async () => {
    if (unresearched.length === 0) return
    setBulkResearching(true)
    setErrors([])

    if (hasAI) {
      const result = await researchCompaniesReal(unresearched, keys, (done, total, current) => setProgress({ done, total, current }))
      for (const p of result.profiles) setProfile(p.companyId, p)
      if (result.errors.length) setErrors(result.errors)
      // Fallback: any that didn't get a profile
      for (const c of unresearched) {
        if (!result.profiles.find(p => p.companyId === c.id)) {
          setProfile(c.id, researchCompanySimulated(c))
        }
      }
    } else {
      for (let i = 0; i < unresearched.length; i++) {
        setProgress({ done: i, total: unresearched.length, current: unresearched[i].name })
        await new Promise(r => setTimeout(r, 200))
        setProfile(unresearched[i].id, researchCompanySimulated(unresearched[i]))
      }
    }

    setBulkResearching(false)
  }

  const handleQuickAdd = async () => {
    if (!quickName.trim()) return
    const id = addCompany({ name: quickName, domain: quickDomain, linkedinUrl: '', description: '', source: 'Quick Add' })
    setQuickName('')
    setQuickDomain('')
    await handleResearchOne(id)
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
            {bulkResearching ? <><RefreshCw size={14} className="animate-spin" /> {progress.done}/{progress.total} — {progress.current}</> : <><Zap size={14} /> Research All ({unresearched.length})</>}
          </button>
        )}
      </div>

      {/* API Key Status */}
      {!hasAI && (
        <div className="rounded-xl p-4 border border-[#F59E0B]/20 bg-[#F59E0B]/[0.03] flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-[#F59E0B]">No AI API keys configured</div>
            <div className="text-xs text-[#52525B] mt-0.5">Research will use simulated data. <Link to="/api-keys" className="text-[#3B82F6] hover:underline">Add API keys</Link> (OpenAI, Anthropic, or Google) for real web search and AI-powered company research.</div>
          </div>
        </div>
      )}
      {hasAI && (
        <div className="rounded-xl p-4 border border-[#10B981]/20 bg-[#10B981]/[0.03] flex items-start gap-3">
          <CheckCircle size={16} className="text-[#10B981] mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-[#10B981]">Live Research Active</div>
            <div className="text-xs text-[#52525B] mt-0.5">
              Using: {[keys.openai && 'OpenAI', keys.anthropic && 'Anthropic', keys.google && 'Google AI', keys.perplexity && 'Perplexity', keys.serper && 'Serper'].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl p-4 border border-[#EF4444]/20 bg-[#EF4444]/[0.03]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#EF4444]">{errors.length} warnings</span>
            <button onClick={() => setErrors([])} className="text-xs text-[#52525B] hover:text-[#A1A1AA]">Dismiss</button>
          </div>
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {errors.map((e, i) => <div key={i} className="text-xs text-[#71717A]">{e}</div>)}
          </div>
        </div>
      )}

      {/* Quick Add + Research */}
      <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Quick Research</h2>
        <div className="flex gap-3">
          <input value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="Company name" className="flex-1 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
          <input value={quickDomain} onChange={e => setQuickDomain(e.target.value)} placeholder="Domain (e.g. acme.com)" className="w-52 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
          <button onClick={handleQuickAdd} disabled={!quickName.trim()} className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40"><Play size={14} /> Add & Research</button>
        </div>
      </div>

      {/* Search */}
      {companies.length > 0 && (
        <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
          <Search size={16} className="text-[#3F3F46]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="flex-1 bg-transparent text-sm text-[#F4F4F5] outline-none placeholder-[#3F3F46]" />
          <span className="text-xs text-[#3F3F46]">{filtered.length} results</span>
        </div>
      )}

      {/* Empty state */}
      {companies.length === 0 && (
        <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
          <Search size={32} className="mx-auto mb-3 text-[#3F3F46]" />
          <div className="text-sm font-medium text-[#A1A1AA] mb-1">No companies to research</div>
          <div className="text-xs text-[#52525B] mb-4">Use Quick Research above, or upload companies via Training Set</div>
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
            const isSimulated = profile?.dataSources.includes('simulated')
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
                  {isSimulated && <span className="text-[10px] text-[#F59E0B]">sim</span>}
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
                  {(!profile || isSimulated) && !isResearching && (
                    <button onClick={() => handleResearchOne(c.id)} className="h-7 px-2.5 rounded-lg border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/10 flex items-center gap-1"><Play size={10} /> {isSimulated && hasAI ? 'Re-research' : 'Research'}</button>
                  )}
                  {isResearching && <RefreshCw size={14} className="animate-spin text-[#F59E0B]" />}
                  {profile && !isSimulated && <Link to={`/company/${c.id}`} className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">View <ExternalLink size={12} /></Link>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
