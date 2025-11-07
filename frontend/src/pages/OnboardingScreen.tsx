import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function OnboardingScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
    },
  })

  const onboardMutation = useMutation({
    mutationFn: async (supplierId: number) => {
      const response = await apiClient.post(`/suppliers/${supplierId}/onboard`)
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
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/shortlist`)}>
          ← Back to Shortlist
        </button>
      </div>
      <WorkflowProgress currentStage="onboarding" />
      <div className="card">
        <h2>Step 12: On-boarding and SRM Analysis (GenAI)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Initiate supplier onboarding and generate SRM (Supplier Relationship Management) analysis.
        </p>

        {shortlistedSuppliers.length > 0 ? (
          <div>
            <h3>Shortlisted Suppliers Ready for Onboarding ({shortlistedSuppliers.length})</h3>
            <div className="supplier-list">
              {shortlistedSuppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{supplier.name}</h4>
                      {supplier.cost_analysis && (
                        <p>Savings: ${supplier.cost_analysis.savings?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(2)}%)</p>
                      )}
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={() => onboardMutation.mutate(supplier.id)}
                      disabled={onboardMutation.isPending}
                    >
                      {onboardMutation.isPending ? 'Initiating...' : 'Start Onboarding'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {requirement.status === 'onboarding' && (
              <div style={{ marginTop: '1.5rem', background: '#d4edda', padding: '1rem', borderRadius: '8px' }}>
                <p><strong>✓ Onboarding Initiated</strong></p>
                <p>SRM analysis and onboarding plans have been generated automatically.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>No suppliers available for onboarding. Please ensure suppliers are shortlisted first.</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/shortlist`)}>
              ← Back to Shortlist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingScreen

