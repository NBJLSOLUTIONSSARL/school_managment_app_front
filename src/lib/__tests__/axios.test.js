import { describe, it, expect, beforeEach, vi } from 'vitest'
import { axiosClient, resetRedirectFlag, getIsRedirecting } from '@/lib/axios'
import { setAccessToken, getAccessToken, clearTokens } from '@/utils/tokenStorage'

describe('axiosClient', () => {
  beforeEach(() => {
    clearTokens()
    resetRedirectFlag()
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

  it('handles 401 error globally on regular endpoints by purging tokens and dispatching auth:unauthorized', async () => {
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
      config: { url: '/v1/students' },
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

  it('does not clear tokens or dispatch auth:unauthorized on failed login attempt (401 on /auth/login)', async () => {
    setAccessToken('pre_existing_token')

    let eventFired = false
    const listener = () => {
      eventFired = true
    }
    window.addEventListener('auth:unauthorized', listener)

    const responseHandler = axiosClient.interceptors.response.handlers[0]
    const loginError401 = {
      config: { url: '/api/v1/auth/login' },
      response: {
        status: 401,
        data: { message: 'Identifiants incorrects' },
      },
    }

    await expect(responseHandler.rejected(loginError401)).rejects.toEqual(loginError401)

    // Token must NOT be purged by a bad password on the login screen
    expect(getAccessToken()).toBe('pre_existing_token')
    expect(eventFired).toBe(false)

    window.removeEventListener('auth:unauthorized', listener)
  })

  it('clears tokens and dispatches auth:unauthorized on 401 for authenticated endpoints like /api/v1/auth/me', async () => {
    setAccessToken('expired_user_token')

    let eventFired = false
    const listener = () => {
      eventFired = true
    }
    window.addEventListener('auth:unauthorized', listener)

    const responseHandler = axiosClient.interceptors.response.handlers[0]
    const authMeError401 = {
      config: { url: '/api/v1/auth/me' },
      response: {
        status: 401,
        data: { message: 'Token expiré' },
      },
    }

    await expect(responseHandler.rejected(authMeError401)).rejects.toEqual(authMeError401)

    expect(getAccessToken()).toBeNull()
    expect(eventFired).toBe(true)

    window.removeEventListener('auth:unauthorized', listener)
  })

  it('prevents duplicate redirect executions during concurrent 401 error storm', async () => {
    const responseHandler = axiosClient.interceptors.response.handlers[0]
    expect(getIsRedirecting()).toBe(false)

    const err1 = { config: { url: '/v1/students' }, response: { status: 401 } }
    const err2 = { config: { url: '/v1/teachers' }, response: { status: 401 } }
    const err3 = { config: { url: '/v1/classes' }, response: { status: 401 } }

    await Promise.allSettled([
      responseHandler.rejected(err1),
      responseHandler.rejected(err2),
      responseHandler.rejected(err3),
    ])

    // Should have engaged redirect lock to deduplicate concurrent requests
    expect(getIsRedirecting()).toBe(true)

    // Resetting flag allows subsequent redirects if re-authenticated
    resetRedirectFlag()
    expect(getIsRedirecting()).toBe(false)
  })
})
