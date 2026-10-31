import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '../auth/AuthProvider'
import LoginPage from './LoginPage'

const token = (exp) => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ exp, type: 'ACCESS' }))
  return `${header}.${payload}.sig`
}

const EXP = Math.floor(Date.now() / 1000) + 3600
const loginBody = () => ({
  success: true,
  data: {
    tokenType: 'Bearer',
    accessToken: token(EXP),
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
      roles: ['ROLE_ADMIN'],
      permissions: ['users:read']
    }
  }
})

function renderLogin() {
  return render(<AuthProvider><LoginPage /></AuthProvider>)
}

const emailLabel = /adresse e-mail/i
const passwordLabel = /mot de passe/i
const submitLabel = /se connecter/i

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('LoginPage (SCRUM-69)', () => {
  it('renders the email and password fields with a submit button', () => {
    renderLogin()
    expect(screen.getByLabelText(emailLabel)).toBeInTheDocument()
    expect(screen.getByLabelText(passwordLabel)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: submitLabel })).toBeInTheDocument()
  })

  it('reports validation errors for empty fields and does not call the API', () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    expect(screen.getByText(/adresse e-mail est obligatoire/i)).toBeInTheDocument()
    expect(screen.getByText(/mot de passe est obligatoire/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reports an error for an invalid email format', () => {
    renderLogin()
    const email = screen.getByLabelText(emailLabel)
    fireEvent.change(email, { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    expect(screen.getByText(/adresse e-mail valide/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('authenticates on valid credentials and integrates with the login API', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => loginBody() })
    renderLogin()
    const email = screen.getByLabelText(emailLabel)
    const password = screen.getByLabelText(passwordLabel)
    fireEvent.change(email, { target: { value: 'alice@example.com' } })
    fireEvent.change(password, { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    await waitFor(() => expect(screen.queryByText(/connexion en cours/i)).not.toBeInTheDocument())
    expect(screen.queryByText(/incorrect/i)).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'alice@example.com', password: 'secret123' })
    }))
  })

  it('shows an error for invalid credentials (401)', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 })
    renderLogin()
    const email = screen.getByLabelText(emailLabel)
    const password = screen.getByLabelText(passwordLabel)
    fireEvent.change(email, { target: { value: 'alice@example.com' } })
    fireEvent.change(password, { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    await waitFor(() => expect(screen.getByText(/incorrect/i)).toBeInTheDocument())
  })

  it('handles an API failure without exposing sensitive details', async () => {
    fetch.mockRejectedValueOnce(new Error('network down'))
    renderLogin()
    const email = screen.getByLabelText(emailLabel)
    const password = screen.getByLabelText(passwordLabel)
    fireEvent.change(email, { target: { value: 'alice@example.com' } })
    fireEvent.change(password, { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    await waitFor(() => expect(screen.getByText(/connexion au service impossible/i)).toBeInTheDocument())
  })

  it('displays a loading state and disables the submit button while authenticating', async () => {
    let resolve
    const pending = new Promise((r) => { resolve = r })
    fetch.mockReturnValueOnce(pending)
    renderLogin()
    const email = screen.getByLabelText(emailLabel)
    const password = screen.getByLabelText(passwordLabel)
    const submit = screen.getByRole('button', { name: submitLabel })
    fireEvent.change(email, { target: { value: 'alice@example.com' } })
    fireEvent.change(password, { target: { value: 'secret123' } })
    fireEvent.click(submit)
    await waitFor(() => expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument())
    expect(submit).toBeDisabled()
    resolve({ ok: true, status: 200, json: async () => loginBody() })
    await waitFor(() => expect(screen.queryByText(/connexion en cours/i)).not.toBeInTheDocument())
  })
})
