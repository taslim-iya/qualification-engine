import { useAppStore } from '@/stores/appStore'
import { Link } from 'react-router-dom'
import { Building2, Target, CheckCircle, XCircle, ArrowUpRight, Upload, Lightbulb, SlidersHorizontal, Search, Zap } from 'lucide-react'

export default function Dashboard() {
  const { companies, scores, model, insights, tools, trainingCompanies, profiles } = useAppStore()
  const qualified = scores.filter(s => s.qualBand === 'pursue_now').length
  const cautionCount = scores.filter(s => s.qualBand === 'pursue_caution').length
  const review = scores.filter(s => s.qualBand === 'manual_review').length
  const rejected = scores.filter(s => s.qualBand === 'reject').length
  const enabledTools = tools.filter(t => t.enabled).length
  const profiledCount = Object.keys(profiles).length

  const hasCompanies = companies.length > 0
  const hasTraining = trainingCompanies.length > 0
  const hasInsights = !!insights
  const hasCriteria = model.manualCriteria.length > 0 || model.learnedCriteria.length > 0 || model.keywordCriteria.length > 0
  const hasProfiles = profiledCount > 0
  const hasScores = scores.length > 0

  const steps = [
    { done: hasTraining, label: 'Upload Training Companies', desc: 'Add baseline companies with labels (ideal/good/poor/reject)', link: '/training', icon: Upload },
    { done: hasInsights, label: 'Generate Baseline Insights', desc: 'Extract patterns, keywords, and ICP from training data', link: '/insights', icon: Lightbulb },
    { done: hasCriteria, label: 'Configure Scoring Criteria', desc: 'Set up manual criteria or generate from insights', link: '/criteria', icon: SlidersHorizontal },
    { done: hasProfiles, label: 'Research Companies', desc: 'Run AI research to build company profiles', link: '/research', icon: Search },
    { done: hasScores, label: 'Score & Qualify', desc: 'Score companies against your criteria model', link: '/scoring', icon: Zap },
  ]
  const completedSteps = steps.filter(s => s.done).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Dashboard</h1>
        <p className="text-sm text-[#52525B] mt-1">Company qualification overview</p>
      </div>

      {/* Getting Started - show when pipeline incomplete */}
      {completedSteps < 5 && (
        <div className="rounded-xl p-6 border border-[#3B82F6]/20 bg-[#3B82F6]/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-[#3B82F6]">Getting Started</h2>
              <p className="text-xs text-[#52525B] mt-0.5">{completedSteps}/5 steps complete</p>
            </div>
            <div className="h-2 w-32 rounded-full bg-white/[0.1]">
              <div className="h-2 rounded-full bg-[#3B82F6] transition-all" style={{ width: `${(completedSteps / 5) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <Link key={i} to={s.link} className={`flex items-center gap-3 p-3 rounded-lg transition ${s.done ? 'bg-[#10B981]/[0.05]' : 'bg-white/[0.03] hover:bg-white/[0.05]'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s.done ? 'bg-[#10B981] text-white' : 'border border-white/[0.12] text-[#52525B]'}`}>
                  {s.done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${s.done ? 'text-[#10B981]' : 'text-[#F4F4F5]'}`}>{s.label}</div>
                  <div className="text-xs text-[#52525B]">{s.desc}</div>
                </div>
                {!s.done && <ArrowUpRight size={14} className="text-[#3B82F6]" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Companies', value: companies.length, icon: Building2, color: '#3B82F6' },
          { label: 'Pursue Now', value: qualified, icon: CheckCircle, color: '#10B981' },
          { label: 'Pursue w/ Caution', value: cautionCount, icon: Target, color: '#F59E0B' },
          { label: 'Manual Review', value: review, icon: Target, color: '#3B82F6' },
          { label: 'Rejected', value: rejected, icon: XCircle, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#52525B]">{s.label}</span>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-semibold text-[#F4F4F5]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Stats */}
      {hasCompanies && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Training', value: trainingCompanies.length, total: companies.length, color: '#8B5CF6' },
            { label: 'Researched', value: profiledCount, total: companies.length, color: '#3B82F6' },
            { label: 'Scored', value: scores.length, total: companies.length, color: '#10B981' },
            { label: 'Tools Active', value: enabledTools, total: tools.length, color: '#F59E0B' },
          ].map(p => (
            <div key={p.label} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <div className="text-xs text-[#52525B] mb-2">{p.label}</div>
              <div className="flex items-end gap-1">
                <span className="text-xl font-semibold" style={{ color: p.color }}>{p.value}</span>
                <span className="text-xs text-[#3F3F46] mb-0.5">/ {p.total}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.05] mt-2">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.total > 0 ? (p.value / p.total) * 100 : 0}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model + Tools */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#A1A1AA]">Active Model</h2>
            <Link to="/criteria" className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">Edit <ArrowUpRight size={12} /></Link>
          </div>
          <div className="text-lg font-semibold text-[#F4F4F5] mb-1">{model.name}</div>
          <div className="text-xs text-[#52525B] mb-4">Mode: {model.mode} · v{model.version} · {model.manualCriteria.length + model.learnedCriteria.length + model.keywordCriteria.length} criteria</div>
          <div className="space-y-2">
            {Object.entries(model.sourceWeights).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#71717A] capitalize">{k}</span>
                  <span className="text-[#A1A1AA]">{Math.round(v * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${v * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#A1A1AA]">Intelligence Tools</h2>
            <Link to="/tools" className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1">Manage <ArrowUpRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {tools.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.enabled ? 'bg-[#10B981]' : 'bg-[#3F3F46]'}`} />
                  <span className="text-sm text-[#A1A1AA]">{t.name}</span>
                </div>
                <span className="text-xs text-[#52525B]">{t.enabled ? 'Active' : 'Off'}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-[#3F3F46]">{enabledTools}/{tools.length} tools active</div>
        </div>
      </div>

      {/* Score Distribution */}
      {hasScores && (
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Qualification Distribution</h2>
          <div className="grid grid-cols-4 gap-3">
            {model.qualBands.map(b => {
              const count = scores.filter(s => s.qualBand === b.band).length
              return (
                <div key={b.band} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] text-center">
                  <div className="text-2xl font-semibold" style={{ color: b.color }}>{count}</div>
                  <div className="text-xs text-[#52525B] mt-1">{b.label}</div>
                  <div className="text-[10px] text-[#3F3F46]">{b.min}–{b.max}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Predictors */}
      {insights && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#52525B]">Top Predictors</h2>
            <Link to="/insights" className="text-xs text-[#3B82F6] hover:underline">View all</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.topKeywords.slice(0, 8).map(k => {
              const colors: Record<string, string> = { strong_positive: '#10B981', moderate_positive: '#3B82F6', neutral: '#71717A', negative: '#EF4444', disqualifying: '#EF4444', unknown: '#52525B' }
              return (
                <span key={k.word} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.06]" style={{ color: colors[k.signal], background: `${colors[k.signal]}10` }}>
                  {k.word} <span className="text-[#3F3F46]">({k.count})</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Scores */}
      {scores.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#52525B]">Recent Scores</h2>
            <Link to="/scoring" className="text-xs text-[#3B82F6] hover:underline">View all</Link>
          </div>
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            {scores.slice(-5).reverse().map(s => {
              const company = companies.find(c => c.id === s.companyId)
              const band = model.qualBands.find(b => b.band === s.qualBand)
              return (
                <Link key={s.id} to={`/company/${s.companyId}`} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.08] text-sm font-bold" style={{ color: band?.color, background: `${band?.color}10` }}>{s.totalScore}</div>
                    <div>
                      <div className="text-sm font-medium text-[#F4F4F5]">{company?.name}</div>
                      <div className="text-xs text-[#3F3F46]">{company?.domain} · Scored {s.scoredAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: band?.color, background: `${band?.color}15` }}>{band?.label}</span>
                    <ArrowUpRight size={14} className="text-[#3F3F46]" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
