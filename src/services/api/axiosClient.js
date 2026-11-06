import axios from 'axios'
import { getAccessToken, clearTokens } from '@/utils/tokenStorage'

/**
 * Base URL of the backend API.
 * Configurable per environment through VITE_API_BASE_URL, with a
 * same-origin "/api" proxy fallback for local development.
 */
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api'

/**
 * Pre-configured Axios instance for the School Management API.
 * - Base URL: VITE_API_BASE_URL or '/api'
 * - Request interceptor: Automatically injects Authorization: Bearer <accessToken>
 * - Response interceptor: Handles 401 Unauthorized globally (purges tokens and redirects to /login)
 */
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request Interceptor: Attach Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Global 401 handling
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      const requestUrl = error?.config?.url || ''
      const isAuthEndpoint = requestUrl.includes('/auth/') || requestUrl.includes('login')

      // Do not wipe the session on a failed login attempt.
      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      // 1. Purge tokens and local storage session
      clearTokens()

      // 2. Notify in-memory state / context listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))

        // 3. Redirect to /login if not already on the login page
        const currentPath = window.location.pathname || ''
        if (!currentPath.startsWith('/login')) {
          const redirectParam = encodeURIComponent(currentPath + (window.location.search || ''))

          try {
            window.location.assign(`/login?redirect=${redirectParam}`)
          } catch {
            // Ignore environments where navigation is not implemented (e.g. tests).
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
