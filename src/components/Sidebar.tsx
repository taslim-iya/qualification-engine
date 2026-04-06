import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Lightbulb, Search, SlidersHorizontal, Target, Shield } from 'lucide-react'

const sections = [
  { label: '', items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }] },
  { label: 'Setup', items: [
    { to: '/training', icon: Upload, label: 'Training Set' },
    { to: '/insights', icon: Lightbulb, label: 'Baseline Insights' },
    { to: '/criteria', icon: SlidersHorizontal, label: 'Criteria Builder' },
  ]},
  { label: 'Qualify', items: [
    { to: '/research', icon: Search, label: 'Company Research' },
    { to: '/scoring', icon: Target, label: 'Score Companies' },
  ]},
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col border-r border-white/[0.06] bg-[#0A0A0F]">
      <div className="h-16 px-5 flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#3B82F6]">
          <Shield size={14} className="text-white" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-[#F4F4F5]">QualEngine</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((s, i) => (
          <div key={i} className={i > 0 ? 'mt-6' : ''}>
            {s.label && <div className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-[#3F3F46]">{s.label}</div>}
            <div className="space-y-0.5">
              {s.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] font-medium transition-colors ${isActive ? 'bg-white/[0.08] text-[#F4F4F5]' : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/[0.04]'}`}>
                  <item.icon size={16} /><span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="text-[11px] text-[#3F3F46]">Model: Q1 2026 v1</div>
        <div className="text-[11px] text-[#3F3F46]">8 companies · 3 scored</div>
      </div>
    </aside>
  )
}
