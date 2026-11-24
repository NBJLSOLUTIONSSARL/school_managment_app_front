import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { AuthContext } from '../context/AuthContext'
import { ToastProvider } from '@/context/ToastProvider'
import { I18nProvider } from '@/lib/i18n/I18nProvider'

function renderLoginForm({ authValue, initialEntries = ['/login'] } = {}) {
  const defaultAuth = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    roles: [],
    login: vi.fn().mockResolvedValue(true),
    ...authValue,
  }

  return {
    ...render(
      <MemoryRouter initialEntries={initialEntries}>
        <I18nProvider>
          <ToastProvider>
            <AuthContext.Provider value={defaultAuth}>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
                <Route path="/students" element={<div data-testid="students-page">Students</div>} />
              </Routes>
            </AuthContext.Provider>
          </ToastProvider>
        </I18nProvider>
      </MemoryRouter>
    ),
    auth: defaultAuth,
  }
}

describe('LoginForm & Session Redirection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    document.cookie = 'edutrack_session=; path=/; max-age=0'
  })

  it('renders login fields and credentials for all 5 roles in quick accounts', () => {
    renderLoginForm()
    expect(document.getElementById('login-email')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()

    // Toggle quick accounts
    const quickToggle = screen.getByRole('button', { name: /remplissage rapide|comptes de test/i })
    fireEvent.click(quickToggle)

    // Verify all 5 roles exist in quick accounts matching migration seed users
    expect(screen.getByText(/admin@school\.com/i)).toBeInTheDocument() // Admin
    expect(screen.getByText(/teacher@school\.com/i)).toBeInTheDocument() // Teacher
    expect(screen.getByText(/student@school\.com/i)).toBeInTheDocument() // Student
    expect(screen.getByText(/parent@school\.com/i)).toBeInTheDocument() // Parent
    expect(screen.getByText(/staff@school\.com/i)).toBeInTheDocument() // Staff
  })

  it('redirects to /dashboard immediately if already authenticated', async () => {
    renderLoginForm({
      authValue: {
        isAuthenticated: true,
        user: { id: 1, email: 'admin@school.com', roles: ['ROLE_ADMIN'] },
      },
    })

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })

  it('navigates to redirect destination upon successful login', async () => {
    const loginMock = vi.fn().mockResolvedValue(true)
    renderLoginForm({
      authValue: { login: loginMock },
      initialEntries: ['/login?redirect=%2Fstudents'],
    })

    const emailInput = document.getElementById('login-email')
    const passwordInput = document.getElementById('login-password')
    fireEvent.change(emailInput, { target: { value: 'teacher@school.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    const submitBtn = screen.getByRole('button', { name: /^se connecter$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'teacher@school.com',
        password: 'Password123',
      })
      expect(screen.getByTestId('students-page')).toBeInTheDocument()
    })
  })

  it('prevents redirect loop when redirect param points to /login', async () => {
    const loginMock = vi.fn().mockResolvedValue(true)
    renderLoginForm({
      authValue: { login: loginMock },
      initialEntries: ['/login?redirect=%2Flogin'],
    })

    const submitBtn = screen.getByRole('button', { name: /^se connecter$/i })
    fireEvent.click(submitBtn)

    // Should safely fallback to dashboard instead of looping to login
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })

  it('displays error message when login rejects with invalid credentials', async () => {
    const loginMock = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    renderLoginForm({
      authValue: { login: loginMock },
    })

    const submitBtn = screen.getByRole('button', { name: /^se connecter$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument()
    })
  })

  it('supports login with phone number as identifier', async () => {
    const loginMock = vi.fn().mockResolvedValue(true)
    renderLoginForm({
      authValue: { login: loginMock },
    })

    const identifierInput = document.getElementById('login-email')
    const passwordInput = document.getElementById('login-password')
    fireEvent.change(identifierInput, { target: { value: '+33612345678' } })
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } })

    fireEvent.click(screen.getByRole('button', { name: /^se connecter$/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: '+33612345678',
        password: 'Secret123!',
      })
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })

  it('renders 2FA challenge screen when login requires two-factor authentication', async () => {
    const loginMock = vi.fn().mockResolvedValue({
      twoFactorRequired: true,
      tempToken: 'uuid-temp-token-test',
    })
    const verifyTwoFactorLoginMock = vi.fn().mockResolvedValue(true)

    renderLoginForm({
      authValue: {
        login: loginMock,
        verifyTwoFactorLogin: verifyTwoFactorLoginMock,
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /^se connecter$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Authentification à deux facteurs/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Code de sécurité/i)).toBeInTheDocument()
    })

    // Enter 6-digit TOTP code and submit
    const codeInput = document.getElementById('two-factor-code')
    fireEvent.change(codeInput, { target: { value: '123456' } })

    fireEvent.click(screen.getByRole('button', { name: /Valider le code/i }))

    await waitFor(() => {
      expect(verifyTwoFactorLoginMock).toHaveBeenCalledWith({
        tempToken: 'uuid-temp-token-test',
        code: '123456',
      })
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })
})
