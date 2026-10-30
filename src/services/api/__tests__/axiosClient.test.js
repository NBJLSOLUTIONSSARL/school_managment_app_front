import { describe, it, expect, beforeEach, vi } from 'vitest'
import { axiosClient } from '../axiosClient'
import { setAccessToken, getAccessToken, clearTokens } from '@/utils/tokenStorage'

describe('axiosClient', () => {
  beforeEach(() => {
    clearTokens()
    vi.restoreAllMocks()
  })

  it('has base URL set to /api', () => {
    expect(axiosClient.defaults.baseURL).toBe('/api')
  })

  it('injects Authorization Bearer header if access token exists', async () => {
    setAccessToken('test_jwt_bearer_token')

    // Find the request interceptor handler
    const requestHandler = axiosClient.interceptors.request.handlers[0]
    expect(requestHandler).toBeDefined()

    const config = { headers: {} }
    const resultConfig = await requestHandler.fulfilled(config)

    expect(resultConfig.headers.Authorization).toBe('Bearer test_jwt_bearer_token')
  })

  it('does not inject Authorization header when no access token exists', async () => {
    const requestHandler = axiosClient.interceptors.request.handlers[0]
    const config = { headers: {} }
    const resultConfig = await requestHandler.fulfilled(config)

    expect(resultConfig.headers.Authorization).toBeUndefined()
  })

  it('handles 401 error globally by purging tokens and dispatching auth:unauthorized', async () => {
    setAccessToken('active_session_token')
    expect(getAccessToken()).toBe('active_session_token')

    let eventFired = false
    const listener = () => {
      eventFired = true
    }
    window.addEventListener('auth:unauthorized', listener)

    const responseHandler = axiosClient.interceptors.response.handlers[0]
    expect(responseHandler).toBeDefined()

    const error401 = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    }

    await expect(responseHandler.rejected(error401)).rejects.toEqual(error401)

    // Verify token was purged
    expect(getAccessToken()).toBeNull()
    // Verify event dispatched
    expect(eventFired).toBe(true)

    window.removeEventListener('auth:unauthorized', listener)
  })
})
