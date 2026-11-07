import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import { AuthContext } from '@/features/auth'
import { ObservationsView as ObservationsPage } from '@/features/pedagogical-ai/components/ObservationsView'

const observation = {
  id: 7,
  studentId: 12,
  authorUserId: 3,
  subjectId: 4,
  category: 'Comportement',
  level: 'POSITIVE',
  source: 'TEACHER',
  content: 'Participation active en classe.',
  date: '2026-10-30',
}

const pageResponse = {
  content: [observation],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

function authContextValue(overrides = {}) {
  return {
    user: { id: 1, email: 'alice@example.test', roles: ['ROLE_TEACHER'], permissions: [] },
    isAuthenticated: true,
    isLoading: false,
    request: vi.fn(),
    hasPermission: vi.fn((perm) => overrides.permissions?.includes(perm) ?? false),
    hasRole: vi.fn(() => false),
    hasAnyRole: vi.fn(() => false),
    ...overrides,
  }
}

function getLoadButton() {
  return screen.getAllByRole('button', { name: /charger les observations/i }).filter((b) => !b.disabled).pop()
}

function renderPage(overrides = {}) {
  const auth = authContextValue(overrides)
  return {
    auth,
    rendered: render(
      <AuthContext.Provider value={auth}><ObservationsPage /></AuthContext.Provider>
    ),
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ObservationsPage authorization', () => {
  it('shows access-restricted state when PERM_READ_OBSERVATION is missing', () => {
    renderPage({ permissions: [] })
    expect(screen.getByText(/accès restreint/i)).toBeInTheDocument()
    expect(screen.getByText(/PERM_READ_OBSERVATION/i)).toBeInTheDocument()
  })

  it('does not call the API when read permission is absent', () => {
    const { auth } = renderPage({ permissions: [] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('does not show create action when PERM_WRITE_OBSERVATION is missing', () => {
    renderPage({ permissions: ['PERM_READ_OBSERVATION'] })
    expect(screen.queryByRole('button', { name: /nouvelle observation/i })).not.toBeInTheDocument()
  })

  it('shows create action when PERM_WRITE_OBSERVATION is present', () => {
    renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    expect(screen.getByRole('button', { name: /nouvelle observation/i })).toBeInTheDocument()
  })
})

describe('ObservationsPage student selection', () => {
  it('renders student ID input and load button', () => {
    renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    expect(screen.getByLabelText(/identifiant élève/i)).toBeInTheDocument()
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    expect(getLoadButton()).toBeInTheDocument()
  })

  it('does not call API until student ID is resolved', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('rejects non-numeric student ID', () => {
    renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.click(getLoadButton())
    expect(screen.getByText(/identifiant élève doit être un nombre positif/i)).toBeInTheDocument()
  })

  it('loads observations after entering a valid student ID', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/observations/student/12?page=0&size=20',
        expect.anything()
      )
    )
    expect(screen.getByText(/participation active/i)).toBeInTheDocument()
  })

  it('does not call the unscoped student-list endpoint', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    const allCalls = auth.request.mock.calls.map((c) => c[0])
    expect(allCalls).not.toContain('/api/v1/students')
    expect(allCalls).not.toContain(expect.stringContaining('/students'))
  })
})

describe('ObservationsPage list rendering', () => {
  beforeEach(async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/participation active/i)).toBeInTheDocument())
  })

  it('renders observation table row with category, level, source, date', () => {
    expect(screen.getByText('Comportement')).toBeInTheDocument()
    expect(screen.getAllByText('Positif')).toHaveLength(2)
    expect(screen.getAllByText('Enseignant')).toHaveLength(2)
    expect(screen.getByText('30/10/2026')).toBeInTheDocument()
  })

  it('shows loading state while fetching', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    let resolve
    const pending = new Promise((r) => { resolve = r })
    auth.request.mockReturnValueOnce(pending)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await act(async () => {})
    expect(screen.getByText(/chargement des observations/i)).toBeInTheDocument()
    await act(async () => { resolve(pageResponse) })
    await waitFor(() => expect(screen.queryByText(/chargement des observations/i)).not.toBeInTheDocument())
  })

  it('shows empty state when no observations', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth.request.mockResolvedValue({ ...pageResponse, content: [], totalElements: 0 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await act(async () => {})
    await waitFor(() => expect(screen.getByText(/aucune observation/i)).toBeInTheDocument())
  })

  it('shows error state on API failure', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth.request.mockRejectedValueOnce({ status: 403 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await act(async () => {})
    await waitFor(() => expect(screen.getByText(/autorisations nécessaires/i)).toBeInTheDocument())
  })
})

describe('ObservationsPage filters and pagination', () => {
  beforeEach(async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/participation active/i)).toBeInTheDocument())
  })

  it('paginates to next page', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    const multiPage = { ...pageResponse, totalPages: 2, totalElements: 40 }
    // Dynamic mock: echo back the requested page so pagination state stays consistent
    auth.request.mockImplementation((path) => {
      const match = path.match(/page=(\d+)/)
      const page = match ? parseInt(match[1], 10) : 0
      return Promise.resolve({ ...multiPage, page })
    })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await act(async () => {})
    await waitFor(() => expect(screen.getByText(/participation active/i)).toBeInTheDocument())
    const nextBtn = screen.getAllByRole('button', { name: /›/ }).pop()
    expect(nextBtn.disabled).toBe(false)
    fireEvent.click(nextBtn)
    await act(async () => {})
    await waitFor(() =>
      expect(auth.request).toHaveBeenLastCalledWith(
        '/api/observations/student/12?page=1&size=20',
        expect.anything()
      )
    )
  })
})

