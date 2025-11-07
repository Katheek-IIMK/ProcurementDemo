import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import apiClient from '../api/client'
import '../App.css'

function CreateRequirement() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: '',
    certifications: [] as string[],
    newCertification: '',
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/requirements', data)
      return response.data
    },
    onSuccess: (data) => {
      navigate(`/requirements/${data.id}/scouting`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      required_certifications: formData.certifications,
    })
  }

  const addCertification = () => {
    if (formData.newCertification.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, formData.newCertification],
        newCertification: '',
      })
    }
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Create Procurement Requirement</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Step 1: State your procurement requirement (Manual)
        </p>

        {createMutation.isError && (
          <div className="error">Error creating requirement. Please try again.</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Office Supplies Procurement"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your procurement requirement in detail..."
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Office Supplies, Raw Materials, Services"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label>Unit *</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., units, kg, liters"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Required Certifications</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={formData.newCertification}
                onChange={(e) => setFormData({ ...formData, newCertification: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                placeholder="e.g., ISO 9001"
              />
              <button type="button" className="btn" onClick={addCertification}>
                Add
              </button>
            </div>
            {formData.certifications.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#e9ecef',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '1rem',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Requirement'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRequirement

