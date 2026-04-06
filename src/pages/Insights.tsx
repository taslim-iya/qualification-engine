import { useAppStore } from '@/stores/appStore'
import { generateInsights } from '@/lib/insightsEngine'
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react'
import { useState } from 'react'

const signalColors: Record<string, string> = { strong_positive: '#10B981', moderate_positive: '#3B82F6', neutral: '#71717A', negative: '#F59E0B', disqualifying: '#EF4444', unknown: '#52525B' }

export default function Insights() {
  const { insights, setInsights, trainingCompanies, trainingSets, companies, profiles } = useAppStore()
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    if (trainingCompanies.length === 0) return
    setGenerating(true)
    setTimeout(() => {
      const tsId = trainingSets[0]?.id || 'default'
      const result = generateInsights(trainingCompanies, companies, profiles, tsId)
      setInsights(result)
      setGenerating(false)
    }, 800) // brief delay for UX
  }

  if (!insights) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Baseline Insights</h1>
          <p className="text-sm text-[#52525B] mt-1">Patterns extracted from your training companies</p>
        </div>
        <div className="rounded-xl p-12 border border-white/[0.06] bg-white/[0.02] text-center">
          <Lightbulb size={32} className="mx-auto mb-3 text-[#3F3F46]" />
          <div className="text-sm font-medium text-[#A1A1AA] mb-1">No insights generated yet</div>
          <div className="text-xs text-[#52525B] mb-4">
            {trainingCompanies.length === 0
              ? 'Add companies to your training set first, then generate insights.'
              : `${trainingCompanies.length} training companies ready. Generate insights to find patterns.`
            }
          </div>
          <button
            onClick={handleGenerate}
            disabled={trainingCompanies.length === 0 || generating}
            className="h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2 mx-auto disabled:opacity-40"
          >
            {generating ? <><RefreshCw size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Generate Insights</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Baseline Insights</h1>
          <p className="text-sm text-[#52525B] mt-1">Patterns extracted from {trainingCompanies.length} training companies</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="h-9 px-4 rounded-lg border border-white/[0.08] text-xs text-[#A1A1AA] flex items-center gap-1.5 hover:bg-white/[0.04] disabled:opacity-40">
          {generating ? <><RefreshCw size={12} className="animate-spin" /> Regenerating...</> : <><RefreshCw size={12} /> Regenerate</>}
        </button>
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
      {insights.topKeywords.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Keyword Analysis ({insights.topKeywords.length} keywords)</h2>
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs text-[#52525B] font-medium">
              <span>Keyword</span><span>Frequency</span><span>Signal</span><span>Strength</span>
            </div>
            {insights.topKeywords.map(k => {
              const maxCount = Math.max(...insights.topKeywords.map(kw => kw.count), 1)
              return (
                <div key={k.word} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center">
                  <span className="text-sm text-[#F4F4F5]">{k.word}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-white/[0.05] flex-1 max-w-[80px]"><div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${(k.count / maxCount) * 100}%` }} /></div>
                    <span className="text-xs text-[#71717A]">{k.count}</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full w-fit" style={{ color: signalColors[k.signal], background: `${signalColors[k.signal]}10` }}>{k.signal.replace(/_/g, ' ')}</span>
                  <div className="h-2 rounded-full bg-white/[0.05] max-w-[100px]"><div className="h-2 rounded-full" style={{ width: `${(k.count / maxCount) * 100}%`, background: signalColors[k.signal] }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Themes */}
      {insights.themes.length > 0 && (
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
      )}

      {/* Differentiators */}
      {insights.differentiators.length > 0 && (
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
      )}

      {/* Common Traits */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Positive Traits (Ideal Targets)</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-2">
            {insights.commonTraits.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" /><span className="text-[#A1A1AA]">{t}</span></div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Negative Traits (Poor/Reject)</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-2">
            {insights.negativeTraits.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" /><span className="text-[#A1A1AA]">{t}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Industries & Regions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Top Industries</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-3">
            {insights.topIndustries.map(i => {
              const max = Math.max(...insights.topIndustries.map(x => x.count), 1)
              return (
                <div key={i.name}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-[#A1A1AA]">{i.name}</span><span className="text-[#F4F4F5] font-medium">{i.count}</span></div>
                  <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${(i.count / max) * 100}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#52525B] mb-3">Top Regions</h2>
          <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] space-y-3">
            {insights.topRegions.map(r => {
              const max = Math.max(...insights.topRegions.map(x => x.count), 1)
              return (
                <div key={r.name}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-[#A1A1AA]">{r.name}</span><span className="text-[#F4F4F5] font-medium">{r.count}</span></div>
                  <div className="h-2 rounded-full bg-white/[0.05]"><div className="h-2 rounded-full bg-[#8B5CF6]" style={{ width: `${(r.count / max) * 100}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
