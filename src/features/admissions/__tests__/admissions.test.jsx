import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { AdmissionsPage } from '../components/AdmissionsPage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/hooks/useI18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key, fallback) => fallback || key,
    language: 'fr',
  })),
}))

vi.mock('../api/admissionsService', () => ({
  admissionsService: {
    getApplications: vi.fn().mockResolvedValue({
      content: [
        {
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
        },
        {
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
        },
      ],
      totalPages: 1,
      totalElements: 2,
    }),
    getApplicationById: vi.fn().mockResolvedValue({
      id: 101,
      candidateName: 'Alice Tremblay',
      status: 'UNDER_REVIEW',
      documents: [],
    }),
    recordDecision: vi.fn().mockResolvedValue({ success: true }),
    convertToStudent: vi.fn().mockResolvedValue({ id: 201, studentNumber: 'STU-2026-201' }),
  },
}))

describe('Admissions Module', () => {
  let container = null
  let root = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    container = null
  })

  it('renders AdmissionsPage with candidates list and status filters', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdmissionsPage />
        </MemoryRouter>
      )
    })

    expect(container.textContent).toContain('Gestion des Admissions')
    expect(container.textContent).toContain('Alice Tremblay')
    expect(container.textContent).toContain('Karim Bensaid')
    expect(container.textContent).toContain('En cours')
    expect(container.textContent).toContain('Admis')
  })

  it('filters applications using search input', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdmissionsPage />
        </MemoryRouter>
      )
    })

    const input = container.querySelector('input[type="text"]')
    expect(input).not.toBeNull()

    await act(async () => {
      input.value = 'Alice'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Alice Tremblay')
  })
})
