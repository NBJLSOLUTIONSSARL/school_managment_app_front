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

describe('Application detail modal', () => {
  beforeEach(() => {
    api.getApplications.mockResolvedValue(page([alice, karim]))
    api.recordDecision.mockResolvedValue({})
    api.convertToStudent.mockResolvedValue({ id: 201, studentNumber: 'STU-2026-201' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function openAliceDetail() {
    renderPage()
    await screen.findByText('Alice Tremblay')
    fireEvent.click(screen.getByText('Alice Tremblay'))
    return screen.findByRole('dialog')
  }

  it('renders candidate, guardian, decision and submitted documents', async () => {
    const dialog = await openAliceDetail()

    expect(
      within(dialog).getByRole('heading', { name: 'Candidature #101 — Alice Tremblay' })
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Marc Tremblay')).toBeInTheDocument()
    expect(within(dialog).getByText('marc@example.com')).toBeInTheDocument()
    expect(within(dialog).getByText('+33612345678')).toBeInTheDocument()
    expect(within(dialog).getByText(/Déposé le/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Né\(e\) le/)).toBeInTheDocument()
    expect(within(dialog).getByText('En Examen (UNDER_REVIEW)')).toBeInTheDocument()
    expect(within(dialog).getByText('Dossier complet en attente entretien')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Pièces Justificatives Déposées')
    ).toBeInTheDocument()
    expect(within(dialog).getByText('bulletin.pdf')).toBeInTheDocument()
    expect(within(dialog).getByText('(PDF)')).toBeInTheDocument()
    expect(within(dialog).getByText('photo.png')).toBeInTheDocument()

    const links = within(dialog).getAllByRole('link', { name: 'Consulter' })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/files/11')
    expect(links[0]).toHaveAttribute('target', '_blank')
  })

  it('shows fallbacks when guardian, decision note and documents are missing', async () => {
    const empty = {
      ...alice,
      id: 104,
      candidateName: 'Sans Tuteur',
      guardian: null,
      decisionNote: '',
      documents: [],
    }
    api.getApplications.mockResolvedValue(page([empty]))

    renderPage()
    await screen.findByText('Sans Tuteur')
    fireEvent.click(screen.getByText('Sans Tuteur'))
    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Aucun tuteur rattaché.')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Aucune note de décision enregistrée.')
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Aucune pièce justificative attachée à cette candidature.')
    ).toBeInTheDocument()
  })

  it('hands the selected application over to the decision modal', async () => {
    const dialog = await openAliceDetail()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Modifier le Statut / Décision' }))

    const decisionDialog = await screen.findByRole('dialog')
    expect(
      within(decisionDialog).getByRole('heading', {
        name: "Décision d'Admission — Alice Tremblay",
      })
    ).toBeInTheDocument()
    expect(within(decisionDialog).getByText('UNDER_REVIEW')).toBeInTheDocument()
    expect(within(decisionDialog).getByText('Marc Tremblay (+33612345678)')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Candidature #101/ })).not.toBeInTheDocument()
  })
})

describe('Student conversion', () => {
  beforeEach(() => {
    api.getApplications.mockResolvedValue(page([alice, karim]))
    api.recordDecision.mockResolvedValue({})
    api.convertToStudent.mockResolvedValue({ id: 201, studentNumber: 'STU-2026-201' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function openKarimDetail() {
    renderPage()
    await screen.findByText('Karim Bensaid')
    fireEvent.click(screen.getByText('Karim Bensaid'))
    return screen.findByRole('dialog')
  }

  it('converts an accepted candidate and links the new student record', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const dialog = await openKarimDetail()
    const linked = { ...karim, student: { id: 201, studentNumber: 'STU-2026-201' } }
    api.getApplications.mockResolvedValue(page([alice, linked]))

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Inscrire comme Élève Officiel' })
    )

    await waitFor(() => expect(api.convertToStudent).toHaveBeenCalledWith(102))
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Karim Bensaid')
    )
    expect(
      await within(dialog).findByText(
        'Élève inscrit avec succès. Matricule attribué : STU-2026-201'
      )
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Inscrit (Matricule: STU-2026-201)')
    ).toBeInTheDocument()
  })

  it('does not convert when the confirmation is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const dialog = await openKarimDetail()

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Inscrire comme Élève Officiel' })
    )

    expect(confirmSpy).toHaveBeenCalled()
    expect(api.convertToStudent).not.toHaveBeenCalled()
    expect(within(dialog).queryByText(/Élève inscrit avec succès/)).not.toBeInTheDocument()
  })

  it('only offers conversion for accepted applications without a student', async () => {
    renderPage()
    await screen.findByText('Alice Tremblay')
    fireEvent.click(screen.getByText('Alice Tremblay'))
    const aliceDialog = await screen.findByRole('dialog')
    expect(
      within(aliceDialog).queryByRole('button', { name: 'Inscrire comme Élève Officiel' })
    ).not.toBeInTheDocument()
    fireEvent.click(within(aliceDialog).getByRole('button', { name: 'Fermer' }))

    const linked = { ...karim, student: { id: 201, studentNumber: 'STU-2026-201' } }
    api.getApplications.mockResolvedValue(page([alice, linked]))
    fireEvent.click(screen.getByRole('button', { name: 'Actualiser' }))
    await screen.findByText('Inscrit (Matricule: STU-2026-201)')
    fireEvent.click(screen.getByText('Karim Bensaid'))
    const karimDialog = await screen.findByRole('dialog')
    expect(
      within(karimDialog).queryByRole('button', { name: 'Inscrire comme Élève Officiel' })
    ).not.toBeInTheDocument()
  })
})

describe('Admissions error handling', () => {
  beforeEach(() => {
    api.getApplications.mockResolvedValue(page([alice, karim]))
    api.recordDecision.mockResolvedValue({})
    api.convertToStudent.mockResolvedValue({ id: 201, studentNumber: 'STU-2026-201' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function openKarimDetail() {
    renderPage()
    await screen.findByText('Karim Bensaid')
    fireEvent.click(screen.getByText('Karim Bensaid'))
    return screen.findByRole('dialog')
  }

  it('shows the backend message when the conversion fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const dialog = await openKarimDetail()
    api.convertToStudent.mockRejectedValue({
      response: { data: { message: 'Le candidat doit être admis avant conversion.' } },
    })

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Inscrire comme Élève Officiel' })
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Le candidat doit être admis avant conversion.'
    )
    expect(api.convertToStudent).toHaveBeenCalledWith(102)
    expect(
      within(dialog).getByRole('button', { name: 'Inscrire comme Élève Officiel' })
    ).toBeEnabled()
  })

  it('falls back to a generic message when the conversion error is empty', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const dialog = await openKarimDetail()
    api.convertToStudent.mockRejectedValue({})

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Inscrire comme Élève Officiel' })
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Impossible de convertir en élève.'
    )
  })

  it('keeps the decision modal open and reports a failed transition', async () => {
    renderPage()
    await screen.findByText('Alice Tremblay')
    fireEvent.click(screen.getAllByRole('button', { name: 'Décision' })[0])
    const dialog = await screen.findByRole('dialog')
    api.recordDecision.mockRejectedValue({
      response: { data: { message: 'Transition non autorisée.' } },
    })

    fireEvent.change(within(dialog).getByRole('combobox'), {
      target: { value: 'ACCEPTED' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Valider la décision' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Transition non autorisée.'
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Valider la décision' })).toBeEnabled()
  })

  it('reports a failure while loading the applications list', async () => {
    api.getApplications.mockRejectedValue({
      response: { data: { message: 'Service admission indisponible.' } },
    })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Service admission indisponible.'
    )
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
