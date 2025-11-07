import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function SupplierSelectionScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([])

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
    },
  })

  const selectMutation = useMutation({
    mutationFn: async (supplierIds: number[]) => {
      const response = await apiClient.post(`/requirements/${id}/select-suppliers`, {
        supplier_ids: supplierIds
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['requirement', id] })
      setTimeout(() => {
        navigate(`/requirements/${id}/outreach`)
      }, 1500)
    },
  })

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const availableSuppliers = requirement.suppliers?.filter((s: any) => 
    s.availability_scope && s.status === 'discovered'
  ) || []

  // Sort by overall score
  const sortedSuppliers = [...availableSuppliers].sort((a: any, b: any) => 
    (b.overall_score || 0) - (a.overall_score || 0)
  )

  const toggleSupplier = (supplierId: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745'
    if (score >= 60) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/scouting`)}>
          ← Back to Scouting
        </button>
      </div>
      <WorkflowProgress currentStage="supplier-selection" />
      <div className="card">
        <h2>Step 3: Select Suppliers for Outreach</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Review supplier metrics and select the best suppliers for outreach. Metrics are calculated based on experience, quality rating, delivery reliability, and price competitiveness.
        </p>

        {sortedSuppliers.length > 0 ? (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p><strong>Select suppliers:</strong> {selectedSuppliers.length} of {sortedSuppliers.length} selected</p>
              <button
                className="btn"
                onClick={() => {
                  if (selectedSuppliers.length === sortedSuppliers.length) {
                    setSelectedSuppliers([])
                  } else {
                    setSelectedSuppliers(sortedSuppliers.map((s: any) => s.id))
                  }
                }}
              >
                {selectedSuppliers.length === sortedSuppliers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="supplier-list">
              {sortedSuppliers.map((supplier: any) => (
                <div 
                  key={supplier.id} 
                  className="supplier-card"
                  style={{
                    border: selectedSuppliers.includes(supplier.id) ? '2px solid #667eea' : '1px solid #ddd',
                    background: selectedSuppliers.includes(supplier.id) ? '#f0f7ff' : '#f9f9f9',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleSupplier(supplier.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={() => toggleSupplier(supplier.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <h4 style={{ margin: 0 }}>{supplier.name}</h4>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: getScoreColor(supplier.overall_score || 0),
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          Score: {supplier.overall_score?.toFixed(1) || 'N/A'}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                          <strong>Experience:</strong> {supplier.experience_years || 0} years
                        </div>
                        <div>
                          <strong>Quality Rating:</strong> {supplier.quality_rating?.toFixed(1) || 'N/A'}/5.0
                          <div style={{ width: '100px', height: '8px', background: '#e9ecef', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <div style={{
                              width: `${(supplier.quality_rating || 0) / 5 * 100}%`,
                              height: '100%',
                              background: '#28a745',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                        <div>
                          <strong>Delivery Reliability:</strong> {supplier.delivery_reliability?.toFixed(1) || 'N/A'}%
                          <div style={{ width: '100px', height: '8px', background: '#e9ecef', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <div style={{
                              width: `${supplier.delivery_reliability || 0}%`,
                              height: '100%',
                              background: '#17a2b8',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                        <div>
                          <strong>Price Competitiveness:</strong> {supplier.price_competitiveness?.toFixed(1) || 'N/A'}/100
                          <div style={{ width: '100px', height: '8px', background: '#e9ecef', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <div style={{
                              width: `${supplier.price_competitiveness || 0}%`,
                              height: '100%',
                              background: '#ffc107',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                      </div>

                      {supplier.certifications && JSON.parse(supplier.certifications || '[]').length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Certifications:</strong>{' '}
                          {JSON.parse(supplier.certifications || '[]').join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-success"
                onClick={() => selectMutation.mutate(selectedSuppliers)}
                disabled={selectedSuppliers.length === 0 || selectMutation.isPending}
              >
                {selectMutation.isPending ? 'Contacting Suppliers...' : `Contact ${selectedSuppliers.length} Selected Supplier(s)`}
              </button>
              {selectMutation.isSuccess && (
                <div style={{ color: 'green', alignSelf: 'center' }}>
                  ✓ Suppliers contacted! Redirecting...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p>No suppliers available for selection. Please run scouting first.</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/scouting`)}>
              ← Back to Scouting
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierSelectionScreen

