import { useParams, Link } from 'react-router-dom'
import '../App.css'

interface WorkflowProgressProps {
  currentStage: string
}

function WorkflowProgress({ currentStage }: WorkflowProgressProps) {
  const { id } = useParams<{ id: string }>()
  
  const stages = [
    { key: 'scouting', label: 'Scouting', path: `/requirements/${id}/scouting` },
    { key: 'supplier-selection', label: 'Select', path: `/requirements/${id}/supplier-selection` },
    { key: 'outreach', label: 'Outreach', path: `/requirements/${id}/outreach` },
    { key: 'sampling', label: 'Sampling', path: `/requirements/${id}/sampling` },
    { key: 'quality-review', label: 'Quality Review', path: `/requirements/${id}/quality-review` },
    { key: 'cost-analysis', label: 'Cost Analysis', path: `/requirements/${id}/cost-analysis` },
    { key: 'shortlist', label: 'Shortlist', path: `/requirements/${id}/shortlist` },
    { key: 'onboarding', label: 'Onboarding', path: `/requirements/${id}/onboarding` },
  ]

  const currentIndex = stages.findIndex(s => s.key === currentStage)

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        {stages.map((stage, index) => {
          const isActive = stage.key === currentStage
          const isCompleted = index < currentIndex

          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '120px' }}>
              <Link
                to={stage.path}
                style={{
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : isCompleted ? '#28a745' : '#999',
                  fontWeight: isActive ? '600' : 'normal',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: 1
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isActive ? '#667eea' : isCompleted ? '#28a745' : '#e9ecef',
                    color: isActive || isCompleted ? 'white' : '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                >
                  {isCompleted ? 'V' : index + 1}
                </div>
                <span style={{ whiteSpace: 'nowrap' }}>{stage.label}</span>
              </Link>
              {index < stages.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isCompleted ? '#28a745' : '#e9ecef',
                    margin: '0 0.5rem',
                    minWidth: '20px'
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorkflowProgress

