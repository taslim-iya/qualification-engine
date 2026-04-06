import { useAppStore } from '@/stores/appStore'
import { useState } from 'react'

const ruleColors: Record<string, string> = { hard_filter: '#EF4444', positive: '#10B981', negative: '#F59E0B', review_flag: '#3B82F6' }

export default function Criteria() {
  const { model } = useAppStore()
  const [tab, setTab] = useState<'manual' | 'learned' | 'keyword' | 'weights'>('weights')

  const allCriteria = { manual: model.manualCriteria, learned: model.learnedCriteria, keyword: model.keywordCriteria }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Criteria Builder</h1>
        <p className="text-sm text-[#52525B] mt-1">Configure your scoring model</p>
      </div>

      {/* Mode selector */}
      <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Criteria Mode</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['manual', 'learned', 'blended'] as const).map(m => (
            <div key={m} className={`rounded-xl p-4 border cursor-pointer transition ${model.mode === m ? 'border-[#3B82F6] bg-[#3B82F6]/[0.05]' : 'border-white/[0.06] hover:border-white/[0.12]'}`}>
              <div className="text-sm font-medium text-[#F4F4F5] capitalize mb-1">{m === 'blended' ? 'Blended (Recommended)' : `${m} Only`}</div>
              <div className="text-xs text-[#52525B]">
                {m === 'manual' && 'You define all criteria manually'}
                {m === 'learned' && 'AI generates criteria from training data'}
                {m === 'blended' && 'Combine manual, learned, and keyword criteria'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {(['weights', 'manual', 'learned', 'keyword'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition capitalize ${tab === t ? 'border-[#3B82F6] text-[#F4F4F5]' : 'border-transparent text-[#52525B] hover:text-[#A1A1AA]'}`}>
            {t === 'weights' ? 'Weights & Bands' : `${t} Criteria`}
          </button>
        ))}
      </div>

      {tab === 'weights' && (
        <div className="space-y-6">
          {/* Source weights */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Source Group Weights</h2>
            <div className="space-y-4">
              {Object.entries(model.sourceWeights).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#A1A1AA] capitalize">{k}</span><span className="text-[#F4F4F5] font-semibold">{Math.round(v * 100)}%</span></div>
                  <input type="range" min="0" max="100" value={Math.round(v * 100)} className="w-full accent-[#3B82F6]" readOnly />
                </div>
              ))}
            </div>
          </div>
          {/* Score Bands */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Qualification Bands</h2>
            <div className="space-y-3">
              {model.qualBands.map(b => (
                <div key={b.band} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-3 h-3 rounded-full" style={{ background: b.color }} />
                  <span className="text-sm font-medium text-[#F4F4F5] flex-1">{b.label}</span>
                  <span className="text-xs text-[#71717A] font-mono">{b.min}–{b.max}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Subscore Weights */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Subscore Weights</h2>
            <div className="grid grid-cols-3 gap-4">
              {[{ name: 'Fit Score', weight: 40, color: '#3B82F6' }, { name: 'Need Score', weight: 35, color: '#10B981' }, { name: 'Buyability Score', weight: 25, color: '#8B5CF6' }].map(s => (
                <div key={s.name} className="rounded-xl p-4 border border-white/[0.06] text-center">
                  <div className="text-2xl font-semibold" style={{ color: s.color }}>{s.weight}%</div>
                  <div className="text-xs text-[#52525B] mt-1">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(tab === 'manual' || tab === 'learned' || tab === 'keyword') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#52525B]">{allCriteria[tab].length} criteria</span>
            <button className="h-8 px-3 rounded-lg bg-[#3B82F6] text-white text-xs font-medium">+ Add Criterion</button>
          </div>
          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            {allCriteria[tab].map(c => (
              <div key={c.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: ruleColors[c.ruleType], background: `${ruleColors[c.ruleType]}15` }}>{c.ruleType.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-[#F4F4F5]">{c.name}</span>
                    {c.required && <span className="text-[10px] text-[#EF4444]">REQUIRED</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#52525B]">Weight: <span className="text-[#F4F4F5] font-medium">{c.weight}</span></span>
                    {c.confidenceScore && <span className="text-xs text-[#52525B]">Confidence: <span className="text-[#10B981]">{c.confidenceScore}%</span></span>}
                  </div>
                </div>
                <p className="text-xs text-[#71717A] mb-2">{c.description}</p>
                <div className="flex gap-2">
                  {c.productLines.map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-[#52525B]">{p}</span>)}
                </div>
                {c.supportingCompanies && (
                  <div className="mt-2 text-[10px] text-[#3F3F46]">Supporting: {c.supportingCompanies.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
