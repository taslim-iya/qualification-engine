import { useAppStore } from '@/stores/appStore'
import { Link } from 'react-router-dom'
import { Search, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const statusIcons: Record<string, typeof CheckCircle> = { complete: CheckCircle, pending: Clock, researching: Clock, failed: AlertCircle }
const statusColors: Record<string, string> = { complete: '#10B981', pending: '#71717A', researching: '#F59E0B', failed: '#EF4444' }

export default function Research() {
  const { companies, profiles } = useAppStore()
  const [search, setSearch] = useState('')
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Company Research</h1>
        <p className="text-sm text-[#52525B] mt-1">View gathered intelligence for each company</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
          <Search size={16} className="text-[#3F3F46]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="flex-1 bg-transparent text-sm text-[#F4F4F5] outline-none placeholder-[#3F3F46]" />
        </div>
        <button className="h-10 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">+ Research New</button>
      </div>

      <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-4 py-3 text-xs text-[#52525B] font-medium">
          <span>Company</span><span>Industry</span><span>Sources</span><span>Confidence</span><span>Status</span><span></span>
        </div>
        {filtered.map(c => {
          const profile = profiles[c.id]
          const StatusIcon = statusIcons[profile?.researchStatus || 'pending']
          const color = statusColors[profile?.researchStatus || 'pending']
          return (
            <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition">
              <div>
                <div className="text-sm text-[#F4F4F5]">{c.name}</div>
                <div className="text-xs text-[#3F3F46]">{c.domain}</div>
              </div>
              <span className="text-xs text-[#71717A]">{profile?.industry || '—'}</span>
              <div className="flex items-center gap-1">
                {profile?.dataSources.slice(0, 3).map(s => <div key={s} className="w-5 h-5 rounded bg-white/[0.05] flex items-center justify-center text-[8px] text-[#71717A]" title={s}>{s.charAt(0).toUpperCase()}</div>)}
                {(profile?.dataSources.length || 0) > 3 && <span className="text-[10px] text-[#52525B]">+{(profile?.dataSources.length || 0) - 3}</span>}
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
                <span className="text-xs" style={{ color }}>{profile?.researchStatus || 'pending'}</span>
              </div>
              <Link to={`/company/${c.id}`} className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">View <ExternalLink size={12} /></Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
