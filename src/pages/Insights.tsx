import { useAppStore } from '@/stores/appStore'

const signalColors: Record<string, string> = { strong_positive: '#10B981', moderate_positive: '#3B82F6', neutral: '#71717A', negative: '#F59E0B', disqualifying: '#EF4444', unknown: '#52525B' }

export default function Insights() {
  const { insights } = useAppStore()
  if (!insights) return <div className="text-[#52525B]">No baseline insights generated yet. Upload a training set first.</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Baseline Insights</h1>
        <p className="text-sm text-[#52525B] mt-1">Patterns extracted from your training companies</p>
      </div>

      {/* ICP Summary */}
      <div className="rounded-xl p-6 border border-[#3B82F6]/20 bg-[#3B82F6]/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[#3B82F6]">Ideal Customer Profile</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-medium">{insights.confidenceScore}% confidence</span>
        </div>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">{insights.icpSummary}</p>
      </div>

      {/* Keywords */}
      <div>
        <h2 className="text-sm font-medium text-[#52525B] mb-3">Keyword Analysis</h2>
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs text-[#52525B] font-medium">
            <span>Keyword</span><span>Frequency</span><span>Signal</span><span>Strength</span>
          </div>
          {insights.topKeywords.map(k => (
            <div key={k.word} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center">
              <span className="text-sm text-[#F4F4F5]">{k.word}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-white/[0.05] flex-1 max-w-[80px]"><div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${(k.count / 5) * 100}%` }} /></div>
                <span className="text-xs text-[#71717A]">{k.count}</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full w-fit" style={{ color: signalColors[k.signal], background: `${signalColors[k.signal]}10` }}>{k.signal.replace('_', ' ')}</span>
              <div className="h-2 rounded-full bg-white/[0.05] max-w-[100px]"><div className="h-2 rounded-full" style={{ width: `${(k.count / 5) * 100}%`, background: signalColors[k.signal] }} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div>
        <h2 className="text-sm font-medium text-[#52525B] mb-3">Clustered Themes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.themes.map(t => (
            <div key={t.name} className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#F4F4F5]">{t.name}</span>
                <span className="text-xs text-[#52525B]">{t.count} companies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.keywords.map(k => <span key={k} className="px-2 py-1 rounded text-xs bg-white/[0.05] text-[#A1A1AA]">{k}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Differentiators */}
      <div>
        <h2 className="text-sm font-medium text-[#52525B] mb-3">Ideal vs Poor Differentiators</h2>
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
          {insights.differentiators.map(d => (
            <div key={d.trait} className="px-4 py-3 flex items-center gap-4">
              <span className="text-sm text-[#F4F4F5] flex-1">{d.trait}</span>
              <div className="flex items-center gap-6 text-xs">
                <div className="w-24">
                  <div className="flex justify-between mb-1"><span className="text-[#52525B]">Ideal</span><span className="text-[#10B981] font-medium">{d.idealPct}%</span></div>
                  <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#10B981]" style={{ width: `${d.idealPct}%` }} /></div>
                </div>
                <div className="w-24">
                  <div className="flex justify-between mb-1"><span className="text-[#52525B]">Poor</span><span className="text-[#EF4444] font-medium">{d.poorPct}%</span></div>
                  <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#EF4444]" style={{ width: `${d.poorPct}%` }} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Traits */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Positive Traits (Ideal Targets)</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-2">
            {insights.commonTraits.map(t => (
              <div key={t} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span className="text-[#A1A1AA]">{t}</span></div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Negative Traits (Poor/Reject)</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-2">
            {insights.negativeTraits.map(t => (
              <div key={t} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /><span className="text-[#A1A1AA]">{t}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Industries & Regions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Top Industries</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-3">
            {insights.topIndustries.map(i => (
              <div key={i.name}>
                <div className="flex justify-between text-sm mb-1"><span className="text-[#A1A1AA]">{i.name}</span><span className="text-[#F4F4F5] font-medium">{i.count}</span></div>
                <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${(i.count / 8) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Top Regions</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-3">
            {insights.topRegions.map(r => (
              <div key={r.name}>
                <div className="flex justify-between text-sm mb-1"><span className="text-[#A1A1AA]">{r.name}</span><span className="text-[#F4F4F5] font-medium">{r.count}</span></div>
                <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#8B5CF6]" style={{ width: `${(r.count / 8) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">Generate Criteria from Insights →</button>
    </div>
  )
}