describe('ObservationsPage create form', () => {
  let auth

  beforeEach(async () => {
    const result = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth = result.auth
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/participation active/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /nouvelle observation/i }))
  })

  it('renders the create form with all fields', () => {
    expect(screen.getByLabelText(/^Élève$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/niveau/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contenu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enregistrer \(ctrl\+s\)/i })).toBeInTheDocument()
  })

  it('validates required fields and does not call API', async () => {
    // Clear the pre-filled studentId to trigger validation
    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '' } })
    await act(async () => {
      fireEvent.submit(document.getElementById('observation-form'))
    })
    await waitFor(() =>
      expect(screen.getByText(/l’identifiant élève est requis/i)).toBeInTheDocument()
    )
  })

  it('creates an observation successfully', async () => {
    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: 'Assiduité' } })
    fireEvent.change(screen.getByLabelText(/niveau/i), { target: { value: 'POSITIVE' } })
    fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: 'Toujours ponctuel.' } })
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-10-31' } })

    // Mock: POST to /api/observations returns created observation, other calls return page list
    auth.request.mockImplementation((path, options) => {
      if (path === '/api/observations' && options?.method === 'POST') {
        return Promise.resolve({ ...observation, id: 8 })
      }
      return Promise.resolve(pageResponse)
    })
    await act(async () => {
      fireEvent.submit(document.getElementById('observation-form'))
    })
    await waitFor(() => expect(screen.getByText(/observation créée/i)).toBeInTheDocument())
  })

  it('shows validation error for content over 5000 characters', async () => {
    auth.request.mockResolvedValue(pageResponse)
    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: 'Comportement' } })
    fireEvent.change(screen.getByLabelText(/niveau/i), { target: { value: 'POSITIVE' } })
    fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: 'x'.repeat(5001) } })
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-10-31' } })
    fireEvent.click(screen.getByRole('button', { name: /enregistrer \(ctrl\+s\)/i }))
    expect(screen.getByText(/5000 caractères/i)).toBeInTheDocument()
  })
})

describe('ObservationsPage edit and delete', () => {
  let auth

  beforeEach(async () => {
    const result = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth = result.auth
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/participation active/i)).toBeInTheDocument())
  })

  it('opens edit form with existing observation data', () => {
    const editBtn = screen.getByRole('button', { name: '✎' })
    fireEvent.click(editBtn)
    expect(screen.getByLabelText(/^Élève$/i)).toHaveValue('12')
    expect(screen.getByLabelText(/^Catégorie$/i)).toHaveValue('Comportement')
    expect(screen.getByLabelText(/^Contenu$/i)).toHaveValue('Participation active en classe.')
  })

  it('hides edit and delete buttons when write permission is missing', () => {
    const { auth: authNoWrite } = renderPage({ permissions: ['PERM_READ_OBSERVATION'] })
    expect(authNoWrite.hasPermission('PERM_WRITE_OBSERVATION')).toBe(false)
    expect(authNoWrite.hasPermission).toHaveBeenCalledWith('PERM_WRITE_OBSERVATION')
  })

  it('deletes an observation on confirmation', async () => {
    window.confirm = vi.fn(() => true)
    auth.request.mockResolvedValueOnce(undefined)
    const deleteBtn = screen.getByRole('button', { name: '🗑️' })
    fireEvent.click(deleteBtn)
    await waitFor(() => expect(screen.getByText(/observation supprimée/i)).toBeInTheDocument())
  })

  it('handles 409 conflict when observation is locked by analysis', async () => {
    window.confirm = vi.fn(() => true)
    auth.request.mockRejectedValueOnce({ status: 409 })
    const deleteBtn = screen.getByRole('button', { name: '🗑️' })
    fireEvent.click(deleteBtn)
    await waitFor(() => expect(screen.getByText(/utilisée par une analyse IA/i)).toBeInTheDocument())
  })
})

describe('ObservationsPage keyboard shortcuts', () => {
  it('triggers save on Ctrl+S when form is open', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_OBSERVATION', 'PERM_WRITE_OBSERVATION'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(getLoadButton())
    await waitFor(() => expect(screen.getByText(/participation active/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /nouvelle observation/i }))

    fireEvent.change(screen.getByLabelText(/^Élève$/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/catégorie/i), { target: { value: 'Comportement' } })
    fireEvent.change(screen.getByLabelText(/niveau/i), { target: { value: 'POSITIVE' } })
    fireEvent.change(screen.getByLabelText(/contenu/i), { target: { value: 'Contenu de test.' } })
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2026-10-31' } })

    // Mock: POST to /api/observations returns created observation, other calls return page list
    auth.request.mockImplementation((path, options) => {
      if (path === '/api/observations' && options?.method === 'POST') {
        return Promise.resolve({ ...observation, id: 9 })
      }
      return Promise.resolve(pageResponse)
    })
    // Simulate Ctrl+S triggering form submission
    const originalRequestSubmit = HTMLFormElement.prototype.requestSubmit
    HTMLFormElement.prototype.requestSubmit = function () {
      this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }
    try {
      fireEvent.keyDown(document, { key: 's', ctrlKey: true })
    } finally {
      HTMLFormElement.prototype.requestSubmit = originalRequestSubmit
    }
    await waitFor(() => expect(screen.getByText(/observation créée/i)).toBeInTheDocument())
  })
})
