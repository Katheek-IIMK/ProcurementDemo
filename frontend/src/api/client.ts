import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestHeaders,
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

const buildMockResponse = <T, D = any>(config: AxiosRequestConfig<D>, data: T): AxiosResponse<T, D> => {
  const headers = AxiosHeaders.from((config.headers as AxiosRequestHeaders | undefined) ?? {})
  const normalizedConfig: AxiosRequestConfig<D> = {
    ...config,
    headers,
  }
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers,
    config: normalizedConfig,
    request: { mock: true },
  }
}

const mockAxiosAdapter: ApiClient = {
  async get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    const finalConfig: AxiosRequestConfig<D> = {
      ...(config ?? {}),
      method: 'get',
      url,
    }
    const response = await mockApiClient.get(url, config as any)
    return buildMockResponse(finalConfig, response.data as T) as R
  },
  async post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    const finalConfig: AxiosRequestConfig<D> = {
      ...(config ?? {}),
      method: 'post',
      url,
      data,
    }
    const response = await mockApiClient.post(url, data, config as any)
    return buildMockResponse(finalConfig, response.data as T) as R
  },
  async request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R> {
    const method = (config.method ?? 'get').toLowerCase()
    const url = config.url ?? ''
    if (method === 'get') {
      return this.get(url, config)
    }
    if (method === 'post') {
      return this.post(url, config.data as D, config)
    }
    throw new Error(`Mock client does not support method ${config.method}`)
  },
}

const apiClient: ApiClient = shouldUseMock ? mockAxiosAdapter : realClient

export default apiClient

