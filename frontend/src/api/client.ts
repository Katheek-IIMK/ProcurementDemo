import axios from 'axios'

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const normalizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/?$/, '')
  : '/api'

const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.data || '')
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
apiClient.interceptors.response.use(
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
    console.error('❌ Response Error:', error.response?.status, error.config?.url, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default apiClient

