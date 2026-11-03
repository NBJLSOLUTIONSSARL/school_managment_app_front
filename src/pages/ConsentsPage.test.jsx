import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthContext } from '../auth/AuthContext'
import ConsentsPage from './ConsentsPage'

const consent = {
  id: 7,
  studentId: 12,
  guardianId: 3,
  granted: true,
  grantedAt: '2026-10-30T14:32:00',
}

const pageResponse = {
  content: [consent],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

function authContextValue(overrides = {}) {
  return {
    user: { id: 1, email: 'alice@example.test', roles: ['ROLE_PARENT'], permissions: [] },
    isAuthenticated: true,
    isLoading: false,
    request: vi.fn(),
    hasPermission: vi.fn((perm) => overrides.permissions?.includes(perm) ?? false),
    hasRole: vi.fn(() => false),
    hasAnyRole: vi.fn(() => false),
    ...overrides,
  }
}

function renderPage(overrides = {}) {
  const auth = authContextValue(overrides)
  return {
    auth,
    rendered: render(
      <AuthContext.Provider value={auth}><ConsentsPage /></AuthContext.Provider>
    ),
  }
}

function getLoadButton() {
  return screen.getAllByRole('button', { name: /charger les consentements/i }).find((b) => !b.disabled)
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ConsentsPage authorization', () => {
  it('shows access-restricted state when PERM_READ_CONSENT is missing', () => {
    renderPage({ permissions: [] })
    expect(screen.getByText(/accès restreint/i)).toBeInTheDocument()
    expect(screen.getByText(/PERM_READ_CONSENT/i)).toBeInTheDocument()
  })

  it('does not call the API when read permission is absent', () => {
    const { auth } = renderPage({ permissions: [] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('does not show manage action when PERM_WRITE_CONSENT is missing', () => {
    renderPage({ permissions: ['PERM_READ_CONSENT'] })
    expect(screen.queryByRole('button', { name: /gérer le consentement/i })).not.toBeInTheDocument()
  })

  it('shows manage action when PERM_WRITE_CONSENT is present', () => {
    renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    expect(screen.getByRole('button', { name: /gérer le consentement/i })).toBeInTheDocument()
  })
})

describe('ConsentsPage student selection', () => {
  it('renders student ID input and load button', () => {
    renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    expect(screen.getByLabelText(/identifiant élève/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /charger les consentements/i })).toBeInTheDocument()
  })

  it('does not call API until student ID is resolved', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('rejects non-numeric student ID', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.click(getLoadButton())
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('loads consents after entering a valid student ID', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith('/api/ai-consents/student/12?page=0&size=20')
    )
    expect(screen.getByText(/tuteur #3/i)).toBeInTheDocument()
    expect(screen.getByText(/oui/i)).toBeInTheDocument()
  })

  it('does not call the unscoped student-list endpoint', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    const allCalls = auth.request.mock.calls.map((c) => c[0])
    expect(allCalls).not.toContain('/api/v1/students')
    expect(allCalls).not.toContain(expect.stringContaining('/students'))
  })
})

describe('ConsentsPage list rendering', () => {
  it('renders consent row with student, guardian, status, date', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/tuteur #3/i)).toBeInTheDocument())
    expect(screen.getByText(/Oui/)).toBeInTheDocument()
    expect(screen.getByText(/30\/10\/2026/)).toBeInTheDocument()
  })

  it('shows loading state while fetching', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    let resolve
    const pending = new Promise((r) => { resolve = r })
    auth.request.mockReturnValueOnce(pending)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/chargement des consentements/i)).toBeInTheDocument())
    resolve(pageResponse)
    await waitFor(() => expect(screen.queryByText(/chargement des consentements/i)).not.toBeInTheDocument())
  })

  it('shows empty state when no consents', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth.request.mockResolvedValue({ ...pageResponse, content: [], totalElements: 0 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/aucun consentement enregistré/i)).toBeInTheDocument())
  })

  it('shows error state on API failure', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth.request.mockRejectedValueOnce({ status: 403 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/autorisations nécessaires/i)).toBeInTheDocument())
  })
})

