import { useAppStore } from '@/stores/appStore'
import { useState } from 'react'
import { Key, Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', desc: 'GPT-4o, GPT-4 Turbo', placeholder: 'sk-...' },
  { value: 'anthropic', label: 'Anthropic', desc: 'Claude Sonnet, Opus', placeholder: 'sk-ant-...' },
  { value: 'google', label: 'Google AI', desc: 'Gemini Pro, Flash', placeholder: 'AIza...' },
  { value: 'perplexity', label: 'Perplexity', desc: 'Sonar search API', placeholder: 'pplx-...' },
  { value: 'serper', label: 'Serper', desc: 'Google Search API', placeholder: '' },
  { value: 'clearbit', label: 'Clearbit', desc: 'Company enrichment', placeholder: 'sk_...' },
  { value: 'zoominfo', label: 'ZoomInfo', desc: 'B2B intelligence', placeholder: '' },
  { value: 'hubspot', label: 'HubSpot', desc: 'CRM integration', placeholder: 'pat-...' },
  { value: 'salesforce', label: 'Salesforce', desc: 'CRM integration', placeholder: '' },
  { value: 'custom', label: 'Custom API', desc: 'Any other service', placeholder: '' },
]

const statusIcons: Record<string, typeof CheckCircle> = { active: CheckCircle, invalid: AlertCircle, untested: AlertCircle }
const statusColors: Record<string, string> = { active: '#10B981', invalid: '#EF4444', untested: '#F59E0B' }

export default function APIKeys() {
  const { apiKeys, addAPIKey, removeAPIKey } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [provider, setProvider] = useState('openai')
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const handleAdd = () => {
    if (!key.trim()) return
    addAPIKey({ provider, label: label || PROVIDERS.find(p => p.value === provider)?.label || provider, key: key.trim() })
    setKey('')
    setLabel('')
    setShowAdd(false)
  }

  const toggleVisible = (id: string) => {
    const next = new Set(visibleKeys)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setVisibleKeys(next)
  }

  const maskKey = (k: string) => k.slice(0, 8) + '•'.repeat(Math.max(0, k.length - 12)) + k.slice(-4)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">API Keys</h1>
        <p className="text-sm text-[#52525B] mt-1">Manage API keys for AI providers and data sources</p>
      </div>

      {/* Info */}
      <div className="rounded-xl p-4 border border-[#F59E0B]/20 bg-[#F59E0B]/[0.03]">
        <p className="text-xs text-[#F59E0B] leading-relaxed">
          ⚠️ API keys are stored in your browser's local storage. They never leave your device. For production use, move to a secure backend vault.
        </p>
      </div>

      {/* Existing Keys */}
      {apiKeys.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
          {apiKeys.map(k => {
            const Icon = statusIcons[k.status]
            const color = statusColors[k.status]
            return (
              <div key={k.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.03]">
                  <Key size={16} className="text-[#71717A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#F4F4F5]">{k.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#52525B]">{k.provider}</span>
                    <Icon size={12} style={{ color }} />
                    <span className="text-[10px]" style={{ color }}>{k.status}</span>
                  </div>
                  <div className="text-xs text-[#3F3F46] font-mono mt-0.5">
                    {visibleKeys.has(k.id) ? k.key : maskKey(k.key)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleVisible(k.id)} className="p-1.5 rounded hover:bg-white/[0.05]">
                    {visibleKeys.has(k.id) ? <EyeOff size={14} className="text-[#52525B]" /> : <Eye size={14} className="text-[#52525B]" />}
                  </button>
                  <button onClick={() => removeAPIKey(k.id)} className="p-1.5 rounded hover:bg-[#EF4444]/10">
                    <Trash2 size={14} className="text-[#EF4444]" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {apiKeys.length === 0 && !showAdd && (
        <div className="rounded-xl p-8 border border-white/[0.06] bg-white/[0.02] text-center">
          <Key size={32} className="mx-auto mb-3 text-[#3F3F46]" />
          <div className="text-sm font-medium text-[#A1A1AA] mb-1">No API keys configured</div>
          <div className="text-xs text-[#52525B] mb-4">Add at least one AI provider key to enable company research</div>
        </div>
      )}

      {/* Add Key */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="h-10 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add API Key
        </button>
      ) : (
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Add New API Key</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#52525B] mb-1.5 block">Provider</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {PROVIDERS.map(p => (
                  <button key={p.value} onClick={() => setProvider(p.value)}
                    className={`rounded-lg p-2.5 border text-left transition ${provider === p.value ? 'border-[#3B82F6] bg-[#3B82F6]/[0.05]' : 'border-white/[0.06] hover:border-white/[0.12]'}`}>
                    <div className="text-xs font-medium text-[#F4F4F5]">{p.label}</div>
                    <div className="text-[10px] text-[#52525B]">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#52525B] mb-1.5 block">Label (optional)</label>
                <input value={label} onChange={e => setLabel(e.target.value)} placeholder={PROVIDERS.find(p => p.value === provider)?.label || 'My key'}
                  className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46]" />
              </div>
              <div>
                <label className="text-xs text-[#52525B] mb-1.5 block">API Key</label>
                <input value={key} onChange={e => setKey(e.target.value)} type="password"
                  placeholder={PROVIDERS.find(p => p.value === provider)?.placeholder || 'Enter API key'}
                  className="w-full h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[#F4F4F5] outline-none focus:border-[#3B82F6]/50 placeholder-[#3F3F46] font-mono" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={!key.trim()} className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium disabled:opacity-40">Save Key</button>
              <button onClick={() => { setShowAdd(false); setKey('') }} className="h-9 px-4 rounded-lg border border-white/[0.08] text-[#A1A1AA] text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Quick Links */}
      <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
        <h2 className="text-sm font-medium text-[#A1A1AA] mb-4">Get API Keys</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { name: 'OpenAI', url: 'https://platform.openai.com/api-keys' },
            { name: 'Anthropic', url: 'https://console.anthropic.com/settings/keys' },
            { name: 'Google AI', url: 'https://aistudio.google.com/apikey' },
            { name: 'Perplexity', url: 'https://docs.perplexity.ai' },
            { name: 'Serper', url: 'https://serper.dev' },
            { name: 'Clearbit', url: 'https://dashboard.clearbit.com/api' },
          ].map(l => (
            <a key={l.name} href={l.url} target="_blank" rel="noopener" className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition">
              <span className="text-sm text-[#A1A1AA]">{l.name}</span>
              <span className="text-xs text-[#3B82F6]">{l.url.replace('https://', '').split('/')[0]} →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
