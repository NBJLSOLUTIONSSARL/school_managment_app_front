import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './AuthContext'

// A well-formed access token (header.payload.signature) whose payload decodes to a JWT claim set.
const token = (exp, type = 'ACCESS') => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ exp, type }))
  return `${header}.${payload}.sig`
}

const EXP = Math.floor(Date.now() / 1000) + 3600
const PAST_EXP = Math.floor(Date.now() / 1000) - 100

const loginBody = (roles = ['ROLE_ADMIN'], permissions = ['users:read'], userOver = {}, exp = EXP) => ({
  success: true,
  data: {
    tokenType: 'Bearer',
    accessToken: token(exp),
    expiresIn: 3600,
    user: {
      id: 1,
      active: true,
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Dupont',
      phone: null,
      photoUrl: null,
      language: 'fr',
      twoFactorEnabled: false,
      roles,
      permissions,
      ...userOver
    }
  }
})

function Consumer() {
  const auth = useAuth()
  const [error, setError] = useState('')
  const handleLogin = async () => {
    setError('')
    try {
      await auth.login({ email: 'alice@example.com', password: 'secret' })
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <div data-testid="consumer">
      <span data-testid="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user-email">{auth.user?.email ?? '-'}</span>
      <span data-testid="roles">{auth.roles.join(',')}</span>
      <span data-testid="permissions">{auth.permissions.join(',')}</span>
      <span data-testid="loading">{auth.isLoading ? 'yes' : 'no'}</span>
      <span data-testid="notice">{auth.notice}</span>
      <span data-testid="login-error">{error}</span>
      <button data-testid="has-role-admin">{auth.hasRole('ROLE_ADMIN') ? 'yes' : 'no'}</button>
      <button data-testid="has-role-student">{auth.hasRole('ROLE_STUDENT') ? 'yes' : 'no'}</button>
      <button data-testid="has-perm-users-read">{auth.hasPermission('users:read') ? 'yes' : 'no'}</button>
      <button data-testid="has-any-role">{auth.hasAnyRole(['ROLE_STUDENT', 'ROLE_ADMIN']) ? 'yes' : 'no'}</button>
      <button data-testid="login-btn" onClick={handleLogin}>login</button>
      <button data-testid="logout-btn" onClick={async () => { await auth.logout() }}>logout</button>
      <button data-testid="request-btn" onClick={async () => { try { await auth.request('/api/v1/classes') } catch {} }}>request</button>
    </div>
  )
}

function renderAuth() {
  return render(<AuthProvider><Consumer /></AuthProvider>)
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('AuthProvider (SCRUM-70)', () => {
  it('starts in an unauthenticated state with no roles or permissions', () => {
    renderAuth()
    expect(screen.getByTestId('authenticated').textContent).toBe('no')
    expect(screen.getByTestId('user-email').textContent).toBe('-')
    expect(screen.getByTestId('roles').textContent).toBe('')
    expect(screen.getByTestId('permissions').textContent).toBe('')
    expect(screen.getByTestId('loading').textContent).toBe('no')
  })

  it('updates the authenticated user, roles and permissions on valid login', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => loginBody() })
    renderAuth()
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('yes'))
    expect(screen.getByTestId('user-email').textContent).toBe('alice@example.com')
    expect(screen.getByTestId('roles').textContent).toBe('ROLE_ADMIN')
    expect(screen.getByTestId('permissions').textContent).toBe('users:read')
    expect(screen.getByTestId('loading').textContent).toBe('no')
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'alice@example.com', password: 'secret' })
    }))
  })

  it('supports multiple roles and permission checks using only backend-verified roles', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => loginBody(
      ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_UNKNOWN'],
      ['users:read', 'classes:write']
    ) })
    renderAuth()
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('yes'))
    // unverified role is filtered out
    expect(screen.getByTestId('roles').textContent).toBe('ROLE_ADMIN,ROLE_TEACHER')
    expect(screen.getByTestId('has-role-admin').textContent).toBe('yes')
    expect(screen.getByTestId('has-role-student').textContent).toBe('no')
    expect(screen.getByTestId('has-perm-users-read').textContent).toBe('yes')
    expect(screen.getByTestId('has-any-role').textContent).toBe('yes')
  })

  it('rejects invalid credentials (401) without keeping a session', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 })
    renderAuth()
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('login-error').textContent).toContain('incorrect'))
    expect(screen.getByTestId('authenticated').textContent).toBe('no')
  })

  it('treats an expired access token as a failed login', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => loginBody(['ROLE_ADMIN'], [], {}, PAST_EXP) })
    renderAuth()
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('login-error').textContent).toContain('expir'))
    expect(screen.getByTestId('authenticated').textContent).toBe('no')
  })

  it('clears local state on logout and calls the backend logout endpoint', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => loginBody() })
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }) })
    renderAuth()
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('yes'))
    fireEvent.click(screen.getByTestId('logout-btn'))
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('no'))
    expect(screen.getByTestId('user-email').textContent).toBe('-')
    expect(screen.getByTestId('roles').textContent).toBe('')
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/logout', expect.objectContaining({ method: 'POST' }))
  })

  it('clears the session when an authenticated request receives a 401 (revoked/expired token)', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => loginBody() })
    fetch.mockResolvedValueOnce({ ok: false, status: 401 })
    renderAuth()
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('yes'))
    fireEvent.click(screen.getByTestId('request-btn'))
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('no'))
  })
})
