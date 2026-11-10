import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AdmissionsPage } from '../components/AdmissionsPage'

const api = vi.hoisted(() => ({
  getApplications: vi.fn(),
  getApplicationById: vi.fn(),
  updateStatus: vi.fn(),
  recordDecision: vi.fn(),
  convertToStudent: vi.fn(),
}))

vi.mock('../api/admissionsService', () => ({
  admissionsService: api,
  default: api,
}))

vi.mock('@/hooks/useI18n', () => ({
  useI18n: () => ({
    t: (key, fallback) => fallback || key,
    language: 'fr',
  }),
}))

const alice = {
  id: 101,
  candidateName: 'Alice Tremblay',
  candidateBirthDate: '2010-04-12',
  status: 'UNDER_REVIEW',
  submittedAt: '2026-09-01T10:00:00',
  guardian: {
    firstName: 'Marc',
    lastName: 'Tremblay',
    email: 'marc@example.com',
    phone: '+33612345678',
  },
  decisionNote: 'Dossier complet en attente entretien',
  documents: [
    { id: 11, fileName: 'bulletin.pdf', fileType: 'PDF', downloadUrl: '/files/11' },
    { id: 12, fileName: 'photo.png', fileType: 'PNG' },
  ],
}

const karim = {
  id: 102,
  candidateName: 'Karim Bensaid',
  candidateBirthDate: '2011-06-20',
  status: 'ACCEPTED',
  submittedAt: '2026-09-02T11:30:00',
  guardian: {
    firstName: 'Samia',
    lastName: 'Bensaid',
    email: 'samia@example.com',
  },
  decisionNote: 'Entretien favorable',
  documents: [],
}

function page(content, overrides = {}) {
  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdmissionsPage />
    </MemoryRouter>
  )
}

async function renderLoaded() {
  renderPage()
  await screen.findByText('Alice Tremblay')
}

function statusCombo() {
  return screen.getByRole('combobox')
}

describe('Admissions lifecycle', () => {
  beforeEach(() => {
    api.getApplications.mockResolvedValue(page([alice, karim]))
    api.getApplicationById.mockResolvedValue(alice)
    api.updateStatus.mockResolvedValue({})
    api.recordDecision.mockResolvedValue({})
    api.convertToStudent.mockResolvedValue({ id: 201, studentNumber: 'STU-2026-201' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the candidates list with admission statuses and counters', async () => {
    await renderLoaded()

    expect(
      screen.getByRole('heading', { name: 'Gestion des Admissions & Candidatures' })
    ).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByText('Alice Tremblay')).toBeInTheDocument()
    expect(within(table).getByText('Karim Bensaid')).toBeInTheDocument()
    expect(within(table).getByText('En cours')).toBeInTheDocument()
    expect(within(table).getByText('Admis')).toBeInTheDocument()
    expect(screen.getByText('Total Candidatures')).toBeInTheDocument()
  })

  it('filters applications client-side by candidate or guardian name', async () => {
    await renderLoaded()

    const search = screen.getByPlaceholderText('Rechercher par candidat ou tuteur...')
    fireEvent.change(search, { target: { value: 'Marc' } })

    await waitFor(() => expect(screen.queryByText('Karim Bensaid')).not.toBeInTheDocument())
    expect(screen.getByText('Alice Tremblay')).toBeInTheDocument()

    fireEvent.change(search, { target: { value: 'introuvable' } })
    expect(await screen.findByText('Aucun dossier trouvé')).toBeInTheDocument()

    fireEvent.change(search, { target: { value: '' } })
    expect(await screen.findByText('Karim Bensaid')).toBeInTheDocument()
  })

  it('requests and renders applications for the selected status filter', async () => {
    await renderLoaded()
    api.getApplications.mockResolvedValue(page([karim]))

    fireEvent.change(statusCombo(), { target: { value: 'ACCEPTED' } })

    await waitFor(() =>
      expect(api.getApplications).toHaveBeenLastCalledWith({
        status: 'ACCEPTED',
        page: 0,
        size: 15,
      })
    )
    await waitFor(() => expect(screen.queryByText('Alice Tremblay')).not.toBeInTheDocument())
    expect(screen.getByText('Karim Bensaid')).toBeInTheDocument()
  })

  it('switches status filters from the subheader tabs', async () => {
    await renderLoaded()
    const waitlisted = { ...alice, id: 103, candidateName: 'Nadia Haddad', status: 'WAITLISTED' }
    api.getApplications.mockResolvedValue(page([waitlisted]))

    fireEvent.click(screen.getByRole('button', { name: "Liste d'attente" }))

    await waitFor(() =>
      expect(api.getApplications).toHaveBeenLastCalledWith({
        status: 'WAITLISTED',
        page: 0,
        size: 15,
      })
    )
    expect(await screen.findByText('Nadia Haddad')).toBeInTheDocument()
  })

  it('moves a SUBMITTED application to UNDER_REVIEW', async () => {
    const submitted = { ...alice, status: 'SUBMITTED' }
    api.getApplications.mockResolvedValue(page([submitted]))
    renderPage()
    await screen.findByText('Alice Tremblay')

    api.getApplications.mockResolvedValue(page([{ ...submitted, status: 'UNDER_REVIEW' }]))
    fireEvent.click(screen.getByRole('button', { name: 'Décision' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByRole('combobox'), {
      target: { value: 'UNDER_REVIEW' },
    })
    fireEvent.change(within(dialog).getByRole('textbox'), {
      target: { value: 'Dossier recevable' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Valider la décision' }))

    await waitFor(() =>
      expect(api.recordDecision).toHaveBeenCalledWith(101, {
        status: 'UNDER_REVIEW',
        decisionNote: 'Dossier recevable',
      })
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() =>
      expect(within(screen.getByRole('table')).getByText('En cours')).toBeInTheDocument()
    )
  })

  it.each([
    ['ACCEPTED', 'Admis'],
    ['REJECTED', 'Refusé'],
    ['WAITLISTED', "Liste d'attente"],
  ])('moves an UNDER_REVIEW application to %s', async (status, badge) => {
    api.getApplications.mockResolvedValue(page([alice]))
    renderPage()
    await screen.findByText('Alice Tremblay')

    api.getApplications.mockResolvedValue(page([{ ...alice, status }]))
    fireEvent.click(screen.getByRole('button', { name: 'Décision' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: status } })
    fireEvent.change(within(dialog).getByRole('textbox'), {
      target: { value: `Décision ${status}` },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Valider la décision' }))

    await waitFor(() =>
      expect(api.recordDecision).toHaveBeenCalledWith(101, {
        status,
        decisionNote: `Décision ${status}`,
      })
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() =>
      expect(within(screen.getByRole('table')).getByText(badge)).toBeInTheDocument()
    )
  })
})
