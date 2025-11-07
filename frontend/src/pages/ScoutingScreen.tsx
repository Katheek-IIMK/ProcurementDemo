import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function ScoutingScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [autoMessage, setAutoMessage] = useState<string | null>(null)

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
      const autoSelected = Array.isArray(data?.auto_selected) ? data.auto_selected.length : 0
      setAutoMessage(
        autoSelected > 0
          ? `Automatically selected ${autoSelected} supplier${autoSelected === 1 ? '' : 's'} for outreach based on AI scoring. Redirecting...`
          : 'Scouting complete. Redirecting to outreach stage...'
      )
      setTimeout(() => {
        navigate(`/requirements/${id}/outreach`)
      }, 1500)
    },
  })

  useEffect(() => {
    if (!isLoading && requirement?.suppliers?.some((s: any) => s.selected_for_outreach)) {
      setAutoMessage('Suppliers already selected based on AI scoring. Redirecting to outreach...')
      const timer = setTimeout(() => navigate(`/requirements/${id}/outreach`), 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, requirement, id, navigate])

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/')}> Back to Dashboard</button>
      </div>
      <WorkflowProgress currentStage="scouting" />
      <div className="card">
        <h2>Step 2: Scouting Agent (Agentic AI)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          The AI-powered scouting agent analyzes supplier databases, certifications, and performance history to surface the best candidates automatically.
        </p>

        {autoMessage && (
          <div style={{ marginBottom: '1.5rem', background: '#e8f4ff', padding: '1rem', borderRadius: '8px', color: '#0b5394' }}>
            {autoMessage}
          </div>
        )}

        <div style={{ background: '#f0f7ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Requirement Details</h3>
          <p><strong>Title:</strong> {requirement.title}</p>
          <p><strong>Description:</strong> {requirement.description}</p>
          <p><strong>Category:</strong> {requirement.category}</p>
        </div>

        {requirement.suppliers && requirement.suppliers.length > 0 ? (
          <div>
            <h3>AI-Discovered Suppliers ({requirement.suppliers.length})</h3>
            <div className="supplier-list">
              {requirement.suppliers.map((supplier: any) => (
                <div key={supplier.id || supplier.name} className="supplier-card">
                  <h4>{supplier.name}</h4>
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
                  {supplier.certifications && (
                    <p style={{ marginTop: '0.5rem' }}>
                      <strong>Certifications:</strong> {supplier.certifications.join ? supplier.certifications.join(', ') : supplier.certifications}
                    </p>
                  )}
                  {supplier.selected_for_outreach && (
                    <p style={{ marginTop: '0.5rem', color: '#0f5132' }}> Selected for outreach automatically</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              className="btn"
              onClick={() => scoutMutation.mutate()}
              disabled={scoutMutation.isPending}
            >
              {scoutMutation.isPending ? 'Scouting Suppliers...' : 'Start Scouting'}
            </button>
            {scoutMutation.isPending && (
              <div style={{ marginTop: '1rem', color: '#666' }}>
                <p>AI is analyzing supplier data and ranking the best matches...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScoutingScreen
