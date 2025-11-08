const STORAGE_KEY = 'procurement-demo-mock-state-v1'

const isBrowser = typeof window !== 'undefined'

type RequirementStatus =
  | 'draft'
  | 'scouting'
  | 'outreach'
  | 'sampling'
  | 'quality_review'
  | 'cost_analysis'
  | 'negotiation'
  | 'shortlisted'
  | 'onboarding'
  | 'completed'

type SupplierStatus =
  | 'discovered'
  | 'contacted'
  | 'responded'
  | 'sample_requested'
  | 'sample_received'
  | 'quality_approved'
  | 'quality_rejected'
  | 'cost_analyzed'
  | 'negotiating'
  | 'shortlisted'
  | 'rejected'
  | 'onboarding'

interface SampleRecord {
  id: number
  quantity: number
  price_quoted: number
  price_per_unit: number
  delivery_address: string
  quality_approved: boolean | null
  quality_notes: string | null
  quality_reviewed_by: string | null
  quality_reviewed_at: string | null
}

interface CostAnalysisRecord {
  total_cost: number
  savings: number
  savings_percentage: number
  meets_expectations: boolean
  current_supplier_cost: number
}

interface NegotiationIterationRecord {
  iteration_number: number
  proposed_cost: number
  target_cost: number
  outcome: string
  notes: string
}

interface SupplierRecord {
  id: number
  requirement_id: number
  name: string
  status: SupplierStatus
  availability_scope: boolean | null
  selected_for_outreach: boolean
  experience_years: number
  quality_rating: number
  delivery_reliability: number
  price_competitiveness: number
  overall_score: number
  certifications: string[]
  contact_method: string
  notes: string
  sample: SampleRecord | null
  cost_analysis: CostAnalysisRecord | null
  negotiation_iterations: NegotiationIterationRecord[]
}

interface ShortlistEntry {
  supplier_id: number
  rank: number
  integrated_score: number
  cost_score: number
  quality_score: number
  recommendation: string
  created_at: string
}

interface RequirementRecord {
  id: number
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  required_certifications: string[]
  status: RequirementStatus
  created_at: string
  updated_at: string
  suppliers: SupplierRecord[]
  shortlist: ShortlistEntry[]
}

interface MockState {
  nextRequirementId: number
  nextSupplierId: number
  nextSampleId: number
  requirements: Record<number, RequirementRecord>
}

const createEmptyState = (): MockState => ({
  nextRequirementId: 1,
  nextSupplierId: 1,
  nextSampleId: 1,
  requirements: {},
})

let memoryState: MockState = createEmptyState()

const loadState = (): MockState => {
  if (!isBrowser) return memoryState
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return memoryState
    const parsed = JSON.parse(stored) as MockState
    memoryState = {
      ...createEmptyState(),
      ...parsed,
    }
    return clone(memoryState)
    return clone(memoryState)
  } catch (error) {
    console.warn('Failed to load mock state. Resetting...', error)
    memoryState = createEmptyState()
    return clone(memoryState)
  }
}

const saveState = (state: MockState) => {
  memoryState = clone(state)
  if (!isBrowser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState))
  } catch (error) {
    console.warn('Failed to persist mock state.', error)
  }
}

const supplierTemplates = [
  {
    name: 'Global Office Supplies',
    experience_years: 12,
    quality_rating: 4.6,
    delivery_reliability: 96,
    price_competitiveness: 84,
    overall_score: 88,
    certifications: ['ISO 9001', 'ISO 14001'],
  },
  {
    name: 'Precision Manufacturing Group',
    experience_years: 9,
    quality_rating: 4.4,
    delivery_reliability: 92,
    price_competitiveness: 81,
    overall_score: 85,
    certifications: ['ISO 9001', 'RoHS'],
  },
  {
    name: 'Eco Logistics Partners',
    experience_years: 8,
    quality_rating: 4.2,
    delivery_reliability: 88,
    price_competitiveness: 78,
    overall_score: 80,
    certifications: ['ISO 14001'],
  },
  {
    name: 'Prime Industrial Networks',
    experience_years: 14,
    quality_rating: 4.7,
    delivery_reliability: 97,
    price_competitiveness: 83,
    overall_score: 90,
    certifications: ['ISO 9001', 'Six Sigma'],
  },
]

const pickTemplates = () => supplierTemplates.slice(0, 3)

const generateSample = (id: number, requirement: RequirementRecord, multiplier = 0.12): SampleRecord => {
  const quantity = Math.max(1, Math.round(requirement.quantity * multiplier))
  const pricePerUnit = 120 + Math.round(Math.random() * 25)
  const priceQuoted = parseFloat((quantity * pricePerUnit).toFixed(2))
  return {
    id,
    quantity,
    price_quoted: priceQuoted,
    price_per_unit: pricePerUnit,
    delivery_address: 'Main Warehouse, New York, NY',
    quality_approved: null,
    quality_notes: null,
    quality_reviewed_by: null,
    quality_reviewed_at: null,
  }
}

const nowIso = () => new Date().toISOString()

const clone = <T,>(value: T): T => {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

const findRequirement = (state: MockState, id: number): RequirementRecord => {
  const requirement = state.requirements[id]
  if (!requirement) {
    throw Object.assign(new Error('Requirement not found'), { status: 404 })
  }
  return requirement
}

const findSupplier = (requirement: RequirementRecord, supplierId: number): SupplierRecord => {
  const supplier = requirement.suppliers.find((s) => s.id === supplierId)
  if (!supplier) {
    throw Object.assign(new Error('Supplier not found'), { status: 404 })
  }
  return supplier
}

const ensureShortlist = (requirement: RequirementRecord) => {
  if (requirement.shortlist.length > 0) return
  const candidates = requirement.suppliers
    .filter((supplier) => supplier.cost_analysis && ['cost_analyzed', 'shortlisted', 'onboarding'].includes(supplier.status))
    .sort((a, b) => (b.cost_analysis?.total_cost ?? 0) - (a.cost_analysis?.total_cost ?? 0))

  if (candidates.length === 0) return

  const shortlistEntries: ShortlistEntry[] = candidates.slice(0, 3).map((supplier, index) => ({
    supplier_id: supplier.id,
    rank: index + 1,
    integrated_score: parseFloat((supplier.overall_score + (supplier.cost_analysis?.savings_percentage ?? 0) / 2).toFixed(1)),
    cost_score: parseFloat(((supplier.cost_analysis?.savings_percentage ?? 0) + 70).toFixed(1)),
    quality_score: parseFloat((supplier.quality_rating * 20).toFixed(1)),
    recommendation: index === 0
      ? 'Recommended for onboarding. Strong performance across quality and savings.'
      : 'Suitable for consideration as a backup supplier.',
    created_at: nowIso(),
  }))

  requirement.shortlist = shortlistEntries
}

const mockHandlers = {
  async listRequirements(state: MockState) {
    const items = Object.values(state.requirements)
      .sort((a, b) => b.id - a.id)
      .map((req) => ({
        id: req.id,
        title: req.title,
        status: req.status,
        created_at: req.created_at,
      }))
    return { data: items }
  },

  async createRequirement(state: MockState, payload: any) {
    const id = state.nextRequirementId++
    const now = nowIso()
    const requirement: RequirementRecord = {
      id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      quantity: Number(payload.quantity) || 0,
      unit: payload.unit,
      required_certifications: Array.isArray(payload.required_certifications) ? payload.required_certifications : [],
      status: 'scouting',
      created_at: now,
      updated_at: now,
      suppliers: [],
      shortlist: [],
    }
    state.requirements[id] = requirement
    return {
      data: {
        id,
        status: requirement.status,
        message: 'Requirement created locally. AI workflow will use simulated data.',
      },
    }
  },

  async getRequirement(state: MockState, requirementId: number) {
    const requirement = clone(findRequirement(state, requirementId))
    return { data: requirement }
  },

  async startScouting(state: MockState, requirementId: number) {
    const requirement = findRequirement(state, requirementId)

    if (requirement.suppliers.length > 0) {
      return {
        data: {
          requirement_id: requirementId,
          suppliers_found: requirement.suppliers.length,
          suppliers: requirement.suppliers.map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
            status: supplier.status,
          })),
          auto_selected: requirement.suppliers.filter((s) => s.selected_for_outreach).map((s) => s.id),
          outreach_results: requirement.suppliers
            .filter((s) => s.selected_for_outreach)
            .map((supplier) => ({
              id: supplier.id,
              name: supplier.name,
              responded: ['responded', 'sample_requested', 'sample_received', 'quality_approved', 'cost_analyzed', 'shortlisted', 'onboarding'].includes(supplier.status),
              sample_ordered: supplier.sample != null,
              sample_details: supplier.sample,
              status: supplier.status,
              contact_method: supplier.contact_method,
            })),
          status: requirement.status,
          message: 'Suppliers already scouted.',
          auto_contacted: requirement.suppliers.filter((s) => s.selected_for_outreach).length,
        },
      }
    }

    const templates = pickTemplates()
    const createdSuppliers: SupplierRecord[] = templates.map((template, index) => {
      const supplierId = state.nextSupplierId++
      const statusSequence: SupplierStatus[] = ['discovered', 'contacted', 'sample_requested']
      const baseStatus = statusSequence[Math.min(index, statusSequence.length - 1)]
      const isSelected = index < 2

      const supplier: SupplierRecord = {
        id: supplierId,
        requirement_id: requirementId,
        name: template.name,
        status: baseStatus,
        availability_scope: true,
        selected_for_outreach: isSelected,
        experience_years: template.experience_years,
        quality_rating: template.quality_rating,
        delivery_reliability: template.delivery_reliability,
        price_competitiveness: template.price_competitiveness,
        overall_score: template.overall_score,
        certifications: template.certifications,
        contact_method: 'Email',
        notes: isSelected ? 'Auto-contacted via AI outreach. Awaiting supplier response.' : 'Supplier discovered. Pending outreach.',
        sample: null,
        cost_analysis: null,
        negotiation_iterations: [],
      }

      if (index === 0) {
        supplier.status = 'sample_received'
        supplier.sample = generateSample(state.nextSampleId++, requirement)
        supplier.notes = 'Sample received automatically. Awaiting quality review.'
      } else if (index === 1) {
        supplier.status = 'sample_requested'
        supplier.notes = 'Sampling requested automatically. Awaiting delivery confirmation.'
      }

      return supplier
    })

    requirement.suppliers = createdSuppliers
    requirement.status = 'sampling'
    requirement.updated_at = nowIso()

    const autoSelected = createdSuppliers.filter((supplier) => supplier.selected_for_outreach).map((supplier) => supplier.id)
    const outreachResults = createdSuppliers
      .filter((supplier) => supplier.selected_for_outreach)
      .map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        responded: ['sample_requested', 'sample_received', 'quality_approved', 'cost_analyzed', 'shortlisted', 'onboarding'].includes(supplier.status),
        sample_ordered: supplier.sample != null,
        sample_details: supplier.sample,
        status: supplier.status,
        contact_method: supplier.contact_method,
      }))

    return {
      data: {
        requirement_id: requirementId,
        suppliers_found: createdSuppliers.length,
        suppliers: createdSuppliers.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
          status: supplier.status,
        })),
        auto_selected: autoSelected,
        outreach_results: outreachResults,
        status: requirement.status,
        message: `Scouting complete. Automatically selected ${autoSelected.length} supplier(s) for outreach.`,
        auto_contacted: autoSelected.length,
      },
    }
  },

  async createSample(state: MockState, payload: any) {
    const supplierId = Number(payload.supplier_id)
    if (!supplierId) {
      throw Object.assign(new Error('supplier_id is required'), { status: 400 })
    }

    const requirement = Object.values(state.requirements).find((req) =>
      req.suppliers.some((supplier) => supplier.id === supplierId),
    )
    if (!requirement) {
      throw Object.assign(new Error('Supplier not found for requirement'), { status: 404 })
    }
    const supplier = findSupplier(requirement, supplierId)

    const sampleId = state.nextSampleId++
    const sample = generateSample(sampleId, requirement, 0.1)
    sample.quantity = Number(payload.quantity) || sample.quantity
    sample.price_quoted = Number(payload.price_quoted) || sample.price_quoted
    sample.price_per_unit = sample.quantity > 0 ? parseFloat((sample.price_quoted / sample.quantity).toFixed(2)) : sample.price_per_unit
    sample.delivery_address = payload.address || 'Main Warehouse, New York, NY'
    supplier.sample = sample
    supplier.status = 'sample_received'
    supplier.notes = 'Sample received and ready for quality review.'

    requirement.status = 'quality_review'
    requirement.updated_at = nowIso()

    return {
      data: {
        sample_id: sampleId,
        message: 'Sample recorded locally. Proceed to quality review.',
        status: supplier.status,
      },
    }
  },

  async reviewQuality(state: MockState, sampleId: number, payload: any) {
    const requirement = Object.values(state.requirements).find((req) =>
      req.suppliers.some((supplier) => supplier.sample?.id === sampleId),
    )
    if (!requirement) {
      throw Object.assign(new Error('Sample not found'), { status: 404 })
    }

    const supplier = requirement.suppliers.find((s) => s.sample?.id === sampleId)
    if (!supplier || !supplier.sample) {
      throw Object.assign(new Error('Sample not found for supplier'), { status: 404 })
    }

    supplier.sample.quality_approved = Boolean(payload.quality_approved)
    supplier.sample.quality_notes = payload.quality_notes || ''
    supplier.sample.quality_reviewed_by = payload.reviewed_by || 'Quality Reviewer'
    supplier.sample.quality_reviewed_at = nowIso()

    if (supplier.sample.quality_approved) {
      supplier.status = 'cost_analyzed'
      requirement.status = 'cost_analysis'

      const baseCost = supplier.sample.price_quoted * 4
      const savings = baseCost * 0.08
      supplier.cost_analysis = {
        total_cost: parseFloat((baseCost - savings).toFixed(2)),
        savings: parseFloat(savings.toFixed(2)),
        savings_percentage: parseFloat(((savings / baseCost) * 100).toFixed(1)),
        meets_expectations: true,
        current_supplier_cost: parseFloat(baseCost.toFixed(2)),
      }

      supplier.negotiation_iterations = [
        {
          iteration_number: 1,
          proposed_cost: parseFloat((supplier.cost_analysis.total_cost + 150).toFixed(2)),
          target_cost: parseFloat((supplier.cost_analysis.total_cost - 200).toFixed(2)),
          outcome: 'partial_success',
          notes: 'Supplier acknowledged savings targets and submitted revised offer.',
        },
        {
          iteration_number: 2,
          proposed_cost: supplier.cost_analysis.total_cost,
          target_cost: parseFloat((supplier.cost_analysis.total_cost - 100).toFixed(2)),
          outcome: 'success',
          notes: 'Negotiation successful. Final cost meets savings expectations.',
        },
      ]
    } else {
      supplier.status = 'quality_rejected'
      requirement.status = 'rejected'
      supplier.cost_analysis = null
      supplier.negotiation_iterations = []
    }

    requirement.updated_at = nowIso()

    return {
      data: {
        sample_id: sampleId,
        quality_approved: supplier.sample.quality_approved,
        supplier_status: supplier.status,
        requirement_status: requirement.status,
        auto_analyzed: supplier.sample.quality_approved,
        message: supplier.sample.quality_approved
          ? 'Quality review saved. Cost analysis and negotiation simulated automatically.'
          : 'Quality review saved. Supplier rejected.',
      },
    }
  },

  async createShortlist(state: MockState, requirementId: number) {
    const requirement = findRequirement(state, requirementId)
    ensureShortlist(requirement)
    requirement.status = 'shortlisted'
    requirement.updated_at = nowIso()

    return {
      data: {
        requirement_id: requirementId,
        shortlist: requirement.shortlist,
        status: requirement.status,
        message: 'Shortlist generated using simulated AI scoring.',
      },
    }
  },

  async onboardSupplier(state: MockState, supplierId: number) {
    const requirement = Object.values(state.requirements).find((req) =>
      req.suppliers.some((supplier) => supplier.id === supplierId),
    )
    if (!requirement) {
      throw Object.assign(new Error('Supplier not found'), { status: 404 })
    }
    const supplier = findSupplier(requirement, supplierId)

    supplier.status = 'onboarding'
    const baseNotes = supplier.notes ? `${supplier.notes} | ` : ''
    supplier.notes = `${baseNotes}Onboarding initiated | Risk: Low | Timeline: 2 weeks`
    requirement.status = 'onboarding'
    requirement.updated_at = nowIso()

    return {
      data: {
        supplier_id: supplierId,
        status: requirement.status,
        message: 'Onboarding simulated. Supplier moved to SRM handoff stage.',
      },
    }
  },
}

