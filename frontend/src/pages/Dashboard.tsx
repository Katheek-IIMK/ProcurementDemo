import { useMemo } from 'react'
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
  const {
    data: rawRequirements,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<Requirement[]>({
    queryKey: ['requirements'],
    queryFn: async () => {
      const response = await apiClient.get('/requirements')
      return response.data
    },
    staleTime: 1000 * 60,
  })

  const { requirements, dataIsMalformed } = useMemo(() => {
    const isArray = Array.isArray(rawRequirements)
    return {
      requirements: isArray ? rawRequirements : [],
      dataIsMalformed: rawRequirements !== undefined && !isArray,
    }
  }, [rawRequirements])

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Procurement Requirements</h2>
          <Link to="/requirements/new">
            <button className="btn">Create New Requirement</button>
          </Link>
        </div>

        {isLoading ? (
          <div className="loading">Loading requirements...</div>
        ) : error ? (
          <div className="error" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span>Error loading requirements. Please check the API service.</span>
            <div>
              <button className="btn" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        ) : dataIsMalformed ? (
          <div className="error" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span>Received unexpected data format from the API. Showing saved requirements is temporarily unavailable.</span>
            <div>
              <button className="btn" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        ) : requirements.length === 0 ? (
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

