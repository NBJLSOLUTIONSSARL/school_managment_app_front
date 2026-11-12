import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { AnnouncementList } from '../AnnouncementList'
import { announcementService } from '../../api/announcementService'

vi.mock('../../api/announcementService', () => ({
  announcementService: {
    getAnnouncements: vi.fn(),
    createAnnouncement: vi.fn(),
    updateAnnouncement: vi.fn(),
    deleteAnnouncement: vi.fn(),
  },
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}))

const sampleAnnouncements = [
  {
    id: 1,
    title: 'Fermeture exceptionnelle de l’établissement',
    content: 'En raison des conditions météorologiques, l’école sera fermée ce vendredi.',
    targetRole: 'ALL',
    publishedAt: '2026-11-05T08:00:00',
  },
  {
    id: 2,
    title: 'Réunion des professeurs principaux',
    content: 'Ordre du jour : organisation des conseils de classe.',
    targetRole: 'TEACHER',
    publishedAt: '2026-11-06T14:00:00',
  },
  {
    id: 3,
    title: 'Rencontre parents-professeurs',
    content: 'Les créneaux de rendez-vous sont ouverts sur le portail.',
    targetRole: 'GUARDIAN',
    publishedAt: '2026-11-07T16:00:00',
  },
]

function renderComponent({ roles = ['ROLE_ADMIN'] } = {}) {
  const authValue = {
    user: { id: 1, email: 'user@edutrack.fr', roles },
    isAuthenticated: true,
    isLoading: false,
    hasRole: vi.fn((checkRoles) => {
      const arr = Array.isArray(checkRoles) ? checkRoles : [checkRoles]
      return arr.some((r) => roles.includes(r))
    }),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <AnnouncementList />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('AnnouncementList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders announcements with audience badges', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: sampleAnnouncements,
        totalItems: 3,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByText('Fermeture exceptionnelle de l’établissement')).toBeInTheDocument()
      expect(screen.getByText('Réunion des professeurs principaux')).toBeInTheDocument()
      expect(screen.getByText('Rencontre parents-professeurs')).toBeInTheDocument()
    })

    expect(screen.getByText('Tout le monde')).toBeInTheDocument()
    expect(screen.getAllByText('Enseignants').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Parents').length).toBeGreaterThanOrEqual(1)
  })

  it('provides management buttons for ROLE_ADMIN', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: sampleAnnouncements,
        totalItems: 3,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nouvelle annonce/i })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /modifier/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('button', { name: /supprimer/i }).length).toBeGreaterThan(0)
    })
  })

  it('provides read-only view for non-admin roles (ROLE_STUDENT, ROLE_PARENT)', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: [sampleAnnouncements[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_PARENT'] })

    await waitFor(() => {
      expect(screen.getByText('Fermeture exceptionnelle de l’établissement')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /nouvelle annonce/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /modifier/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voir/i })).toBeInTheDocument()
  })

  it('opens announcement details modal when clicking title', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: [sampleAnnouncements[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_TEACHER'] })

    await waitFor(() => {
      expect(screen.getByText('Fermeture exceptionnelle de l’établissement')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Fermeture exceptionnelle de l’établissement'))

    await waitFor(() => {
      expect(screen.getByText(/En raison des conditions météorologiques/)).toBeInTheDocument()
    })
  })

  it('deletes an announcement after confirmation', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: [sampleAnnouncements[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })
    announcementService.deleteAnnouncement.mockResolvedValue({ success: true, data: true })

    renderComponent({ roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByText('Fermeture exceptionnelle de l’établissement')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByRole('button', { name: /supprimer/i })
    fireEvent.click(deleteBtn)

    const confirmBtn = screen.getByRole('button', { name: /supprimer définitivement/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(announcementService.deleteAnnouncement).toHaveBeenCalledWith(1)
    })
  })
})
