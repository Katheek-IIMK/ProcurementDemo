import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function ShortlistScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
    },
  })

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const shortlistedSuppliers = requirement.suppliers?.filter((s: any) => 
    s.status === 'shortlisted'
  ) || []

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/cost-analysis`)}>
          ← Back to Cost Analysis
        </button>
      </div>
      <WorkflowProgress currentStage="shortlist" />
      <div className="card">
        <h2>Step 11: AI-Curated Supplier Shortlist (GenAI)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Suppliers have been ranked and shortlisted based on integrated cost & quality analysis.
        </p>

        {requirement.status === 'shortlisted' && shortlistedSuppliers.length > 0 ? (
          <div>
            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p><strong>✓ Shortlist Created Automatically</strong></p>
              <p>Suppliers ranked by integrated score (cost + quality)</p>
            </div>

            <h3>Shortlisted Suppliers ({shortlistedSuppliers.length})</h3>
            <div className="supplier-list">
              {shortlistedSuppliers.map((supplier: any, index: number) => (
                <div key={supplier.id} className="supplier-card" style={{ borderLeft: '4px solid #667eea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>#{index + 1} - {supplier.name}</h4>
                      {supplier.cost_analysis && (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0f0f0', borderRadius: '4px' }}>
                          <p><strong>Total Cost:</strong> ${supplier.cost_analysis.total_cost?.toFixed(2)}</p>
                          <p><strong>Savings:</strong> ${supplier.cost_analysis.savings?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(2)}%)</p>
                          <p><strong>Quality:</strong> {supplier.sample?.quality_approved ? '✓ Approved' : 'Pending'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/onboarding`)}>
                Continue to Onboarding →
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>Shortlist is being generated automatically. Please wait...</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/cost-analysis`)}>
              ← Back to Cost Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShortlistScreen

