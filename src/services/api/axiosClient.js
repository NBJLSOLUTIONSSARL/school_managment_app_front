import axios from 'axios'
import { getAccessToken, clearTokens } from '@/utils/tokenStorage'

/**
 * Pre-configured Axios instance for the School Management API.
 * - Base URL: '/api'
 * - Request interceptor: Automatically injects Authorization: Bearer <accessToken>
 * - Response interceptor: Handles 401 Unauthorized globally (purges tokens and redirects to /login)
 */
export const axiosClient = axios.create({
  baseURL: '/api',
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
    if (error?.response?.status === 401) {
      // 1. Purge tokens and local storage session
      clearTokens()

      // 2. Notify in-memory state / context listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))

        // 3. Redirect to /login if not already on the login page
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login')) {
          const redirectParam = encodeURIComponent(currentPath + window.location.search)
          window.location.href = `/login?redirect=${redirectParam}`
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
