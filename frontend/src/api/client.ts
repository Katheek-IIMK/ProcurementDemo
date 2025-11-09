import axios, {
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import mockApiClient from './mockApi'

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const normalizedBaseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/?$/, '') : '/api'

const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
const isLocalhost = ['localhost', '127.0.0.1'].includes(hostname)
const mockFlag = (import.meta.env.VITE_ENABLE_MOCK_API ?? '').toLowerCase() === 'true'
const shouldUseMock = mockFlag || (!isLocalhost && normalizedBaseUrl === '/api')

if (shouldUseMock) {
  console.info('⚙️ Using front-end mock API. Set VITE_API_BASE_URL to a real backend to disable.')
}

const parseData = (value: unknown): any => {
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return undefined
    }
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

const realClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

if (!shouldUseMock) {
  realClient.interceptors.request.use(
    (config) => {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.data || '')
      return config
    },
    (error) => {
      console.error('❌ Request Error:', error)
      return Promise.reject(error)
    }
  )

  realClient.interceptors.response.use(
    (response) => {
      const contentType = response.headers['content-type'] || ''
      const looksLikeHtml = typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')

      if (!contentType.includes('application/json') || looksLikeHtml) {
        const err = new Error(
          `Unexpected response for ${response.config.url}. Expected JSON but received ${contentType || 'unknown type'}.`
        )
        console.error('❌ Response Validation Error:', err.message)
        return Promise.reject(err)
      }

      console.log('✅ API Response:', response.status, response.config.url, response.data)
      return response
    },
    (error) => {
      console.error(
        '❌ Response Error:',
        (error as any).response?.status,
        (error as any).config?.url,
        (error as any).response?.data || (error as Error).message
      )
      return Promise.reject(error)
    }
  )
}

const buildMockResponse = <T, D = any>(config: InternalAxiosRequestConfig<D>, data: T): AxiosResponse<T, D> => {
  const headers =
    (config.headers as AxiosHeaders | undefined) !== undefined
      ? (config.headers as AxiosHeaders)
      : new AxiosHeaders()
  if (!config.headers) {
    config.headers = headers
  }
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers,
    config,
    request: { mock: true },
  }
}

if (shouldUseMock) {
  realClient.defaults.adapter = async <D = any>(config: InternalAxiosRequestConfig<D>) => {
    const method = (config.method ?? 'get').toLowerCase()
    const url = config.url ?? ''
    let response: { data: unknown }
    if (method === 'get') {
      response = await mockApiClient.get(url, { params: config.params })
    } else if (method === 'post') {
      const payload = parseData(config.data)
      response = await mockApiClient.post(url, payload)
    } else {
      throw new Error(`Mock client does not support method ${method.toUpperCase()} ${url}`)
    }

    return buildMockResponse(config, response.data)
  }
}

const apiClient = realClient

export default apiClient

