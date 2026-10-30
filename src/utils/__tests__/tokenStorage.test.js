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
} from '../tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves access token', () => {
    expect(getAccessToken()).toBeNull()
    setAccessToken('token_123')
    expect(getAccessToken()).toBe('token_123')
    setAccessToken(null)
    expect(getAccessToken()).toBeNull()
  })

  it('stores and retrieves refresh token', () => {
    expect(getRefreshToken()).toBeNull()
    setRefreshToken('refresh_456')
    expect(getRefreshToken()).toBe('refresh_456')
    setRefreshToken(null)
    expect(getRefreshToken()).toBeNull()
  })

  it('sets both tokens via setTokens', () => {
    setTokens({ accessToken: 'acc_789', refreshToken: 'ref_789' })
    expect(getAccessToken()).toBe('acc_789')
    expect(getRefreshToken()).toBe('ref_789')
  })

  it('stores and retrieves current user JSON object', () => {
    expect(getCurrentUser()).toBeNull()
    const user = { id: 1, name: 'Alice', roles: ['admin'] }
    setCurrentUser(user)
    expect(getCurrentUser()).toEqual(user)
    setCurrentUser(null)
    expect(getCurrentUser()).toBeNull()
  })

  it('clears all tokens and user on clearTokens()', () => {
    setTokens({ accessToken: 'a', refreshToken: 'r' })
    setCurrentUser({ id: 1 })
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(getCurrentUser()).toBeNull()
  })
})
