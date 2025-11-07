import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function OutreachScreen() {
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

  const suppliersWithSampling = requirement.suppliers?.filter((s: any) => 
    s.status === 'sample_requested' || s.status === 'sample_received'
  ) || []

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/supplier-selection`)}>
          ← Back to Supplier Selection
        </button>
      </div>
      <WorkflowProgress currentStage="outreach" />
      <div className="card">
        <h2>Step 4-5: Outreach & Sampling (Agentic AI)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Suppliers have been contacted. Response status is shown below.
        </p>

        <div style={{ background: '#f0f7ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Outreach Summary</h3>
          <p><strong>Total Suppliers Contacted:</strong> {requirement.suppliers?.filter((s: any) => s.selected_for_outreach).length || 0}</p>
          <p><strong>Suppliers Responded:</strong> {requirement.suppliers?.filter((s: any) => s.status === 'responded' || s.status === 'sample_requested' || s.status === 'sample_received').length || 0}</p>
          <p><strong>No Response Yet:</strong> {requirement.suppliers?.filter((s: any) => s.status === 'contacted').length || 0}</p>
          <p><strong>Sample Orders Placed:</strong> {requirement.suppliers?.filter((s: any) => s.status === 'sample_received').length || 0}</p>
        </div>

        {suppliersWithSampling.length > 0 ? (
          <div>
            <h3>Suppliers Awaiting Samples ({suppliersWithSampling.length})</h3>
            <div className="supplier-list">
              {requirement.suppliers?.filter((s: any) => s.selected_for_outreach).map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge status-${supplier.status}`}>
                      {supplier.status.replace('_', ' ')}
                    </span>
                  </p>
                  <p><strong>Contact Method:</strong> {supplier.contact_method || 'Email'}</p>
                  {supplier.status === 'contacted' && (
                    <p style={{ color: '#856404', fontStyle: 'italic' }}>⏳ Awaiting response...</p>
                  )}
                  {supplier.status === 'sample_received' && supplier.sample && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#d4edda', borderRadius: '4px' }}>
                      <p><strong>✓ Sample Order Placed</strong></p>
                      <p>Quantity: {supplier.sample.quantity} units</p>
                      <p>Price Quoted: ${supplier.sample.price_quoted?.toFixed(2)} (${supplier.sample.price_per_unit?.toFixed(2)}/unit)</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/sampling`)}>
                Continue to Sample Management →
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>Waiting for suppliers to respond and request samples...</p>
            <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/scouting`)}>
              ← Back to Scouting
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutreachScreen

