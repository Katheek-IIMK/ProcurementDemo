import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import RequirementDetail from './pages/RequirementDetail'
import CreateRequirement from './pages/CreateRequirement'
import ScoutingScreen from './pages/ScoutingScreen'
import SupplierSelectionScreen from './pages/SupplierSelectionScreen'
import OutreachScreen from './pages/OutreachScreen'
import SamplingScreen from './pages/SamplingScreen'
import QualityReviewScreen from './pages/QualityReviewScreen'
import CostAnalysisScreen from './pages/CostAnalysisScreen'
import ShortlistScreen from './pages/ShortlistScreen'
import OnboardingScreen from './pages/OnboardingScreen'
import AppErrorBoundary from './components/AppErrorBoundary'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <header className="app-header">
            <h1>Procurement Demo - Fully Autonomous Sourcing Agent</h1>
            <p>Multi-Agent AI System for Automated Procurement Lifecycle</p>
          </header>
          <AppErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requirements/new" element={<CreateRequirement />} />
              <Route path="/requirements/:id" element={<RequirementDetail />} />
              <Route path="/requirements/:id/scouting" element={<ScoutingScreen />} />
              <Route path="/requirements/:id/supplier-selection" element={<SupplierSelectionScreen />} />
              <Route path="/requirements/:id/outreach" element={<OutreachScreen />} />
              <Route path="/requirements/:id/sampling" element={<SamplingScreen />} />
              <Route path="/requirements/:id/quality-review" element={<QualityReviewScreen />} />
              <Route path="/requirements/:id/cost-analysis" element={<CostAnalysisScreen />} />
              <Route path="/requirements/:id/shortlist" element={<ShortlistScreen />} />
              <Route path="/requirements/:id/onboarding" element={<OnboardingScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppErrorBoundary>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App