describe('ConsentsPage pagination', () => {
  it('paginates to next page', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth.request.mockResolvedValue({ ...pageResponse, totalPages: 2 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/tuteur #3/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /›/ }).pop())
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith('/api/ai-consents/student/12?page=1&size=20')
    )
  })
})

describe('ConsentsPage consent form', () => {
  let auth

  beforeEach(async () => {
    const result = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth = result.auth
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/tuteur #3/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /gérer le consentement/i }))
  })

  it('renders the form with student and grant toggle', () => {
    expect(screen.getByLabelText(/^Élève$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/j'autorise l'analyse pédagogique ia/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enregistrer \(ctrl\+s\)/i })).toBeInTheDocument()
  })

  it('validates required fields and does not call API', async () => {
    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /enregistrer \(ctrl\+s\)/i }))
    expect(auth.request).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/ai-consents'),
      expect.anything()
    )
  })

  it('records a consent successfully', async () => {
    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '12' } })
    fireEvent.click(screen.getByLabelText(/j'autorise l'analyse pédagogique ia/i))

    auth.request.mockResolvedValueOnce({ ...consent, granted: true })
    fireEvent.click(screen.getByRole('button', { name: /enregistrer \(ctrl\+s\)/i }))
    await waitFor(() => expect(screen.getByText(/consentement accordé/i)).toBeInTheDocument())
  })

  it('records a consent refusal successfully', async () => {
    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '12' } })
    fireEvent.click(screen.getByLabelText(/j'autorise l'analyse pédagogique ia/i))
    fireEvent.click(screen.getByLabelText(/j'autorise l'analyse pédagogique ia/i))

    auth.request.mockResolvedValueOnce({ ...consent, granted: false, grantedAt: null })
    fireEvent.click(screen.getByRole('button', { name: /enregistrer \(ctrl\+s\)/i }))
    await waitFor(() => expect(screen.getByText(/consentement révoqué/i)).toBeInTheDocument())
  })
})

describe('ConsentsPage revoke', () => {
  let auth

  beforeEach(async () => {
    const result = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    auth = result.auth
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/tuteur #3/i)).toBeInTheDocument())
  })

  it('revokes a consent on confirmation', async () => {
    window.confirm = vi.fn(() => true)
    auth.request.mockResolvedValueOnce({ ...consent, granted: false, grantedAt: null })
    const revokeBtn = screen.getAllByRole('button', { name: '🗑️' })[0]
    fireEvent.click(revokeBtn)
    await waitFor(() => expect(screen.getByText(/consentement révoqué/i)).toBeInTheDocument())
  })

  it('handles 403 when revoking a consent not owned by the guardian', async () => {
    window.confirm = vi.fn(() => true)
    auth.request.mockRejectedValueOnce({ status: 403 })
    const revokeBtn = screen.getAllByRole('button', { name: '🗑️' })[0]
    fireEvent.click(revokeBtn)
    await waitFor(() => expect(screen.getByText(/autorisations nécessaires/i)).toBeInTheDocument())
  })
})

describe('ConsentsPage keyboard shortcuts', () => {
  it('triggers save on Ctrl+S when form is open', async () => {
    const result = renderPage({ permissions: ['PERM_READ_CONSENT', 'PERM_WRITE_CONSENT'] })
    const nextAuth = result.auth
    nextAuth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/tuteur #3/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /gérer le consentement/i }))

    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '12' } })
    fireEvent.click(screen.getByLabelText(/j'autorise l'analyse pédagogique ia/i))

    nextAuth.request.mockResolvedValueOnce({ ...consent, id: 9 })
    fireEvent.keyDown(document, { key: 's', ctrlKey: true })
    await waitFor(() => expect(screen.getByText(/consentement accordé/i)).toBeInTheDocument())
  })
})
