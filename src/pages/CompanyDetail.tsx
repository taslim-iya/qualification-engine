import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { researchCompany } from '@/lib/researchEngine'
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, Zap } from 'lucide-react'
import { useState } from 'react'

export default function CompanyDetail() {
  const { id } = useParams()
  const { companies, profiles, scores, model, activities, setProfile, scoreCompany } = useAppStore()
  const company = companies.find(c => c.id === id)
  const profile = id ? profiles[id] : undefined
  const score = scores.find(s => s.companyId === id)
  const band = score ? model.qualBands.find(b => b.band === score.qualBand) : undefined
  const activity = activities.find(a => a.companyId === id)
  const [researching, setResearching] = useState(false)
  const [scoring, setScoring] = useState(false)

  if (!company) return (
    <div className="space-y-4">
      <Link to="/research" className="text-sm text-[#3B82F6] flex items-center gap-1 hover:underline"><ArrowLeft size={14} /> Back</Link>
      <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
        <div className="text-sm text-[#A1A1AA]">Company not found</div>
      </div>
    </div>
  )

  const handleResearch = async () => {
    setResearching(true)
    await new Promise(r => setTimeout(r, 600))
    const p = researchCompany(company)
    setProfile(company.id, p)
    setResearching(false)
  }

  const handleScore = async () => {
    if (!profile) {
      setResearching(true)
      await new Promise(r => setTimeout(r, 600))
      const p = researchCompany(company)
      setProfile(company.id, p)
      setResearching(false)
    }
    setScoring(true)
    await new Promise(r => setTimeout(r, 400))
    scoreCompany(company.id)
    setScoring(false)
  }

  return (
    <div className="space-y-8">
      <Link to="/research" className="text-sm text-[#3B82F6] flex items-center gap-1 hover:underline"><ArrowLeft size={14} /> Back</Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">{company.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-[#52525B]">{company.domain || 'No domain'}</span>
            {company.linkedinUrl && <a href={company.linkedinUrl.startsWith('http') ? company.linkedinUrl : `https://${company.linkedinUrl}`} target="_blank" rel="noopener" className="text-xs text-[#3B82F6] flex items-center gap-1">LinkedIn <ExternalLink size={12} /></a>}
            <span className="text-xs text-[#3F3F46]">Added {company.createdAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!profile && (
            <button onClick={handleResearch} disabled={researching} className="h-9 px-4 rounded-lg border border-[#3B82F6]/30 text-[#3B82F6] text-sm font-medium flex items-center gap-2 hover:bg-[#3B82F6]/10 disabled:opacity-50">
              {researching ? <><RefreshCw size={14} className="animate-spin" /> Researching...</> : <><Play size={14} /> Research</>}
            </button>
          )}
          {profile && !score && (
            <button onClick={handleScore} disabled={scoring} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50">
              {scoring ? <><RefreshCw size={14} className="animate-spin" /> Scoring...</> : <><Zap size={14} /> Score Now</>}
            </button>
          )}
          {score && band && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center border-2 text-2xl font-bold" style={{ borderColor: band.color, color: band.color, background: `${band.color}10` }}>{score.totalScore}</div>
              <div className="text-xs mt-1" style={{ color: band.color }}>{band.label}</div>
            </div>
          )}
        </div>
      </div>

      {/* No data yet */}
      {!profile && !score && (
        <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
          <Play size={32} className="mx-auto mb-3 text-[#3F3F46]" />
          <div className="text-sm font-medium text-[#A1A1AA] mb-1">No data yet</div>
          <div className="text-xs text-[#52525B] mb-4">Click "Research" to gather intelligence about this company</div>
          <button onClick={handleResearch} disabled={researching} className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium mx-auto flex items-center gap-2 disabled:opacity-50">
            {researching ? <><RefreshCw size={14} className="animate-spin" /> Researching...</> : <><Play size={14} /> Research Company</>}
          </button>
        </div>
      )}

      {/* Score Breakdown */}
      {score && (
        <div className="grid grid-cols-3 gap-4">
          {[{ label: 'Fit Score', value: score.fitScore, color: '#3B82F6' }, { label: 'Need Score', value: score.needScore, color: '#10B981' }, { label: 'Buyability', value: score.buyabilityScore, color: '#8B5CF6' }].map(s => (
            <div key={s.label} className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
              <div className="text-xs text-[#52525B] mb-2">{s.label}</div>
              <div className="text-3xl font-semibold" style={{ color: s.color }}>{s.value}</div>
              <div className="h-2 rounded-full bg-white/[0.05] mt-3"><div className="h-2 rounded-full" style={{ width: `${s.value}%`, background: s.color }} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Rationale */}
      {score && (
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Scoring Rationale</h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">{score.rationale}</p>
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs text-[#52525B] mb-2 font-medium">Matched Manual Criteria</h3>
              <div className="space-y-1.5">
                {score.matchedManual.map(m => (
                  <div key={m.criterionId} className="flex items-center gap-2 text-xs">
                    {m.impact > 0 ? <CheckCircle size={12} className="text-[#10B981]" /> : <XCircle size={12} className="text-[#EF4444]" />}
                    <span className="text-[#A1A1AA]">{m.name}</span>
                    <span className="text-[#52525B]">— {m.reason}</span>
                  </div>
                ))}
                {score.matchedManual.length === 0 && <span className="text-xs text-[#3F3F46]">No manual criteria configured</span>}
              </div>
            </div>
            <div>
              <h3 className="text-xs text-[#52525B] mb-2 font-medium">Matched Learned Criteria</h3>
              <div className="space-y-1.5">
                {score.matchedLearned.map(m => (
                  <div key={m.criterionId} className="flex items-center gap-2 text-xs">
                    {m.impact > 0 ? <CheckCircle size={12} className="text-[#10B981]" /> : <XCircle size={12} className="text-[#EF4444]" />}
                    <span className="text-[#A1A1AA]">{m.name}</span>
                    <span className="text-[#52525B]">— {m.reason}</span>
                  </div>
                ))}
                {score.matchedLearned.length === 0 && <span className="text-xs text-[#3F3F46]">No learned criteria configured</span>}
              </div>
            </div>
          </div>
          {score.matchedKeywords.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs text-[#52525B] mb-2 font-medium">Matched Keywords</h3>
              <div className="flex flex-wrap gap-1.5">
                {score.matchedKeywords.map(k => {
                  const colors: Record<string, string> = { strong_positive: '#10B981', moderate_positive: '#3B82F6', neutral: '#71717A', negative: '#F59E0B', disqualifying: '#EF4444', unknown: '#52525B' }
                  return <span key={k.keyword} className="px-2 py-1 rounded text-xs" style={{ color: colors[k.signal], background: `${colors[k.signal]}10` }}>{k.keyword}</span>
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile */}
      {profile && (
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#A1A1AA]">Company Intelligence Profile</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">{profile.confidenceScore}% confidence</span>
              <button onClick={handleResearch} disabled={researching} className="text-xs text-[#52525B] hover:text-[#A1A1AA] flex items-center gap-1">
                <RefreshCw size={10} className={researching ? 'animate-spin' : ''} /> Re-research
              </button>
            </div>
          </div>
          <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">{profile.summary}</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              ['Industry', profile.industry], ['Sub-industry', profile.subindustry], ['Business Model', profile.businessModel],
              ['Customer Type', profile.customerType], ['Employees', profile.employeeBand], ['Revenue', profile.revenueBand],
            ].map(([k, v]) => (
              <div key={k}><div className="text-xs text-[#52525B] mb-0.5">{k}</div><div className="text-[#F4F4F5]">{v || '—'}</div></div>
            ))}
          </div>
          <div className="mt-4">
            <div className="text-xs text-[#52525B] mb-1.5">Regions</div>
            <div className="flex flex-wrap gap-1.5">{profile.regions.map(r => <span key={r} className="px-2 py-1 rounded text-xs bg-white/[0.05] text-[#A1A1AA]">{r}</span>)}</div>
          </div>
          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-xs text-[#52525B] mb-1.5">Growth Signals</div>
              <div className="flex flex-wrap gap-1.5">{profile.growthSignals.map(s => <span key={s} className="px-2 py-1 rounded text-xs bg-[#10B981]/10 text-[#10B981]">{s}</span>)}</div>
              {profile.growthSignals.length === 0 && <span className="text-xs text-[#3F3F46]">None detected</span>}
            </div>
            <div>
              <div className="text-xs text-[#52525B] mb-1.5">Risk Signals</div>
              <div className="flex flex-wrap gap-1.5">{profile.riskSignals.map(s => <span key={s} className="px-2 py-1 rounded text-xs bg-[#EF4444]/10 text-[#EF4444]">{s}</span>)}</div>
              {profile.riskSignals.length === 0 && <span className="text-xs text-[#3F3F46]">None detected</span>}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-[#52525B] mb-1.5">Likely Insurance Needs</div>
            <div className="flex flex-wrap gap-1.5">{profile.likelyInsuranceNeeds.map(n => <span key={n} className="px-2 py-1 rounded text-xs bg-[#8B5CF6]/10 text-[#8B5CF6]">{n}</span>)}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-[#52525B] mb-1.5">Keywords</div>
            <div className="flex flex-wrap gap-1.5">{profile.keywords.map(k => <span key={k} className="px-2 py-1 rounded text-xs bg-white/[0.05] text-[#A1A1AA]">{k}</span>)}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-[#52525B] mb-1.5">Data Sources</div>
            <div className="flex gap-2">{profile.dataSources.map(s => <span key={s} className="px-2 py-1 rounded text-xs bg-white/[0.05] text-[#71717A]">{s.replace(/_/g, ' ')}</span>)}</div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {score && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Recommended Products</h2>
            <div className="space-y-2">
              {score.recommendedProducts.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm"><CheckCircle size={14} className="text-[#10B981]" /><span className="text-[#F4F4F5]">{p}</span></div>
              ))}
              {score.recommendedProducts.length === 0 && <span className="text-xs text-[#3F3F46]">No specific products recommended</span>}
            </div>
          </div>
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-3">Next Action</h2>
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
              <div>
                <div className="text-sm text-[#F4F4F5]">{score.nextAction}</div>
                {activity && (
                  <div className="mt-3 p-3 rounded-lg bg-white/[0.03] text-xs">
                    <div className="text-[#A1A1AA]">Assigned: <span className="text-[#F4F4F5]">{activity.assignedRep}</span></div>
                    <div className="text-[#A1A1AA]">Status: <span className="text-[#F4F4F5]">{activity.status}</span></div>
                    <div className="text-[#A1A1AA]">Follow-up: <span className="text-[#F4F4F5]">{activity.followUpDate}</span></div>
                    {activity.notes && <div className="text-[#52525B] mt-1">{activity.notes}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
