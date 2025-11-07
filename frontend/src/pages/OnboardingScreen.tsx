import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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

  const onboardingSuppliers = useMemo(() => {
    if (!requirement?.suppliers) return []
    return requirement.suppliers.filter((s: any) => (s.notes || '').includes('Onboarding initiated'))
  }, [requirement?.suppliers])

  const selectedSupplier = useMemo(() => {
    if (onboardingSuppliers.length > 0) return onboardingSuppliers[0]
    if (!requirement?.suppliers) return null
    return requirement.suppliers.find((s: any) => s.status === 'shortlisted') || null
  }, [onboardingSuppliers, requirement?.suppliers])

  const formatNumber = (value: number | null | undefined, digits = 1) =>
    typeof value === 'number' ? value.toFixed(digits) : '—'

  if (isLoading) return <div className="loading">Loading onboarding status...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/shortlist`)}> Back to Shortlist</button>
      </div>
      <WorkflowProgress currentStage="onboarding" />
      <div className="card">
        <h2>Step 12: Onboarding & SRM Readiness</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Approved suppliers transition into onboarding once confirmed. AI captures each step's context to streamline hand-off to SRM teams.
        </p>

        {selectedSupplier && (
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '8px', background: '#eef2ff' }}>
            <h3 style={{ marginBottom: '1rem' }}>Executive Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Requirement Overview</h4>
                <p><strong>Title:</strong> {requirement.title}</p>
                <p><strong>Category:</strong> {requirement.category}</p>
                <p><strong>Demand:</strong> {requirement.quantity} {requirement.unit}</p>
                {requirement.required_certifications?.length > 0 && (
                  <p><strong>Certifications Needed:</strong> {requirement.required_certifications.join(', ')}</p>
                )}
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Selected Supplier</h4>
                <p><strong>Name:</strong> {selectedSupplier.name}</p>
                <p><strong>Overall Score:</strong> {formatNumber(selectedSupplier.overall_score)}</p>
                <p><strong>Quality Rating:</strong> {formatNumber(selectedSupplier.quality_rating)} / 5</p>
                <p><strong>Delivery Reliability:</strong> {formatNumber(selectedSupplier.delivery_reliability)}%</p>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Quality Review</h4>
                {selectedSupplier.sample ? (
                  <>
                    <p><strong>Status:</strong> {selectedSupplier.sample.quality_approved ? 'Approved' : 'Pending'}</p>
                    <p><strong>Reviewer:</strong> {selectedSupplier.sample.quality_reviewed_by ?? '—'}</p>
                    {selectedSupplier.sample.quality_notes && (
                      <p><strong>Notes:</strong> {selectedSupplier.sample.quality_notes}</p>
                    )}
                  </>
                ) : (
                  <p>No quality review recorded.</p>
                )}
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Commercials & Negotiation</h4>
                {selectedSupplier.cost_analysis ? (
                  <>
                    <p><strong>Final Cost:</strong> ${selectedSupplier.cost_analysis.total_cost != null ? selectedSupplier.cost_analysis.total_cost.toFixed(2) : '—'}</p>
                    <p><strong>Savings:</strong> ${selectedSupplier.cost_analysis.savings != null ? selectedSupplier.cost_analysis.savings.toFixed(2) : '—'} ({selectedSupplier.cost_analysis.savings_percentage != null ? selectedSupplier.cost_analysis.savings_percentage.toFixed(1) : '—'}%)</p>
                    <p><strong>Negotiation Rounds:</strong> {selectedSupplier.negotiation_iterations?.length ?? 0}</p>
                  </>
                ) : (
                  <p>Cost analysis pending.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {onboardingSuppliers.length > 0 ? (
          <div>
            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#0f5132' }}>
              <p><strong> Onboarding Initiated</strong></p>
              <p>AI has generated recommended onboarding actions and governance notes for the selected suppliers.</p>
            </div>

            <div className="supplier-list">
              {onboardingSuppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{supplier.name}</h4>
                      <p><strong>Status:</strong> <span className={`status-badge status-${supplier.status}`}>{supplier.status?.replace('_', ' ')}</span></p>
                      {supplier.cost_analysis && (
                        <p style={{ marginTop: '0.5rem' }}>
                          <strong>Negotiated Cost:</strong> ${supplier.cost_analysis.total_cost?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(1)}% savings)
                        </p>
                      )}
                      {supplier.notes && (
                        <p style={{ marginTop: '0.5rem', color: '#495057' }}>
                          <strong>AI Notes:</strong> {supplier.notes}
                        </p>
                      )}
                    </div>
                    {supplier.certifications?.length > 0 && (
                      <div style={{ minWidth: '180px' }}>
                        <h5>Key Certifications</h5>
                        <ul style={{ paddingLeft: '1.25rem' }}>
                          {supplier.certifications.map((cert: string) => (
                            <li key={cert}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right', color: '#0f5132' }}>
              Next actions: share onboarding pack, schedule kickoff, and hand over to SRM owner.
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff4e5', padding: '1rem', borderRadius: '8px', color: '#7a4d0f' }}>
            <p>No suppliers are ready for onboarding yet. Complete the shortlist stage to continue.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate(`/requirements/${id}/shortlist`)}>
               Back to Shortlist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingScreen
