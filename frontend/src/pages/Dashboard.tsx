import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import '../App.css'

interface Requirement {
  id: number
  title: string
  status: string
  created_at: string
}

function Dashboard() {
  const { data: requirements, isLoading, error } = useQuery<Requirement[]>({
    queryKey: ['requirements'],
    queryFn: async () => {
      const response = await apiClient.get('/requirements')
      return response.data
    },
  })

  if (isLoading) return <div className="loading">Loading requirements...</div>
  if (error) return <div className="error">Error loading requirements</div>

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Procurement Requirements</h2>
          <Link to="/requirements/new">
            <button className="btn">Create New Requirement</button>
          </Link>
        </div>

        {!requirements || requirements.length === 0 ? (
          <p>No requirements yet. Create your first requirement to get started.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {requirements.map((req) => (
              <Link
                key={req.id}
                to={`/requirements/${req.id}/scouting`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3>{req.title}</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Created: {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`status-badge status-${req.status}`}>
                      {req.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

