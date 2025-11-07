import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import WorkflowProgress from '../components/WorkflowProgress'
import '../App.css'

function ShortlistScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: requirement, isLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/requirements/${id}`)
      return response.data
    },
  })

  const suppliersById = useMemo(() => {
    if (!requirement?.suppliers) return {}
    return requirement.suppliers.reduce((acc: Record<number, any>, supplier: any) => {
      acc[supplier.id] = supplier
      return acc
    }, {})
  }, [requirement?.suppliers])

  const shortlistEntries = requirement?.shortlist ?? []
  const shortlistWithDetails = shortlistEntries.map((entry: any) => ({
    entry,
    supplier: suppliersById[entry.supplier_id],
  }))

  const fallbackSuppliers = useMemo(() => {
    if (!requirement?.suppliers) return []
    return requirement.suppliers.filter((s: any) => ['shortlisted', 'cost_analyzed'].includes(s.status))
  }, [requirement?.suppliers])

  useEffect(() => {
    if (requirement?.status === 'onboarding') {
      const timer = setTimeout(() => navigate(`/requirements/${id}/onboarding`), 1500)
      return () => clearTimeout(timer)
    }
  }, [requirement?.status, id, navigate])

  useEffect(() => {
    if (!requirement || !id) return
    const hasShortlist = (requirement.shortlist ?? []).length > 0
    const hasEligibleSuppliers = requirement.suppliers?.some((s: any) => ['cost_analyzed', 'shortlisted'].includes(s.status))

    if (!hasShortlist && hasEligibleSuppliers && !hasRequested && !isGenerating) {
      setHasRequested(true)
      setIsGenerating(true)
      setGenerationError(null)
      apiClient.post(`/requirements/${id}/shortlist`)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['requirement', id] })
        })
        .catch((error) => {
          console.error('Failed to generate shortlist automatically', error)
          setGenerationError('Unable to generate shortlist automatically. Please try again.')
        })
        .finally(() => {
          setIsGenerating(false)
        })
    }
  }, [requirement, id, queryClient, hasRequested, isGenerating])

  if (isLoading) return <div className="loading">Loading shortlist...</div>
  if (!requirement) return <div className="error">Requirement not found</div>

  const hasShortlist = shortlistWithDetails.length > 0
  const shortlistedSuppliers = hasShortlist && shortlistWithDetails.length > 0
    ? shortlistWithDetails
    : fallbackSuppliers.map((supplier: any) => ({ entry: null, supplier }))

  useEffect(() => {
    if (selectedSupplierId !== null) return
    if (shortlistedSuppliers.length === 0) return
    const first = shortlistedSuppliers[0]
    const supplierId = first.supplier?.id ?? first.entry?.supplier_id
    if (supplierId) {
      setSelectedSupplierId(supplierId)
    }
  }, [shortlistedSuppliers, selectedSupplierId])

  const handleConfirmSelection = useCallback(async () => {
    if (!id || !selectedSupplierId) return
    setIsSubmitting(true)
    setGenerationError(null)
    try {
      await apiClient.post(`/suppliers/${selectedSupplierId}/onboard`)
      await queryClient.invalidateQueries({ queryKey: ['requirement', id] })
      navigate(`/requirements/${id}/onboarding`)
    } catch (error) {
      console.error('Failed to initiate onboarding', error)
      setGenerationError('Failed to onboard the selected supplier. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [id, selectedSupplierId, queryClient, navigate])

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/requirements/${id}/cost-analysis`)}> Back to Cost Analysis</button>
      </div>
      <WorkflowProgress currentStage="shortlist" />
      <div className="card">
        <h2>Step 11: AI-Curated Supplier Shortlist</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          AI blends negotiation insights, cost models, and quality data to propose the most viable suppliers. Top suppliers move forward automatically.
        </p>

        {hasShortlist && shortlistWithDetails.length > 0 ? (
          <div>
            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#0f5132' }}>
              <p><strong>Shortlist Generated</strong></p>
              <p>AI has ranked the top suppliers. Select who you want to move into onboarding.</p>
            </div>

            <h3>Shortlisted Suppliers ({shortlistWithDetails.length})</h3>
            <div className="supplier-list">
              {shortlistWithDetails.map(({ entry, supplier }: any) => {
                const statusBadge = supplier?.status ? `status-${supplier.status}` : 'status-shortlisted'
                const supplierId = supplier?.id ?? entry.supplier_id
                return (
                  <div key={entry.supplier_id} className="supplier-card" style={{ borderLeft: '4px solid #667eea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="radio"
                            name="shortlist-selection"
                            value={supplierId ?? ''}
                            checked={selectedSupplierId === supplierId}
                            onChange={() => supplierId && setSelectedSupplierId(supplierId)}
                          />
                          <span style={{ fontWeight: 600 }}>Select supplier</span>
                        </div>
                        <h4>#{entry.rank} - {entry.supplier?.name ?? supplier?.name ?? 'Supplier'}</h4>
                        <p><strong>Status:</strong> <span className={`status-badge ${statusBadge}`}>{supplier?.status?.replace('_', ' ') ?? 'shortlisted'}</span></p>
                        <p><strong>Integrated Score:</strong> {entry.integrated_score}</p>
                        <p><strong>Cost Score:</strong> {entry.cost_score}</p>
                        <p><strong>Quality Score:</strong> {entry.quality_score}</p>
                        <p style={{ marginTop: '0.5rem', color: '#444' }}>{entry.recommendation}</p>
                        {supplier?.cost_analysis && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f0f0f0', borderRadius: '4px' }}>
                            <p><strong>Total Cost:</strong> ${supplier.cost_analysis.total_cost?.toFixed(2)}</p>
                            <p><strong>Savings:</strong> ${supplier.cost_analysis.savings?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(1)}%)</p>
                            <p><strong>Quality:</strong> {supplier.sample?.quality_approved ? 'Approved' : 'Pending'}</p>
                            {supplier.sample?.quality_notes && (
                              <p><strong>Quality Notes:</strong> {supplier.sample.quality_notes}</p>
                            )}
                            {supplier.sample?.quality_reviewed_by && (
                              <p><strong>Reviewed By:</strong> {supplier.sample.quality_reviewed_by}</p>
                            )}
                          </div>
                        )}
                        {supplier?.negotiation_iterations?.length > 0 && (
                          <p style={{ marginTop: '0.5rem', color: '#444' }}>
                            <strong>Negotiation Iterations:</strong> {supplier.negotiation_iterations.length}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-success" onClick={() => navigate(`/requirements/${id}/onboarding`)}>
                Proceed to Onboarding
              </button>
            </div>
          </div>
        ) : shortlistedSuppliers.length > 0 ? (
          <div>
            <div style={{ background: '#e0f2ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#0b4d6c' }}>
              <p><strong>Shortlist Almost Ready</strong></p>
              <p>Rankings are finalizing. Review the leading candidates and select your preferred supplier.</p>
            </div>
            <div className="supplier-list">
              {shortlistedSuppliers.map(({ supplier }: any, index: number) => (
                <div key={supplier.id ?? index} className="supplier-card" style={{ borderLeft: '4px solid #94d0ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name="shortlist-selection"
                          value={supplier.id ?? ''}
                          checked={selectedSupplierId === supplier.id}
                          onChange={() => supplier.id && setSelectedSupplierId(supplier.id)}
                        />
                        <span style={{ fontWeight: 600 }}>Select supplier</span>
                      </div>
                      <h4>{supplier.name ?? `Supplier ${index + 1}`}</h4>
                      <p><strong>Status:</strong> <span className={`status-badge status-${supplier.status}`}>{supplier.status?.replace('_', ' ')}</span></p>
                      {supplier.cost_analysis && (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0f0f0', borderRadius: '4px' }}>
                          <p><strong>Total Cost:</strong> ${supplier.cost_analysis.total_cost?.toFixed(2)}</p>
                          <p><strong>Savings:</strong> ${supplier.cost_analysis.savings?.toFixed(2)} ({supplier.cost_analysis.savings_percentage?.toFixed(1)}%)</p>
                          <p><strong>Quality:</strong> {supplier.sample?.quality_approved ? 'Approved' : 'Pending'}</p>
                          {supplier.sample?.quality_notes && (
                            <p><strong>Quality Notes:</strong> {supplier.sample.quality_notes}</p>
                          )}
                          {supplier.sample?.quality_reviewed_by && (
                            <p><strong>Reviewed By:</strong> {supplier.sample.quality_reviewed_by}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff4e5', padding: '1rem', borderRadius: '8px', color: '#7a4d0f' }}>
            <p>Shortlist is being generated from the latest cost and quality data. Please revisit shortly.</p>
          </div>
        )}

        {(isGenerating || generationError) && (
          <div style={{ marginTop: '1.5rem' }}>
            {isGenerating && (
              <p style={{ color: '#666' }}>Generating shortlist with the latest data...</p>
            )}
            {generationError && (
              <div style={{ background: '#fdecea', color: '#a94442', padding: '0.75rem', borderRadius: '8px' }}>
                <p>{generationError}</p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '0.75rem' }}
                  onClick={async () => {
                    if (!id) return
                    setIsGenerating(true)
                    setGenerationError(null)
                    try {
                      await apiClient.post(`/requirements/${id}/shortlist`)
                      queryClient.invalidateQueries({ queryKey: ['requirement', id] })
                    } catch (error) {
                      console.error('Retrying shortlist generation failed', error)
                      setGenerationError('Still unable to generate shortlist. Please check back shortly.')
                    } finally {
                      setIsGenerating(false)
                    }
                  }}
                >
                  Retry Shortlist
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Selected Supplier ID:</strong> {selectedSupplierId ?? 'None selected'}
          </div>
          <button
            className="btn btn-success"
            disabled={!selectedSupplierId || isSubmitting}
            onClick={handleConfirmSelection}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Selection & Onboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShortlistScreen
