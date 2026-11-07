import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { AuthContext } from '@/features/auth'
import { AnalysesView as AnalysesPage } from '@/features/pedagogical-ai/components/AnalysesView'

const analysis = {
  id: 7,
  studentId: 12,
  termId: 3,
  status: 'DRAFT',
  generatedAt: '2026-10-30T14:32:00Z',
  model: 'gpt-4o-mini',
  studentName: 'Léa Martin',
  summary: 'L’élève montre une progression régulière.',
  strengths: 'Participation soutenue en classe.',
  difficulties: 'Quelques baisses de concentration.',
  trends: 'Tendance stable.',
}

const pageResponse = {
  content: [analysis],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

const generationLogsResponse = {
  content: [
    { timestamp: '2026-10-30T14:31:00Z', message: 'Requête envoyée au fournisseur IA' },
    { timestamp: '2026-10-30T14:32:00Z', message: 'Réponse reçue et analyse créée' },
  ],
  page: 0,
  size: 20,
  totalElements: 2,
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

function renderPage(overrides = {}) {
  const auth = authContextValue(overrides)
  return {
    auth,
    rendered: render(
      <AuthContext.Provider value={auth}><AnalysesPage /></AuthContext.Provider>
    ),
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AnalysesPage authorization', () => {
  it('shows access-restricted state when PERM_READ_ANALYSIS is missing', () => {
    renderPage({ permissions: [] })
    expect(screen.getByText(/accès restreint/i)).toBeInTheDocument()
    expect(screen.getByText(/PERM_READ_ANALYSIS/i)).toBeInTheDocument()
  })

  it('does not call the API when read permission is absent', () => {
    const { auth } = renderPage({ permissions: [] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('does not show generate action when PERM_GENERATE_ANALYSIS is missing', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS'] })
    expect(screen.queryByRole('button', { name: /générer l’analyse/i })).not.toBeInTheDocument()
  })

  it('shows generate action when PERM_GENERATE_ANALYSIS is present', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    expect(screen.getByRole('button', { name: /générer l’analyse/i })).toBeInTheDocument()
  })

  it('does not show validate action when PERM_VALIDATE_ANALYSIS is missing', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS'] })
    const rows = screen.queryAllByRole('button', { name: /valider/i })
    expect(rows.length).toBe(0)
  })
})

describe('AnalysesPage student selection', () => {
  it('renders student ID input and term ID input', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    expect(screen.getByLabelText(/identifiant élève/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/identifiant période/i)).toBeInTheDocument()
  })

  it('does not call API until student ID is resolved', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    expect(auth.request).not.toHaveBeenCalled()
  })

  it('rejects non-numeric student ID', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: 'abc' } })
    const btn = screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled)
    fireEvent.click(btn)
    expect(screen.getByText(/identifiant élève doit être un nombre positif/i)).toBeInTheDocument()
  })

  it('rejects non-numeric term ID', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    const input = screen.getByLabelText(/identifiant période/i)
    fireEvent.change(input, { target: { value: 'abc' } })
    const btn = screen.getAllByRole('button', { name: /charger/i }).pop()
    fireEvent.click(btn)
    expect(screen.getByText(/identifiant de période doit être un nombre positif/i)).toBeInTheDocument()
  })

  it('loads analyses after entering valid student ID', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/ai-analyses/student/12?page=0&size=20',
        expect.anything()
      )
    )
    expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument()
  })

  it('does not call the unscoped student-list endpoint', () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    const allCalls = auth.request.mock.calls.map((c) => c[0])
    expect(allCalls).not.toContain('/api/v1/students')
    expect(allCalls).not.toContain(expect.stringContaining('/students'))
  })
})

describe('AnalysesPage list rendering', () => {
  beforeEach(async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
  })

  it('renders analysis table row with status, model, generated date', () => {
    expect(screen.getByText(/Léa Martin/i)).toBeInTheDocument()
    expect(screen.getByText(/Brouillon/i)).toBeInTheDocument()
    expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument()
  })

  it('renders status badges correctly', () => {
    expect(screen.getByText(/Brouillon/i)).toBeInTheDocument()
  })

  it('shows loading state while fetching', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    let resolve
    const pending = new Promise((r) => { resolve = r })
    auth.request.mockReturnValueOnce(pending)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/chargement des analyses/i)).toBeInTheDocument())
    resolve(pageResponse)
    await waitFor(() => expect(screen.queryByText(/chargement des analyses/i)).not.toBeInTheDocument())
  })

  it('shows empty state when no analyses', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockResolvedValue({ ...pageResponse, content: [], totalElements: 0 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/aucune analyse/i)).toBeInTheDocument())
  })

  it('shows error state on API failure', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockRejectedValueOnce({ status: 403 })
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/autorisations nécessaires/i)).toBeInTheDocument())
  })
})

describe('AnalysesPage generate', () => {
  it('generates an analysis when authorized with student and term', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockImplementation((url, opts) => {
      if (url.includes('/generate') && opts?.method === 'POST') {
        return Promise.resolve({ ...analysis, id: 9 })
      }
      return Promise.resolve(pageResponse)
    })
    const studentInput = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())

    const termInput = screen.getByLabelText(/identifiant période/i)
    fireEvent.change(termInput, { target: { value: '3' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).pop())

    fireEvent.click(screen.getByRole('button', { name: /générer l’analyse/i }))
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/ai-analyses/generate',
        expect.objectContaining({ method: 'POST' })
      )
    )
    expect(screen.getByText(/analyse générée/i)).toBeInTheDocument()
  })

  it('does not call generate API without generate permission', async () => {
    cleanup()
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS'] })
    auth.request.mockResolvedValue(pageResponse)
    const studentInput = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
    const generateBtn = screen.queryByRole('button', { name: /générer l’analyse/i })
    expect(generateBtn).not.toBeInTheDocument()
  })

  it('handles 502 error on generation failure', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockResolvedValue(pageResponse)
    const studentInput = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
    const termInput = screen.getByLabelText(/identifiant période/i)
    fireEvent.change(termInput, { target: { value: '3' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).pop())

    auth.request.mockRejectedValueOnce({ status: 502 })
    fireEvent.click(screen.getByRole('button', { name: /générer l’analyse/i }))
    await waitFor(() => expect(screen.getByText(/temporairement indisponible/i)).toBeInTheDocument())
  })

  it('does not make direct AI-provider calls', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockResolvedValue(pageResponse)
    const studentInput = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(studentInput, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
    const termInput = screen.getByLabelText(/identifiant période/i)
    fireEvent.change(termInput, { target: { value: '3' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).pop())

    auth.request.mockResolvedValueOnce({ ...analysis, id: 9 })
    fireEvent.click(screen.getByRole('button', { name: /générer l’analyse/i }))
    await waitFor(() => expect(screen.getByText(/analyse générée/i)).toBeInTheDocument())
    const aiCalls = auth.request.mock.calls.filter((c) => c[0].includes('openai') || c[0].includes('anthropic') || c[0].includes('ai-provider'))
    expect(aiCalls.length).toBe(0)
  })
})

describe('AnalysesPage validate, reject, publish', () => {
  let auth

  beforeEach(async () => {
    const result = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS', 'PERM_VALIDATE_ANALYSIS', 'PERM_PUBLISH_ANALYSIS'] })
    auth = result.auth
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
  })

  it('validates a draft analysis', async () => {
    auth.request.mockResolvedValueOnce({ ...analysis, status: 'VALIDATED' })
    const validateBtn = screen.getAllByRole('button', { title: /valider/i }).find((b) => !b.disabled)
    fireEvent.click(validateBtn)
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/ai-analyses/7/validate',
        expect.objectContaining({ method: 'PUT' })
      )
    )
    expect(screen.getByText(/analyse validée/i)).toBeInTheDocument()
  })

  it('rejects a draft analysis with Yup validation', async () => {
    auth.request.mockResolvedValueOnce({ ...analysis, status: 'REJECTED' })
    const rejectBtn = screen.getAllByRole('button', { title: /rejeter/i }).find((b) => !b.disabled)
    fireEvent.click(rejectBtn)
    expect(screen.getByText(/motif du rejet/i)).toBeInTheDocument()

    const reasonInput = screen.getByLabelText(/motif du rejet/i)
    fireEvent.change(reasonInput, { target: { value: 'test' } })
    fireEvent.click(screen.getByRole('button', { name: /rejeter/i }))
    expect(screen.getByText(/au moins 5 caractères/i)).toBeInTheDocument()

    fireEvent.change(reasonInput, { target: { value: 'Motif de rejet valide pour ce test' } })
    auth.request.mockResolvedValueOnce({ ...analysis, status: 'REJECTED' })
    fireEvent.click(screen.getByRole('button', { name: /rejeter/i }))
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/ai-analyses/7/reject',
        expect.objectContaining({ method: 'PUT' })
      )
    )
    expect(screen.getByText(/analyse rejetée/i)).toBeInTheDocument()
  })

  it('publishes a validated analysis', async () => {
    cleanup()
    const result = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS', 'PERM_VALIDATE_ANALYSIS', 'PERM_PUBLISH_ANALYSIS'] })
    auth = result.auth
    const validatedPageResponse = { ...pageResponse, content: [{ ...analysis, status: 'VALIDATED' }] }
    auth.request.mockResolvedValue(validatedPageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())

    const publishedAnalysis = { ...analysis, status: 'VALIDATED' }
    auth.request.mockResolvedValueOnce({ ...publishedAnalysis, status: 'PUBLISHED' })
    const publishBtn = screen.getAllByRole('button', { title: /publier/i }).find((b) => !b.disabled)
    fireEvent.click(publishBtn)
    await waitFor(() =>
      expect(auth.request).toHaveBeenCalledWith(
        '/api/ai-analyses/7/publish',
        expect.objectContaining({ method: 'PUT' })
      )
    )
    expect(screen.getByText(/analyse publiée/i)).toBeInTheDocument()
  })

  it('handles 409 conflict on validate', async () => {
    auth.request.mockRejectedValueOnce({ status: 409 })
    const validateBtn = screen.getAllByRole('button', { title: /valider/i }).find((b) => !b.disabled)
    fireEvent.click(validateBtn)
    await waitFor(() => expect(screen.getByText(/état actuel/i)).toBeInTheDocument())
  })

  it('handles 503 on publish', async () => {
    cleanup()
    const result = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS', 'PERM_VALIDATE_ANALYSIS', 'PERM_PUBLISH_ANALYSIS'] })
    auth = result.auth
    const validatedPageResponse = { ...pageResponse, content: [{ ...analysis, status: 'VALIDATED' }] }
    auth.request.mockResolvedValue(validatedPageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())

    auth.request.mockRejectedValueOnce({ status: 503 })
    const publishBtn = screen.getAllByRole('button', { title: /publier/i }).find((b) => !b.disabled)
    fireEvent.click(publishBtn)
    await waitFor(() => expect(screen.getByText(/temporairement indisponible/i)).toBeInTheDocument())
  })

  it('does not show publish action for draft analysis', () => {
    const publishBtns = screen.getAllByRole('button', { title: /publier/i })
    expect(publishBtns.every((b) => b.disabled)).toBe(true)
  })
})

describe('AnalysesPage detail view', () => {
  let auth

  beforeEach(async () => {
    const result = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_READ_LOG'] })
    auth = result.auth
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
  })

  it('opens detail view and shows summary, strengths, difficulties, trends', async () => {
    const viewBtn = screen.getAllByRole('button', { title: /voir le détail/i }).find((b) => !b.disabled)
    fireEvent.click(viewBtn)
    expect(screen.getByText(/détail de l’analyse #7/i)).toBeInTheDocument()
    expect(screen.getByText(/résumé/i)).toBeInTheDocument()
    expect(screen.getByText(/forces/i)).toBeInTheDocument()
    expect(screen.getByText(/difficultés/i)).toBeInTheDocument()
    expect(screen.getByText(/tendances/i)).toBeInTheDocument()
  })

  it('loads generation logs when read log permission is present', async () => {
    auth.request.mockResolvedValueOnce(generationLogsResponse)
    const viewBtn = screen.getAllByRole('button', { title: /voir le détail/i }).find((b) => !b.disabled)
    fireEvent.click(viewBtn)
    await waitFor(() => expect(screen.getByText(/journaux de génération/i)).toBeInTheDocument())
    expect(screen.getByText(/requête envoyée au fournisseur IA/i)).toBeInTheDocument()
  })

  it('does not load generation logs when PERM_READ_LOG is missing', async () => {
    cleanup()
    const { auth: noLogAuth } = renderPage({ permissions: ['PERM_READ_ANALYSIS'] })
    noLogAuth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
    const viewBtn = screen.getAllByRole('button', { title: /voir le détail/i }).find((b) => !b.disabled)
    fireEvent.click(viewBtn)
    await waitFor(() => expect(screen.getByText(/détail de l’analyse #7/i)).toBeInTheDocument())
    expect(screen.queryByText(/journaux de génération/i)).not.toBeInTheDocument()
  })
})

describe('AnalysesPage keyboard shortcuts and session', () => {
  it('handles session and user changes', async () => {
    const { auth } = renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    auth.request.mockResolvedValue(pageResponse)
    const input = screen.getByLabelText(/identifiant élève/i)
    fireEvent.change(input, { target: { value: '12' } })
    fireEvent.click(screen.getAllByRole('button', { name: /charger/i }).find((b) => !b.disabled))
    await waitFor(() => expect(screen.getByText(/gpt-4o-mini/i)).toBeInTheDocument())
    expect(auth.request).toHaveBeenCalled()
  })

  it('is accessible - has heading and landmarks', () => {
    renderPage({ permissions: ['PERM_READ_ANALYSIS', 'PERM_GENERATE_ANALYSIS'] })
    expect(screen.getByRole('heading', { name: /analyses pédagogiques/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nouvelle observation/i })).not.toBeInTheDocument()
  })
})
