import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  setTokens,
  clearTokens,
  getCurrentUser,
  setCurrentUser,
  purgeLegacyStorage,
} from '../tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    clearTokens()
  })

  it('stores and retrieves access token strictly in memory', () => {
    expect(getAccessToken()).toBeNull()
    setAccessToken('token_123')
    expect(getAccessToken()).toBe('token_123')
    expect(localStorage.getItem('school_app_access_token')).toBeNull()
    expect(sessionStorage.getItem('school_app_access_token')).toBeNull()
    setAccessToken(null)
    expect(getAccessToken()).toBeNull()
  })

  it('stores and retrieves refresh token strictly in memory', () => {
    expect(getRefreshToken()).toBeNull()
    setRefreshToken('refresh_456')
    expect(getRefreshToken()).toBe('refresh_456')
    expect(localStorage.getItem('school_app_refresh_token')).toBeNull()
    expect(sessionStorage.getItem('school_app_refresh_token')).toBeNull()
    setRefreshToken(null)
    expect(getRefreshToken()).toBeNull()
  })

  it('sets both tokens via setTokens without writing to browser storage', () => {
    setTokens({ accessToken: 'acc_789', refreshToken: 'ref_789' })
    expect(getAccessToken()).toBe('acc_789')
    expect(getRefreshToken()).toBe('ref_789')
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it('stores and retrieves current user JSON object strictly in memory', () => {
    expect(getCurrentUser()).toBeNull()
    const user = { id: 1, name: 'Alice', roles: ['admin'] }
    setCurrentUser(user)
    expect(getCurrentUser()).toEqual(user)
    expect(localStorage.getItem('school_app_current_user')).toBeNull()
    expect(sessionStorage.getItem('school_app_current_user')).toBeNull()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    setCurrentUser(null)
    expect(getCurrentUser()).toBeNull()
  })

  it('clears all tokens and user on clearTokens() and purges legacy keys', () => {
    localStorage.setItem('school_app_current_user', 'legacy')
    localStorage.setItem('school_app_language', 'legacy_lang')
    sessionStorage.setItem('academie_lang', 'legacy_lang2')
    setTokens({ accessToken: 'a', refreshToken: 'r' })
    setCurrentUser({ id: 1 })
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(getCurrentUser()).toBeNull()
    expect(localStorage.getItem('school_app_current_user')).toBeNull()
    expect(localStorage.getItem('school_app_language')).toBeNull()
    expect(sessionStorage.getItem('academie_lang')).toBeNull()
  })

  it('clearTokens clears the edutrack_session cookie', () => {
    document.cookie = 'edutrack_session=1; path=/'
    expect(document.cookie).toContain('edutrack_session=1')
    clearTokens()
    expect(document.cookie).not.toContain('edutrack_session=1')
  })

  it('purgeLegacyStorage removes all banned keys from localStorage and sessionStorage', () => {
    localStorage.setItem('school_app_current_user', 'user_data')
    localStorage.setItem('school_app_language', 'fr')
    localStorage.setItem('academie_lang', 'ar')
    sessionStorage.setItem('school_app_access_token', 'jwt')
    sessionStorage.setItem('school_app_refresh_token', 'refresh')

    purgeLegacyStorage()

    expect(localStorage.getItem('school_app_current_user')).toBeNull()
    expect(localStorage.getItem('school_app_language')).toBeNull()
    expect(localStorage.getItem('academie_lang')).toBeNull()
    expect(sessionStorage.getItem('school_app_access_token')).toBeNull()
    expect(sessionStorage.getItem('school_app_refresh_token')).toBeNull()
  })
})
