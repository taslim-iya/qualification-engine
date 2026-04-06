import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/pages/Dashboard'
import Training from '@/pages/Training'
import Insights from '@/pages/Insights'
import Research from '@/pages/Research'
import Criteria from '@/pages/Criteria'
import Scoring from '@/pages/Scoring'
import CompanyDetail from '@/pages/CompanyDetail'
import Tools from '@/pages/Tools'
import APIKeys from '@/pages/APIKeys'

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        <div className="max-w-[1200px]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/training" element={<Training />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/research" element={<Research />} />
            <Route path="/criteria" element={<Criteria />} />
            <Route path="/scoring" element={<Scoring />} />
            <Route path="/company/:id" element={<CompanyDetail />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/api-keys" element={<APIKeys />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
