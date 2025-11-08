import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosRequestHeaders } from 'axios'
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

type ApiClient = Pick<AxiosInstance, 'get' | 'post' | 'request'>

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

const toAxiosResponse = <T>(data: T, config?: AxiosRequestConfig): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: (config?.headers as AxiosRequestHeaders) ?? {},
  config: {
    method: config?.method ?? 'get',
    url: config?.url ?? '',
    ...config,
  },
  request: undefined,
})

const mockAxiosAdapter: ApiClient = {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const response = await mockApiClient.get(url, config as any)
    return toAxiosResponse(response.data as T, { ...config, method: 'get', url })
  },
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const response = await mockApiClient.post(url, data, config as any)
    return toAxiosResponse(response.data as T, { ...config, method: 'post', url, data })
  },
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const method = (config.method ?? 'get').toLowerCase()
    if (method === 'get') {
      return mockAxiosAdapter.get(config.url ?? '', config)
    }
    if (method === 'post') {
      return mockAxiosAdapter.post(config.url ?? '', config.data, config)
    }
    throw new Error(`Mock client does not support method ${config.method}`)
  },
}

const apiClient: ApiClient = shouldUseMock ? mockAxiosAdapter : realClient

export default apiClient

