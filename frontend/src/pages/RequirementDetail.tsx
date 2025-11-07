import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import '../App.css'

function RequirementDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isDevMode = import.meta.env.MODE === 'development'
  const [showSampleForm, setShowSampleForm] = useState<number | null>(null)
  const [showQualityForm, setShowQualityForm] = useState<number | null>(null)
  const [sampleData, setSampleData] = useState({ quantity: '', address: '', price_quoted: '' })
  const [qualityData, setQualityData] = useState({ quality_approved: true, quality_notes: '', reviewed_by: '' })

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
    },
  })

  const scoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/requirements/${id}/scout`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirement', id] })
      if (data.auto_contacted > 0) {
        // Show message that workflow continued automatically
        setTimeout(() => {
          alert(`Scouting complete! ${data.auto_contacted} suppliers automatically contacted and sampling requested.`)
        }, 500)
      }
    },
  })

  const createSampleMutation = useMutation({
    mutationFn: async (data: { supplier_id: number; quantity: number; address: string; price_quoted: number }) => {
      const response = await apiClient.post('/samples', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirement', id] })
      setShowSampleForm(null)
      setSampleData({ quantity: '', address: '', price_quoted: '' })
    },
  })

  const qualityReviewMutation = useMutation({
    mutationFn: async (data: { sample_id: number; quality_approved: boolean; quality_notes: string; reviewed_by: string }) => {
      const response = await apiClient.post(`/samples/${data.sample_id}/quality-review`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirement', id] })
      setShowQualityForm(null)
      setQualityData({ quality_approved: true, quality_notes: '', reviewed_by: '' })
      if (data.auto_analyzed) {
        // Show message that workflow continued automatically
        setTimeout(() => {
          alert('Quality approved! Cost analysis and negotiation (if needed) completed automatically. Check the supplier status.')
        }, 500)
      }
    },
  })

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const canScout = requirement.status === 'scouting' || requirement.status === 'draft'
  const canCreateShortlist = requirement.suppliers?.some(
    (s: any) => s.status === 'cost_analyzed' || s.status === 'shortlisted'
  )

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
           Back to Dashboard
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2>{requirement.title}</h2>
            <span className={`status-badge status-${requirement.status}`}>
              {requirement.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <p style={{ marginBottom: '1.5rem', color: '#666' }}>{requirement.description}</p>

        {canScout && (
          <div className="workflow-step">
            <h4>Step 2: Scouting Agent (Agentic AI)</h4>
            <p>Source qualified suppliers by sending customized emails</p>
            <button
              className="btn"
              onClick={() => scoutMutation.mutate()}
              disabled={scoutMutation.isPending}
            >
              {scoutMutation.isPending ? 'Scouting...' : 'Start Scouting'}
            </button>
          </div>
        )}

        {requirement.suppliers && requirement.suppliers.length > 0 && (
          <div className="card">
            <h3>Suppliers</h3>
            <div className="supplier-list">
              {requirement.suppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{supplier.name}</h4>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`status-badge status-${supplier.status}`}>
                          {supplier.status.replace('_', ' ')}
                        </span>
                      </p>
                      {supplier.availability_scope !== null && (
                        <p>
                          <strong>Availability Scope:</strong>{' '}
                          {supplier.availability_scope ? '✓ Available' : '✗ Not Available'}
                        </p>
                      )}
                      {supplier.cost_analysis && (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0f0f0', borderRadius: '4px' }}>
                          <p><strong>Total Cost:</strong> ${supplier.cost_analysis.total_cost?.toFixed(2)}</p>
                          <p><strong>Savings:</strong> ${supplier.cost_analysis.savings?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(2)}%)</p>
                          <p>
                            <strong>Meets Expectations:</strong>{' '}
                            {supplier.cost_analysis.meets_expectations ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Debug info - remove in production */}
                      {isDevMode && (
                        <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                          Debug: status={supplier.status}, availability={String(supplier.availability_scope)}
                        </div>
                      )}
                      {supplier.status === 'contacted' && supplier.availability_scope && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
                            ⚠️ This supplier should have been auto-contacted. If you see this, please refresh the page.
                          </p>
                        </div>
                      )}
                      {supplier.status === 'contacted' && !supplier.availability_scope && (
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                          Supplier does not meet availability scope
                        </p>
                      )}
                      {supplier.status === 'responded' && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
                            ⚠️ Sampling should have been auto-requested. If you see this, please refresh the page.
                          </p>
                        </div>
                      )}
                      {supplier.status === 'sample_requested' && (
                        <div>
                          <button
                            className="btn"
                            onClick={() => setShowSampleForm(supplier.id)}
                          >
                            Record Sample Received
                          </button>
                        </div>
                      )}
                      {supplier.status === 'sample_received' && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                            Sample received. Awaiting quality review.
                          </p>
                          <button
                            className="btn btn-success"
                            onClick={() => {
                              const sampleId = supplier.sample?.id
                              if (sampleId) {
                                setShowQualityForm(sampleId)
                              }
                            }}
                          >
                            Review Quality
                          </button>
                        </div>
                      )}
                      {supplier.status === 'quality_approved' && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
                            ⚠️ Cost analysis should run automatically after quality approval. If you see this, please refresh the page.
                          </p>
                        </div>
                      )}
                      {supplier.status === 'cost_analyzed' && !supplier.cost_analysis?.meets_expectations && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>
                            ⚠️ Negotiation should run automatically if savings don't meet expectations. If you see this, please refresh the page.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {canCreateShortlist && requirement.status !== 'shortlisted' && (
          <div className="workflow-step">
            <h4>Step 11: AI-Curated Supplier Shortlist (GenAI)</h4>
            <p>Shortlist created automatically after cost analysis. Refresh to see results.</p>
          </div>
        )}
        {requirement.status === 'shortlisted' && (
          <div className="workflow-step">
            <h4>✓ Step 11: AI-Curated Supplier Shortlist Complete</h4>
            <p>Suppliers have been ranked and shortlisted automatically.</p>
          </div>
        )}
      </div>

      {/* Sample Creation Form Modal */}
      {showSampleForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>Step 6: Record Sample Received (Manual)</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              createSampleMutation.mutate({
                supplier_id: showSampleForm,
                quantity: parseFloat(sampleData.quantity),
                address: sampleData.address,
                price_quoted: parseFloat(sampleData.price_quoted)
              })
            }}>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sampleData.quantity}
                  onChange={(e) => setSampleData({ ...sampleData, quantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={sampleData.address}
                  onChange={(e) => setSampleData({ ...sampleData, address: e.target.value })}
                  placeholder="Enter delivery address"
                />
              </div>
              <div className="form-group">
                <label>Price Quoted *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sampleData.price_quoted}
                  onChange={(e) => setSampleData({ ...sampleData, price_quoted: e.target.value })}
                  placeholder="Enter price"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" disabled={createSampleMutation.isPending}>
                  {createSampleMutation.isPending ? 'Saving...' : 'Save Sample'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowSampleForm(null)
                  setSampleData({ quantity: '', address: '', price_quoted: '' })
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quality Review Form Modal */}
      {showQualityForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>Step 7: Quality Team Analysis (Manual)</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              qualityReviewMutation.mutate({
                sample_id: showQualityForm,
                quality_approved: qualityData.quality_approved,
                quality_notes: qualityData.quality_notes,
                reviewed_by: qualityData.reviewed_by
              })
            }}>
              <div className="form-group">
                <label>Quality Approved *</label>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                    <input
                      type="radio"
                      checked={qualityData.quality_approved === true}
                      onChange={() => setQualityData({ ...qualityData, quality_approved: true })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Approved
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      checked={qualityData.quality_approved === false}
                      onChange={() => setQualityData({ ...qualityData, quality_approved: false })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Rejected
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Quality Notes *</label>
                <textarea
                  required
                  value={qualityData.quality_notes}
                  onChange={(e) => setQualityData({ ...qualityData, quality_notes: e.target.value })}
                  placeholder="Enter quality review notes..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Reviewed By *</label>
                <input
                  type="text"
                  required
                  value={qualityData.reviewed_by}
                  onChange={(e) => setQualityData({ ...qualityData, reviewed_by: e.target.value })}
                  placeholder="Enter reviewer name"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" disabled={qualityReviewMutation.isPending}>
                  {qualityReviewMutation.isPending ? 'Saving...' : 'Submit Review'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowQualityForm(null)
                  setQualityData({ quality_approved: true, quality_notes: '', reviewed_by: '' })
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequirementDetail

