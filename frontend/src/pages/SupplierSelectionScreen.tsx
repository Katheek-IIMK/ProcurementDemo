import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function SupplierSelectionScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
    },
  })

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => navigate(`/requirements/${id}/outreach`), 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, id, navigate])

  if (isLoading) return <div className="loading">Loading supplier metrics...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const scoredSuppliers = requirement.suppliers?.filter((s: any) => s.availability_scope) || []
  const rankedSuppliers = [...scoredSuppliers].sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0))

  return (
    <div className="container">
      <WorkflowProgress currentStage="supplier-selection" />
      <div className="card">
        <h2>Supplier Scoring Summary</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Suppliers have been automatically ranked and the highest scoring options were selected for outreach.
          You will be redirected to the outreach stage in a moment.
        </p>

        {rankedSuppliers.length > 0 ? (
          <div className="supplier-list">
            {rankedSuppliers.map((supplier: any, index: number) => (
              <div key={supplier.id || supplier.name} className="supplier-card" style={{ borderLeft: supplier.selected_for_outreach ? '4px solid #667eea' : '1px solid #ddd' }}>
                <h4>#{index + 1} - {supplier.name}</h4>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${supplier.status}`}>
                    {supplier.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
                <p><strong>Overall Score:</strong> {supplier.overall_score?.toFixed(1) || 'N/A'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span>Experience: {supplier.experience_years || 0} years</span>
                  <span>Quality Rating: {supplier.quality_rating?.toFixed(1) || 'N/A'}/5</span>
                  <span>Reliability: {supplier.delivery_reliability?.toFixed(1) || 'N/A'}%</span>
                  <span>Price Score: {supplier.price_competitiveness?.toFixed(1) || 'N/A'}</span>
                </div>
                {supplier.selected_for_outreach && (
                  <p style={{ marginTop: '0.5rem', color: '#0f5132' }}> Selected automatically for outreach</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No suppliers available for outreach.</p>
        )}
      </div>
    </div>
  )
}

export default SupplierSelectionScreen
