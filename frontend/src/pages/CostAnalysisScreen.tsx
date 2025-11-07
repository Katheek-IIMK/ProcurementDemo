import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function CostAnalysisScreen() {
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

  const analyzedSuppliers = requirement.suppliers?.filter((s: any) => 
    s.status === 'cost_analyzed' || s.status === 'shortlisted'
  ) || []

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/quality-review`)}>
          ← Back to Quality Review
        </button>
      </div>
      <WorkflowProgress currentStage="cost-analysis" />
      <div className="card">
        <h2>Step 8-10: Cost Analysis & Negotiation (GenAI & Agentic AI)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Cost analysis has been performed automatically. Negotiation was triggered if savings didn't meet expectations.
        </p>

        {analyzedSuppliers.length > 0 ? (
          <div>
            <h3>Cost Analysis Results ({analyzedSuppliers.length})</h3>
            <div className="supplier-list">
              {analyzedSuppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  {supplier.cost_analysis && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0f0f0', borderRadius: '4px' }}>
                      <p><strong>Total Cost:</strong> ${supplier.cost_analysis.total_cost?.toFixed(2)}</p>
                      <p><strong>Savings:</strong> ${supplier.cost_analysis.savings?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(2)}%)</p>
                      <p>
                        <strong>Meets Expectations:</strong>{' '}
                        {supplier.cost_analysis.meets_expectations ? '✓ Yes' : '✗ No'}
                      </p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`status-badge status-${supplier.status}`}>
                          {supplier.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {/* Show negotiation iterations if available */}
                  {supplier.negotiation_iterations && supplier.negotiation_iterations.length > 0 && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff3cd', borderRadius: '4px' }}>
                      <h5 style={{ marginBottom: '0.5rem' }}>Negotiation Iterations ({supplier.negotiation_iterations.length})</h5>
                      {supplier.negotiation_iterations.map((iteration: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: '0.75rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                          <p><strong>Iteration {iteration.iteration}:</strong></p>
                          <p>Proposed Cost: ${iteration.proposed_cost?.toFixed(2)}</p>
                          <p>Target Cost: ${iteration.target_cost?.toFixed(2)}</p>
                          <p>Outcome: <span className={`status-badge status-${iteration.outcome}`}>{iteration.outcome.replace('_', ' ')}</span></p>
                          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>{iteration.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {requirement.status === 'shortlisted' && (
              <div style={{ marginTop: '1.5rem' }}>
                <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/shortlist`)}>
                  View Supplier Shortlist →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>Cost analysis in progress or no suppliers available for analysis.</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/quality-review`)}>
              ← Back to Quality Review
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CostAnalysisScreen

