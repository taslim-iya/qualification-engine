import { useAppStore } from '@/stores/appStore'
import { useState } from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import type { Criterion, RuleType, CriteriaMode } from '@/types'

const ruleColors: Record<string, string> = { hard_filter: '#EF4444', positive: '#10B981', negative: '#F59E0B', review_flag: '#3B82F6' }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

export default function Criteria() {
  const { model, updateModel, insights } = useAppStore()
  const [tab, setTab] = useState<'manual' | 'learned' | 'keyword' | 'weights'>('weights')
  const [adding, setAdding] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editRule, setEditRule] = useState<RuleType>('positive')
  const [editWeight, setEditWeight] = useState(5)
  const [editRequired, setEditRequired] = useState(false)
  const [editProducts, setEditProducts] = useState('')

  const allCriteria = { manual: model.manualCriteria, learned: model.learnedCriteria, keyword: model.keywordCriteria }

  const handleModeChange = (mode: CriteriaMode) => updateModel({ mode })

  const handleWeightChange = (key: 'manual' | 'learned' | 'keywords', value: number) => {
    const pct = value / 100
    const others = Object.entries(model.sourceWeights).filter(([k]) => k !== key)
    const remaining = 1 - pct
    const otherTotal = others.reduce((sum, [, v]) => sum + v, 0) || 1
    const newWeights = { ...model.sourceWeights, [key]: pct }
    for (const [k, v] of others) {
      (newWeights as Record<string, number>)[k] = (v / otherTotal) * remaining
    }
    updateModel({ sourceWeights: newWeights })
  }

  const handleBandChange = (band: string, field: 'min' | 'max', value: number) => {
    const newBands = model.qualBands.map(b => b.band === band ? { ...b, [field]: value } : b)
    updateModel({ qualBands: newBands })
  }

  const handleAddCriterion = () => {
    if (!editName.trim()) return
    const criterion: Criterion = {
      id: uid(), name: editName, description: editDesc, ruleType: editRule, weight: editWeight,
      source: tab as 'manual' | 'learned' | 'keyword', productLines: editProducts.split(',').map(p => p.trim()).filter(Boolean), required: editRequired,
    }
    const key = tab === 'manual' ? 'manualCriteria' : tab === 'learned' ? 'learnedCriteria' : 'keywordCriteria'
    updateModel({ [key]: [...(model as Record<string, Criterion[]>)[key], criterion] })
    resetForm()
  }

  const handleDeleteCriterion = (criterionId: string, source: 'manual' | 'learned' | 'keyword') => {
    const key = source === 'manual' ? 'manualCriteria' : source === 'learned' ? 'learnedCriteria' : 'keywordCriteria'
    updateModel({ [key]: ((model as Record<string, Criterion[]>)[key] as Criterion[]).filter(c => c.id !== criterionId) })
  }

  const resetForm = () => {
    setAdding(false); setEditName(''); setEditDesc(''); setEditRule('positive'); setEditWeight(5); setEditRequired(false); setEditProducts('')
  }

  const generateFromInsights = () => {
    if (!insights) return
    const generated: Criterion[] = []
    for (const kw of insights.topKeywords.slice(0, 5)) {
      generated.push({
        id: uid(), name: `Keyword: ${kw.word}`, description: `Company associated with keyword "${kw.word}" (frequency: ${kw.count})`,
        ruleType: kw.signal === 'disqualifying' ? 'negative' : kw.signal === 'strong_positive' ? 'positive' : 'review_flag',
        weight: kw.count, source: 'keyword', productLines: [], required: false,
      })
    }
    for (const trait of insights.commonTraits.slice(0, 3)) {
      if (trait.startsWith('Add more')) continue
      generated.push({
        id: uid(), name: `Trait: ${trait.slice(0, 40)}`, description: trait,
        ruleType: 'positive', weight: 7, source: 'learned', productLines: [], required: false,
      })
    }
    for (const trait of insights.negativeTraits.slice(0, 2)) {
      if (trait.startsWith('Add more')) continue
      generated.push({
        id: uid(), name: `Risk: ${trait.slice(0, 40)}`, description: trait,
        ruleType: 'negative', weight: 5, source: 'learned', productLines: [], required: false,
      })
    }
    const newKeyword = generated.filter(c => c.source === 'keyword')
    const newLearned = generated.filter(c => c.source === 'learned')
    updateModel({
      keywordCriteria: [...model.keywordCriteria, ...newKeyword],
      learnedCriteria: [...model.learnedCriteria, ...newLearned],
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Criteria Builder</h1>
          <p className="text-sm text-[#52525B] mt-1">{model.manualCriteria.length + model.learnedCriteria.length + model.keywordCriteria.length} total criteria configured</p>
        </div>
        {insights && (
          <button onClick={generateFromInsights} className="h-9 px-4 rounded-lg border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm font-medium flex items-center gap-2 hover:bg-[#8B5CF6]/10">
            <Sparkles size={14} /> Generate from Insights
          </button>
        )}
      </div>

      {/* Mode selector */}
      <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Criteria Mode</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['manual', 'learned', 'blended'] as const).map(m => (
            <button key={m} onClick={() => handleModeChange(m)} className={`rounded-xl p-4 border text-left transition ${model.mode === m ? 'border-[#3B82F6] bg-[#3B82F6]/[0.05]' : 'border-white/[0.06] hover:border-white/[0.12]'}`}>
              <div className="text-sm font-medium text-[#F4F4F5] capitalize mb-1">{m === 'blended' ? 'Blended (Recommended)' : `${m} Only`}</div>
              <div className="text-xs text-[#52525B]">
                {m === 'manual' && 'You define all criteria manually'}
                {m === 'learned' && 'AI generates criteria from training data'}
                {m === 'blended' && 'Combine manual, learned, and keyword criteria'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {(['weights', 'manual', 'learned', 'keyword'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition capitalize ${tab === t ? 'border-[#3B82F6] text-[#F4F4F5]' : 'border-transparent text-[#52525B] hover:text-[#A1A1AA]'}`}>
            {t === 'weights' ? 'Weights & Bands' : `${t} (${allCriteria[t as keyof typeof allCriteria]?.length || 0})`}
          </button>
        ))}
      </div>

      {tab === 'weights' && (
        <div className="space-y-6">
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Source Group Weights</h2>
            <div className="space-y-4">
              {Object.entries(model.sourceWeights).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-2"><span className="text-[#A1A1AA] capitalize">{k}</span><span className="text-[#F4F4F5] font-semibold">{Math.round(v * 100)}%</span></div>
                  <input type="range" min="0" max="100" value={Math.round(v * 100)} onChange={e => handleWeightChange(k as 'manual' | 'learned' | 'keywords', parseInt(e.target.value))} className="w-full accent-[#3B82F6]" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Qualification Bands</h2>
            <div className="space-y-3">
              {model.qualBands.map(b => (
                <div key={b.band} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: b.color }} />
                  <span className="text-sm font-medium text-[#F4F4F5] w-40">{b.label}</span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={b.min} onChange={e => handleBandChange(b.band, 'min', parseInt(e.target.value) || 0)} className="w-16 h-8 px-2 rounded border border-white/[0.08] bg-white/[0.03] text-xs text-[#F4F4F5] text-center outline-none" />
                    <span className="text-xs text-[#52525B]">to</span>
                    <input type="number" value={b.max} onChange={e => handleBandChange(b.band, 'max', parseInt(e.target.value) || 0)} className="w-16 h-8 px-2 rounded border border-white/[0.08] bg-white/[0.03] text-xs text-[#F4F4F5] text-center outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
        <div className="space-y-4">
          {/* Add form */}
          {!adding ? (
            <button onClick={() => setAdding(true)} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2"><Plus size={14} /> Add Criterion</button>
          ) : (
            <div className="rounded-xl p-6 border border-[#3B82F6]/20 bg-[#3B82F6]/[0.03]">
              <h3 className="text-sm font-medium text-[#3B82F6] mb-4">New {tab} criterion</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#52525B] mb-1 block">Name *</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none" placeholder="e.g. Has 50+ employees" />
                </div>
                <div>
                  <label className="text-xs text-[#52525B] mb-1 block">Rule Type</label>
                  <select value={editRule} onChange={e => setEditRule(e.target.value as RuleType)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none">
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="hard_filter">Hard Filter</option>
                    <option value="review_flag">Review Flag</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[#52525B] mb-1 block">Description</label>
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none" placeholder="What does this criterion check?" />
                </div>
                <div>
                  <label className="text-xs text-[#52525B] mb-1 block">Weight (1-10)</label>
                  <input type="number" min={1} max={10} value={editWeight} onChange={e => setEditWeight(parseInt(e.target.value) || 5)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#52525B] mb-1 block">Product Lines (comma-separated)</label>
                  <input value={editProducts} onChange={e => setEditProducts(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none" placeholder="Cyber, D&O, E&O" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={editRequired} onChange={e => setEditRequired(e.target.checked)} className="accent-[#3B82F6]" />
                <span className="text-xs text-[#A1A1AA]">Required (hard filter)</span>
              </label>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddCriterion} disabled={!editName.trim()} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium disabled:opacity-40">Save</button>
                <button onClick={resetForm} className="h-9 px-4 rounded-lg border border-white/[0.08] text-[#A1A1AA] text-sm font-medium">Cancel</button>
              </div>
            </div>
          )}

          {/* Criteria list */}
          {allCriteria[tab].length === 0 && !adding && (
            <div className="rounded-xl p-8 border border-white/[0.06] bg-white/[0.02] text-center">
              <div className="text-sm text-[#A1A1AA] mb-1">No {tab} criteria yet</div>
              <div className="text-xs text-[#52525B]">Add criteria manually or generate from baseline insights</div>
            </div>
          )}

          <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            {allCriteria[tab].map(c => (
              <div key={c.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: ruleColors[c.ruleType], background: `${ruleColors[c.ruleType]}15` }}>{c.ruleType.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-[#F4F4F5]">{c.name}</span>
                    {c.required && <span className="text-[10px] text-[#EF4444] font-bold">REQUIRED</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#52525B]">Weight: <span className="text-[#F4F4F5] font-medium">{c.weight}</span></span>
                    <button onClick={() => handleDeleteCriterion(c.id, tab as 'manual' | 'learned' | 'keyword')} className="p-1 rounded hover:bg-[#EF4444]/10"><Trash2 size={14} className="text-[#52525B] hover:text-[#EF4444]" /></button>
                  </div>
                </div>
                {c.description && <p className="text-xs text-[#71717A] mb-2">{c.description}</p>}
                {c.productLines.length > 0 && (
                  <div className="flex gap-2">{c.productLines.map(p => <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-[#52525B]">{p}</span>)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
