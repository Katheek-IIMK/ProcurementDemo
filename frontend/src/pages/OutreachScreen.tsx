import { useMemo } from 'react'
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

  const outreachSuppliers = useMemo(() => {
    if (!requirement?.suppliers) return []
    return requirement.suppliers.filter((s: any) => s.selected_for_outreach)
  }, [requirement?.suppliers])

  const respondedSuppliers = outreachSuppliers.filter((s: any) => ['responded', 'sample_requested', 'sample_received'].includes(s.status))
  const noResponseSuppliers = outreachSuppliers.filter((s: any) => s.status === 'contacted')
  const samplePlaced = outreachSuppliers.filter((s: any) => s.status === 'sample_received')

  if (isLoading) return <div className="loading">Loading outreach...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/scouting`)}> Back to Scouting</button>
      </div>
      <WorkflowProgress currentStage="outreach" />
      <div className="card">
        <h2>Step 4-5: Outreach & Sampling</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Outreach runs automatically after scoring. The dashboard below reflects live responses and sample logistics.
        </p>

        <div style={{ background: '#f0f7ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Outreach Summary</h3>
          <p><strong>Total Suppliers Contacted:</strong> {outreachSuppliers.length}</p>
          <p><strong>Responded:</strong> {respondedSuppliers.length}</p>
          <p><strong>No Response Yet:</strong> {noResponseSuppliers.length}</p>
          <p><strong>Sample Orders Placed:</strong> {samplePlaced.length}</p>
        </div>

        {outreachSuppliers.length > 0 ? (
          <div>
            <h3>Supplier Status</h3>
            <div className="supplier-list">
              {outreachSuppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge status-${supplier.status}`}>{supplier.status?.replace('_', ' ')}</span>
                  </p>
                  <p><strong>Contact Method:</strong> {supplier.contact_method || 'Email'}</p>
                  {supplier.notes && (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>{supplier.notes}</p>
                  )}
                  {supplier.status === 'contacted' && (
                    <p style={{ color: '#856404', marginTop: '0.5rem' }}>Awaiting supplier response...</p>
                  )}
                  {supplier.status === 'sample_received' && supplier.sample && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#d4edda', borderRadius: '4px' }}>
                      <p><strong>Sample Order</strong></p>
                      <p>Quantity: {supplier.sample.quantity} units</p>
                      <p>Quoted Price: ${supplier.sample.price_quoted?.toFixed(2)}</p>
                      <p>Unit Cost: ${supplier.sample.price_per_unit?.toFixed(2)}</p>
                      <p>Delivery: {supplier.sample.delivery_address}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/sampling`)}>
                Manage Samples
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff4e5', padding: '1rem', borderRadius: '8px', color: '#7a4d0f' }}>
            <p>No suppliers were eligible for outreach. Trigger scouting again to discover new options.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutreachScreen
