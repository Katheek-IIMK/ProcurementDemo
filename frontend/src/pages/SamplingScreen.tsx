import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function SamplingScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showSampleForm, setShowSampleForm] = useState<number | null>(null)
  const [sampleData, setSampleData] = useState({ quantity: '', address: '', price_quoted: '' })

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
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

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const suppliersNeedingSamples = requirement.suppliers?.filter((s: any) => 
    s.status === 'sample_requested'
  ) || []

  const suppliersWithSamples = requirement.suppliers?.filter((s: any) => 
    s.status === 'sample_received'
  ) || []

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/outreach`)}>
           Back to Outreach
        </button>
      </div>
      <WorkflowProgress currentStage="sampling" />
      <div className="card">
        <h2>Step 6: Sample Management</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Sample orders have been automatically placed for suppliers who responded. Review sample details below.
        </p>

        {suppliersWithSamples.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3>Sample Orders Placed ({suppliersWithSamples.length})</h3>
            <div className="supplier-list">
              {suppliersWithSamples.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card" style={{ borderLeft: '4px solid #28a745' }}>
                  <h4>{supplier.name}</h4>
                  {supplier.sample && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#d4edda', borderRadius: '4px' }}>
                      <p><strong> Sample Order Details:</strong></p>
                      <p><strong>Quantity:</strong> {supplier.sample.quantity} units</p>
                      <p><strong>Price Quoted:</strong> ${supplier.sample.price_quoted?.toFixed(2)}</p>
                      <p><strong>Price per Unit:</strong> ${supplier.sample.price_per_unit?.toFixed(2)}</p>
                      <p><strong>Delivery Address:</strong> {supplier.sample.delivery_address || 'Main Warehouse'}</p>
                      <p><strong>Status:</strong> Sample received, awaiting quality review</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {suppliersNeedingSamples.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3>Suppliers Awaiting Samples ({suppliersNeedingSamples.length})</h3>
            <div className="supplier-list">
              {suppliersNeedingSamples.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{supplier.name}</h4>
                      <p>Status: {supplier.status.replace('_', ' ')}</p>
                    </div>
                    <button
                      className="btn"
                      onClick={() => setShowSampleForm(supplier.id)}
                    >
                      Record Sample Received
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {suppliersWithSamples.length > 0 && (
          <div>
            <h3>Samples Received ({suppliersWithSamples.length})</h3>
            <div className="supplier-list">
              {suppliersWithSamples.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p>Status: Sample received, awaiting quality review</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/quality-review`)}>
                Continue to Quality Review 
              </button>
            </div>
          </div>
        )}

        {suppliersNeedingSamples.length === 0 && suppliersWithSamples.length === 0 && (
          <div>
            <p>No samples to manage at this time.</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/outreach`)}>
               Back to Outreach
            </button>
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
            <h3>Record Sample Received</h3>
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
    </div>
  )
}

export default SamplingScreen

