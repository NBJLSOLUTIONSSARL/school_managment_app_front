import axios from 'axios'
import { getAccessToken, clearTokens } from '@/utils/tokenStorage'

/**
 * Base URL of the backend API.
 * Configurable per environment through VITE_API_BASE_URL, with a
 * same-origin "/api" proxy fallback for local development.
 */
import { API_BASE_URL } from '@/config/env'
export { API_BASE_URL }

/**
 * Pre-configured Axios instance for the School Management API.
 * - Base URL: VITE_API_BASE_URL or '/api'
 * - Request interceptor: Automatically injects Authorization: Bearer <accessToken>
 * - Response interceptor: Handles 401 Unauthorized globally (purges tokens and redirects to /login)
 */
export const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  timeout: 30000,
})

// Request Interceptor: Attach Bearer token and normalize URL
axiosClient.interceptors.request.use(
  (config) => {
    // Prevent duplicate `/api` prefix if caller passes `/api/...` while baseURL already includes `/api`
    if (config.url && typeof config.url === 'string') {
      const base = config.baseURL || axiosClient.defaults.baseURL || ''
      if (base.endsWith('/api') || base.endsWith('/api/')) {
        if (config.url.startsWith('/api/')) {
          config.url = config.url.replace(/^\/api\//, '/')
        } else if (config.url === '/api') {
          config.url = '/'
        }
      }
    }

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

// Flag to prevent multiple concurrent 401s from triggering multiple redirects or loops
let isRedirecting = false

export function resetRedirectFlag() {
  isRedirecting = false
}

export function getIsRedirecting() {
  return isRedirecting
}

// Response Interceptor: Global 401 handling
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      const requestUrl = error?.config?.url || ''
      // Only skip session purge on unauthenticated credential submissions where 401 indicates invalid input
      const isLoginAttempt =
        requestUrl.includes('/auth/login') ||
        requestUrl.endsWith('/login') ||
        requestUrl === '/login' ||
        requestUrl.includes('/auth/google') ||
        requestUrl.includes('/auth/forgot-password') ||
        requestUrl.includes('/auth/reset-password')

      // Do not wipe the session on a failed login attempt.
      if (isLoginAttempt) {
        return Promise.reject(error)
      }

      // 1. Purge tokens and local storage session
      clearTokens()

      // 2. Notify in-memory state / context listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { url: requestUrl } }))

        // 3. Redirect to /login if not already on the login page (deduplicated)
        const currentPath = window.location.pathname || ''
        if (!currentPath.startsWith('/login') && !isRedirecting) {
          isRedirecting = true
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
