import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function ScoutingScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
        setTimeout(() => {
          navigate(`/requirements/${id}/outreach`)
        }, 2000)
      }
    },
  })

  if (isLoading) return <div className="loading">Loading requirement...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>
      <WorkflowProgress currentStage="scouting" />
      <div className="card">
        <h2>Step 2: Scouting Agent (Agentic AI)</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          The AI-powered scouting agent will discover qualified suppliers based on your requirements.
        </p>

        <div style={{ background: '#f0f7ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Requirement Details</h3>
          <p><strong>Title:</strong> {requirement.title}</p>
          <p><strong>Description:</strong> {requirement.description}</p>
          <p><strong>Category:</strong> {requirement.category}</p>
        </div>

        {requirement.suppliers && requirement.suppliers.length > 0 ? (
          <div>
            <h3>Discovered Suppliers ({requirement.suppliers.length})</h3>
            <div className="supplier-list">
              {requirement.suppliers.map((supplier: any) => (
                <div key={supplier.id} className="supplier-card">
                  <h4>{supplier.name}</h4>
                  <p><strong>Status:</strong> {supplier.status}</p>
                  <p><strong>Availability:</strong> {supplier.availability_scope ? '✓ Available' : '✗ Not Available'}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/supplier-selection`)}>
                Select Suppliers for Outreach →
              </button>
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
                <p>AI is analyzing supplier databases and discovering qualified suppliers...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScoutingScreen

