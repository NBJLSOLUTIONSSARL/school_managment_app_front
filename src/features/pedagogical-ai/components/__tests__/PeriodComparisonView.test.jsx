import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthContext } from '@/features/auth'
import { PeriodComparisonView } from '../PeriodComparisonView'

const mockComparison = {
  studentId: 12,
  studentName: 'Léa Martin',
  term1Id: 1,
  term2Id: 2,
  term1: {
    termId: 1,
    status: 'VALIDATED',
    summary: 'Bonne participation mais quelques difficultés.',
    strengths: 'Rigueur en écriture.',
    difficulties: 'Calcul des fractions.',
  },
  term2: {
    termId: 2,
    status: 'PUBLISHED',
    summary: 'Nette progression générale.',
    strengths: 'Excellente participation et progrès en calcul.',
    difficulties: 'Maintien de la concentration en fin de journée.',
  },
  term1Average: 12.5,
  term2Average: 14.5,
  deltaAverage: 2.0,
  trend: 'IMPROVING',
  evolvingRecommendations: [
    'Consolider les acquis en calcul fractionnaire.',
    'Mettre en place des pauses actives en classe.',
  ],
  followUpActions: [
    {
      id: 101,
      description: 'Soutien hebdomadaire en fractions',
      done: false,
      carriedForward: true,
      dueDate: '2026-11-20',
    },
    {
      id: 102,
      description: 'Présentation de projet en histoire',
      done: true,
      carriedForward: false,
      dueDate: '2026-10-15',
    },
  ],
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

function renderView(props = {}, overrides = {}) {
  const auth = authContextValue({
    permissions: ['PERM_READ_ANALYSIS', 'PERM_READ_CONSENT'],
    ...overrides,
  })
  return {
    auth,
    rendered: render(
      <AuthContext.Provider value={auth}>
        <PeriodComparisonView {...props} />
      </AuthContext.Provider>
    ),
  }
}

describe('PeriodComparisonView authorization', () => {
  it('shows access restricted when PERM_READ_ANALYSIS is missing', () => {
    renderView({}, { permissions: [] })
    expect(screen.getByText(/accès restreint/i)).toBeInTheDocument()
  })
})

describe('PeriodComparisonView inputs & validation', () => {
  it('renders student, term1 and term2 inputs and compare button', () => {
    renderView()
    expect(screen.getByLabelText(/identifiant élève/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/période 1/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/période 2/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comparer les périodes/i })).toBeInTheDocument()
  })

  it('validates that student, term 1 and term 2 must be positive numbers', async () => {
    renderView()
    const studentInput = screen.getByLabelText(/identifiant élève/i)
    const term1Input = screen.getByLabelText(/période 1/i)
    const term2Input = screen.getByLabelText(/période 2/i)
    const compareBtn = screen.getByRole('button', { name: /comparer les périodes/i })

    fireEvent.change(studentInput, { target: { value: 'abc' } })
    fireEvent.change(term1Input, { target: { value: '1' } })
    fireEvent.change(term2Input, { target: { value: '2' } })
    fireEvent.click(compareBtn)

    expect(screen.getByText(/identifiant élève doit être un nombre positif/i)).toBeInTheDocument()
  })

  it('rejects when term1 and term2 are identical', async () => {
    renderView()
    const studentInput = screen.getByLabelText(/identifiant élève/i)
    const term1Input = screen.getByLabelText(/période 1/i)
    const term2Input = screen.getByLabelText(/période 2/i)
    const compareBtn = screen.getByRole('button', { name: /comparer les périodes/i })

    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.change(term1Input, { target: { value: '1' } })
    fireEvent.change(term2Input, { target: { value: '1' } })
    fireEvent.click(compareBtn)

    expect(screen.getByText(/sélectionner deux périodes distinctes/i)).toBeInTheDocument()
  })
})

describe('PeriodComparisonView side-by-side progress & delta in averages', () => {
  it('loads and displays comparison side-by-side with delta', async () => {
    const { auth } = renderView()
    auth.request.mockImplementation((url) => {
      if (url.includes('/ai-consents')) {
        return Promise.resolve({
          content: [{ id: 1, studentId: 12, guardianId: 1, granted: true, grantedAt: '2026-09-01' }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        })
      }
      if (url.includes('/compare')) {
        return Promise.resolve(mockComparison)
      }
      return Promise.resolve({})
    })

    const studentInput = screen.getByLabelText(/identifiant élève/i)
    const term1Input = screen.getByLabelText(/période 1/i)
    const term2Input = screen.getByLabelText(/période 2/i)
    const compareBtn = screen.getByRole('button', { name: /comparer les périodes/i })

    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.change(term1Input, { target: { value: '1' } })
    fireEvent.change(term2Input, { target: { value: '2' } })
    fireEvent.click(compareBtn)

    await waitFor(() => {
      expect(screen.getByText(/Léa Martin/i)).toBeInTheDocument()
    })

    // Verify side-by-side columns
    expect(screen.getByText(/Bonne participation mais quelques difficultés/i)).toBeInTheDocument()
    expect(screen.getByText(/Nette progression générale/i)).toBeInTheDocument()

    // Verify delta in averages
    expect(screen.getByText(/\+2 pts • Progression positive/i)).toBeInTheDocument()
    expect(screen.getByText(/12.5 \/ 20/i)).toBeInTheDocument()
    expect(screen.getByText(/14.5 \/ 20/i)).toBeInTheDocument()

    // Verify evolving recommendations
    expect(screen.getByText(/Consolider les acquis en calcul fractionnaire/i)).toBeInTheDocument()
    expect(screen.getByText(/Mettre en place des pauses actives en classe/i)).toBeInTheDocument()
  })
})

describe('PeriodComparisonView follow-up actions & carried-forward tracking', () => {
  it('displays follow-up actions with carried-forward indicators and allows status toggle', async () => {
    const { auth } = renderView()
    auth.request.mockImplementation((url) => {
      if (url.includes('/ai-consents')) {
        return Promise.resolve({
          content: [{ id: 1, studentId: 12, guardianId: 1, granted: true, grantedAt: '2026-09-01' }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        })
      }
      if (url.includes('/compare')) {
        return Promise.resolve(mockComparison)
      }
      return Promise.resolve({})
    })

    const studentInput = screen.getByLabelText(/identifiant élève/i)
    const term1Input = screen.getByLabelText(/période 1/i)
    const term2Input = screen.getByLabelText(/période 2/i)
    const compareBtn = screen.getByRole('button', { name: /comparer les périodes/i })

    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.change(term1Input, { target: { value: '1' } })
    fireEvent.change(term2Input, { target: { value: '2' } })
    fireEvent.click(compareBtn)

    await waitFor(() => {
      expect(screen.getByText(/Soutien hebdomadaire en fractions/i)).toBeInTheDocument()
    })

    // Check carried-forward badge
    expect(screen.getByText(/Reportée de la P1/i)).toBeInTheDocument()
    expect(screen.getByText(/Initiale/i)).toBeInTheDocument()

    // Check initial statuses
    expect(screen.getByText(/À faire/i)).toBeInTheDocument()
    expect(screen.getByText(/Terminée/i)).toBeInTheDocument()

    // Toggle the first action
    const checkbox = screen.getByLabelText(/Basculer action 101/i)
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    expect(screen.getByText(/Statut de l’action de suivi mis à jour/i)).toBeInTheDocument()
  })
})

describe('PeriodComparisonView consent handling', () => {
  it('locks detailed content when parental consent is revoked', async () => {
    const { auth } = renderView()
    auth.request.mockImplementation((url) => {
      if (url.includes('/ai-consents')) {
        return Promise.resolve({
          content: [{ id: 1, studentId: 12, guardianId: 1, granted: false }],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        })
      }
      if (url.includes('/compare')) {
        return Promise.resolve(mockComparison)
      }
      return Promise.resolve({})
    })

    const studentInput = screen.getByLabelText(/identifiant élève/i)
    const term1Input = screen.getByLabelText(/période 1/i)
    const term2Input = screen.getByLabelText(/période 2/i)
    const compareBtn = screen.getByRole('button', { name: /comparer les périodes/i })

    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.change(term1Input, { target: { value: '1' } })
    fireEvent.change(term2Input, { target: { value: '2' } })
    fireEvent.click(compareBtn)

    await waitFor(() => {
      expect(screen.getByText(/Consentement parental révoqué/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Détails pédagogiques verrouillés/i)).toBeInTheDocument()
    expect(screen.queryByText(/Calcul des fractions/i)).not.toBeInTheDocument()
  })
})