const routeMatch = (url: string, pattern: RegExp) => {
  const match = url.match(pattern)
  if (!match) return null
  return match.slice(1)
}

export async function mockRequest(method: string, url: string, payload?: any) {
  const state = loadState()

  try {
    if (method === 'get' && url === '/requirements') {
      const result = await mockHandlers.listRequirements(state)
      saveState(state)
      return result
    }

    if (method === 'post' && url === '/requirements') {
      const result = await mockHandlers.createRequirement(state, payload)
      saveState(state)
      return result
    }

    const requirementMatch = routeMatch(url, /^\/requirements\/(\d+)$/)
    if (method === 'get' && requirementMatch) {
      const [requirementId] = requirementMatch
      const result = await mockHandlers.getRequirement(state, Number(requirementId))
      saveState(state)
      return result
    }

    const scoutMatch = routeMatch(url, /^\/requirements\/(\d+)\/scout$/)
    if (method === 'post' && scoutMatch) {
      const [requirementId] = scoutMatch
      const result = await mockHandlers.startScouting(state, Number(requirementId))
      saveState(state)
      return result
    }

    if (method === 'post' && url === '/samples') {
      const result = await mockHandlers.createSample(state, payload)
      saveState(state)
      return result
    }

    const reviewMatch = routeMatch(url, /^\/samples\/(\d+)\/quality-review$/)
    if (method === 'post' && reviewMatch) {
      const [sampleId] = reviewMatch
      const result = await mockHandlers.reviewQuality(state, Number(sampleId), payload)
      saveState(state)
      return result
    }

    const shortlistMatch = routeMatch(url, /^\/requirements\/(\d+)\/shortlist$/)
    if (method === 'post' && shortlistMatch) {
      const [requirementId] = shortlistMatch
      const result = await mockHandlers.createShortlist(state, Number(requirementId))
      saveState(state)
      return result
    }

    const onboardMatch = routeMatch(url, /^\/suppliers\/(\d+)\/onboard$/)
    if (method === 'post' && onboardMatch) {
      const [supplierId] = onboardMatch
      const result = await mockHandlers.onboardSupplier(state, Number(supplierId))
      saveState(state)
      return result
    }

    const error = Object.assign(new Error(`Mock endpoint not implemented for ${method.toUpperCase()} ${url}`), {
      status: 501,
    })
    throw error
  } catch (error) {
    saveState(state)
    throw error
  }
}

export const mockApiClient = {
  async get(url: string, config?: { params?: any }) {
    console.log('🛰️ Mock API GET:', url, config?.params ?? '')
    const response = await mockRequest('get', url, config?.params)
    return response
  },
  async post(url: string, data?: any, _config?: { params?: any }) {
    console.log('🛰️ Mock API POST:', url, data ?? '')
    const response = await mockRequest('post', url, data)
    return response
  },
  // Axios-compatible helpers
  async request(config: { method?: string; url: string; data?: any }) {
    const method = (config.method ?? 'get').toLowerCase()
    if (method === 'get') {
      return mockApiClient.get(config.url, {})
    }
    if (method === 'post') {
      return mockApiClient.post(config.url, config.data)
    }
    throw new Error(`Mock client does not support method ${config.method}`)
  },
}

export default mockApiClient


