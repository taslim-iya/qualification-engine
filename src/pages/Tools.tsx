import { useAppStore } from '@/stores/appStore'
import { RESEARCH_SYSTEM_PROMPT } from '@/lib/aiPrompts'
import { Wrench, CheckCircle, XCircle, Code } from 'lucide-react'
import { useState } from 'react'

export default function Tools() {
  const { tools } = useAppStore()
  const [showPrompt, setShowPrompt] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">Intelligence Tools</h1>
        <p className="text-sm text-[#52525B] mt-1">Manage connected data sources and the AI research pipeline</p>
      </div>

      {/* Tool Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {tools.map(t => (
          <div key={t.id} className={`rounded-xl p-5 border transition ${t.enabled ? 'border-white/[0.06] bg-white/[0.02]' : 'border-white/[0.04] bg-white/[0.01] opacity-60'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${t.enabled ? 'border-[#10B981]/30 bg-[#10B981]/10' : 'border-white/[0.08] bg-white/[0.03]'}`}>
                  <Wrench size={14} className={t.enabled ? 'text-[#10B981]' : 'text-[#3F3F46]'} />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#F4F4F5]">{t.name}</div>
                  <div className="text-[10px] text-[#52525B] font-mono">{t.type}</div>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer ${t.enabled ? 'bg-[#10B981]' : 'bg-white/[0.1]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${t.enabled ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
            <p className="text-xs text-[#71717A] mb-3">{t.description}</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#3F3F46]">Last used: {t.lastUsed}</span>
              {t.enabled && <span className="text-[#10B981]">{t.successRate}% success rate</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Tool */}
      <div className="rounded-xl p-6 border-2 border-dashed border-white/[0.08] text-center hover:border-[#3B82F6]/30 transition cursor-pointer">
        <Wrench size={24} className="mx-auto mb-2 text-[#3F3F46]" />
        <div className="text-sm font-medium text-[#A1A1AA] mb-1">Add New Tool</div>
        <div className="text-xs text-[#3F3F46]">Connect a new API, enrichment service, or data source</div>
      </div>

      {/* Pipeline Status */}
      <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Research Pipeline</h2>
        <div className="space-y-3">
          {[
            { step: '1. Resolve Company Identity', desc: 'Normalize name, find domain & LinkedIn', status: 'active' },
            { step: '2. Gather Data from Sources', desc: 'Call all enabled tools in priority order', status: 'active' },
            { step: '3. AI Extraction & Normalization', desc: 'Extract structured profile using AI synthesis', status: 'active' },
            { step: '4. Keyword & Theme Extraction', desc: 'Pull keywords, classify signals, cluster themes', status: 'active' },
            { step: '5. Profile Synthesis', desc: 'Merge all data into structured company profile', status: 'active' },
            { step: '6. Scoring', desc: 'Apply active criteria model', status: 'active' },
            { step: '7. Explanation Generation', desc: 'Generate human-readable rationale', status: 'active' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
              <CheckCircle size={14} className="text-[#10B981]" />
              <div className="flex-1">
                <div className="text-sm text-[#F4F4F5]">{s.step}</div>
                <div className="text-xs text-[#52525B]">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI System Prompt */}
      <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#A1A1AA]">AI System Prompt</h2>
          <button onClick={() => setShowPrompt(!showPrompt)} className="text-xs text-[#3B82F6] flex items-center gap-1"><Code size={12} /> {showPrompt ? 'Hide' : 'View'}</button>
        </div>
        {showPrompt && (
          <pre className="text-xs text-[#71717A] leading-relaxed whitespace-pre-wrap p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] max-h-[400px] overflow-y-auto font-mono">
            {RESEARCH_SYSTEM_PROMPT}
          </pre>
        )}
        {!showPrompt && (
          <p className="text-xs text-[#52525B]">The system prompt defines how the AI researches, extracts insights, and scores companies. Click "View" to inspect or modify.</p>
        )}
      </div>
    </div>
  )
}
