import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function QualityReviewScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showQualityForm, setShowQualityForm] = useState<number | null>(null)
  const [qualityData, setQualityData] = useState({ quality_approved: true, quality_notes: '', reviewed_by: '' })

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
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
        setTimeout(() => {
          navigate(`/requirements/${id}/cost-analysis`)
        }, 2000)
      }
    },
  })

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const suppliersNeedingReview = requirement.suppliers?.filter((s: any) => 
    s.status === 'sample_received'
  ) || []

  const reviewedSuppliers = requirement.suppliers?.filter((s: any) => 
    s.status === 'quality_approved' || s.status === 'quality_rejected'
  ) || []

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/sampling`)}>
          ← Back to Sampling
        </button>
      </div>
      <WorkflowProgress currentStage="quality-review" />
      <div className="card">
        <h2>Step 7: Quality Team Analysis (Manual)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Review sample quality based on specifications, certifications, and performance metrics. Provide detailed feedback.
        </p>

        {suppliersNeedingReview.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3>Samples Awaiting Review ({suppliersNeedingReview.length})</h3>
            <div className="supplier-list">
              {suppliersNeedingReview.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{supplier.name}</h4>
                      <p>Status: Sample received, awaiting quality review</p>
                      {supplier.sample && (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0f0f0', borderRadius: '4px' }}>
                          <p><strong>Sample Details:</strong></p>
                          <p>Quantity: {supplier.sample.quantity} units</p>
                          <p>Price Quoted: ${supplier.sample.price_quoted?.toFixed(2)} (${supplier.sample.price_per_unit?.toFixed(2)}/unit)</p>
                          <p>Delivery Address: {supplier.sample.address}</p>
                          {supplier.quality_rating && (
                            <p>Supplier Quality Rating: {supplier.quality_rating}/5.0</p>
                          )}
                          {supplier.certifications && JSON.parse(supplier.certifications || '[]').length > 0 && (
                            <p>Certifications: {JSON.parse(supplier.certifications || '[]').join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {reviewedSuppliers.length > 0 && (
          <div>
            <h3>Reviewed Samples ({reviewedSuppliers.length})</h3>
            <div className="supplier-list">
              {reviewedSuppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge status-${supplier.status}`}>
                      {supplier.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            {reviewedSuppliers.some((s: any) => s.status === 'quality_approved') && (
              <div style={{ marginTop: '1.5rem' }}>
                <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/cost-analysis`)}>
                  Continue to Cost Analysis →
                </button>
              </div>
            )}
          </div>
        )}

        {suppliersNeedingReview.length === 0 && reviewedSuppliers.length === 0 && (
          <div>
            <p>No samples to review at this time.</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/sampling`)}>
              ← Back to Sampling
            </button>
          </div>
        )}
      </div>

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
            <h3>Quality Review</h3>
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

export default QualityReviewScreen

