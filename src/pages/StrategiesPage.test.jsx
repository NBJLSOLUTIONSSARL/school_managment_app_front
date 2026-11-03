import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { AuthContext } from '../auth/AuthContext'
import StrategiesPage from './StrategiesPage'

const strategy = {
  id: 1,
  analysisId: 42,
  goals: 'Renforcer la régularité du travail personnel et la participation orale.',
  recommendations: 'Mettre en place un plan de travail hebdomadaire.',
  parentAdvice: 'Valoriser les progrès de l’enfant et maintenir un cadre calme.',
  studentAdvice: 'Noter les devoirs dans l’agenda et demander de l’aide.',
}

const followUpAction = {
  id: 10,
  strategyId: 1,
  description: 'Point de contrôle hebdomadaire avec l’enseignant',
  dueDate: '2026-11-15',
  done: false,
}

const actionsResponse = {
  content: [followUpAction],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

function authContextValue(overrides = {}) {
  return {
    user: { id: 1, email: 'alice@school.test', roles: ['ROLE_TEACHER'], permissions: [] },
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
      <AuthContext.Provider value={auth}>
        <StrategiesPage />
      </AuthContext.Provider>
    ),
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('StrategiesPage authorization', () => {
  it('shows access-restricted state when PERM_READ_ANALYSIS is missing', () => {
    renderPage({ permissions: [] })
    expect(screen.getByText(/accès restreint/i)).toBeInTheDocument()
    expect(screen.getByText(/PERM_READ_ANALYSIS/i)).toBeInTheDocument()
  })

  it('does not call the API when read permission is absent', () => {
    const { auth } = renderPage({ permissions: [] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('does not show manual create section when PERM_WRITE_STRATEGY is missing', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS'] })
    expect(screen.queryByRole('heading', { name: /création manuelle/i })).not.toBeInTheDocument()
  })

  it('shows manual create section when PERM_WRITE_STRATEGY is present', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    expect(screen.getByRole('heading', { name: /création manuelle/i })).toBeInTheDocument()
  })
})

describe('StrategiesPage strategy loading', () => {
  it('renders strategy ID input and load button', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    expect(screen.getByLabelText(/identifiant de stratégie/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /charger/i })).toBeInTheDocument()
  })

  it('rejects non-numeric strategy ID', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    expect(screen.getByText(/identifiant de stratégie doit être un nombre positif/i)).toBeInTheDocument()
  })

  it('loads strategy and its follow-up actions after entering valid strategy ID', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url) => {
      if (url.includes('/follow-up-actions')) return Promise.resolve(actionsResponse)
      if (url.includes('/api/learning-strategies/1')) return Promise.resolve(strategy)
      return Promise.reject(new Error('Unknown url: ' + url))
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))

    await waitFor(() => expect(screen.getByDisplayValue(strategy.goals)).toBeInTheDocument())
    expect(screen.getByDisplayValue(strategy.recommendations)).toBeInTheDocument()
    expect(screen.getByDisplayValue(strategy.parentAdvice)).toBeInTheDocument()
    expect(screen.getByDisplayValue(strategy.studentAdvice)).toBeInTheDocument()
    expect(screen.getByText(followUpAction.description)).toBeInTheDocument()
  })

  it('shows error state when strategy not found', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockRejectedValueOnce({ status: 404 })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))

    await waitFor(() => expect(screen.getByText(/n'existe pas/i)).toBeInTheDocument())
  })
})

describe('StrategiesPage editing and validation', () => {
  it('updates a strategy successfully', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url, opts) => {
      if (opts?.method === 'PUT') return Promise.resolve({ ...strategy, goals: 'Nouveaux objectifs valides' })
      if (url.includes('/follow-up-actions')) return Promise.resolve(actionsResponse)
      if (url.includes('/api/learning-strategies/1')) return Promise.resolve(strategy)
      return Promise.resolve(strategy)
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    await waitFor(() => expect(screen.getByDisplayValue(strategy.goals)).toBeInTheDocument())

    const goalsInput = screen.getByLabelText(/objectifs pédagogiques/i)
    fireEvent.change(goalsInput, { target: { value: 'Nouveaux objectifs valides' } })

    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/learning-strategies/1',
        expect.objectContaining({ method: 'PUT' })
      )
    )
    expect(screen.getByText(/mise à jour avec succès/i)).toBeInTheDocument()
  })

  it('validates required fields with Yup and displays error messages', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url) => {
      if (url.includes('/follow-up-actions')) return Promise.resolve(actionsResponse)
      return Promise.resolve(strategy)
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    await waitFor(() => expect(screen.getByDisplayValue(strategy.goals)).toBeInTheDocument())

    const goalsInput = screen.getByLabelText(/objectifs pédagogiques/i)
    fireEvent.change(goalsInput, { target: { value: 'abc' } }) // Less than 5 chars

    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    expect(screen.getByText(/au moins 5 caractères/i)).toBeInTheDocument()
    expect(auth.request).not.toHaveBeenCalledWith('/api/learning-strategies/1', expect.objectContaining({ method: 'PUT' }))
  })

  it('handles 409 conflict when strategy is locked / not draft', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url, opts) => {
      if (opts?.method === 'PUT') return Promise.reject({ status: 409 })
      if (url.includes('/follow-up-actions')) return Promise.resolve(actionsResponse)
      return Promise.resolve(strategy)
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    await waitFor(() => expect(screen.getByDisplayValue(strategy.goals)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => expect(screen.getByText(/état actuel/i)).toBeInTheDocument())
  })

  it('triggers save via Ctrl+S shortcut', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url, opts) => {
      if (opts?.method === 'PUT') return Promise.resolve(strategy)
      if (url.includes('/follow-up-actions')) return Promise.resolve(actionsResponse)
      return Promise.resolve(strategy)
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    await waitFor(() => expect(screen.getByDisplayValue(strategy.goals)).toBeInTheDocument())

    fireEvent.keyDown(window, { key: 's', ctrlKey: true })

    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/learning-strategies/1',
        expect.objectContaining({ method: 'PUT' })
      )
    )
  })
})

describe('StrategiesPage follow-up actions', () => {
  it('displays follow-up actions and allows status filtering', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url) => {
      if (url.includes('/follow-up-actions')) return Promise.resolve(actionsResponse)
      return Promise.resolve(strategy)
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    await waitFor(() => expect(screen.getByText(followUpAction.description)).toBeInTheDocument())

    const filterSelect = screen.getByLabelText(/filtrer par statut/i)
    fireEvent.change(filterSelect, { target: { value: 'true' } })

    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        expect.stringContaining('done=true'),
        expect.anything()
      )
    )
  })

  it('shows empty state when no follow-up actions exist', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_WRITE_STRATEGY'] })
    auth.request.mockImplementation((url) => {
      if (url.includes('/follow-up-actions')) {
        return Promise.resolve({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
      }
      return Promise.resolve(strategy)
    })

    const input = screen.getByLabelText(/identifiant de stratégie/i)
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /charger/i }))
    await waitFor(() => expect(screen.getByText(/aucune action de suivi/i)).toBeInTheDocument())
  })
})
