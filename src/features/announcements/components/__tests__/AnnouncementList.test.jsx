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
    status: 'PUBLISHED',
    publishedAt: '2026-11-05T08:00:00',
  },
  {
    id: 2,
    title: 'Réunion des professeurs principaux',
    content: 'Ordre du jour : organisation des conseils de classe.',
    targetRole: 'TEACHER',
    status: 'PUBLISHED',
    publishedAt: '2026-11-06T14:00:00',
  },
  {
    id: 3,
    title: 'Rencontre parents-professeurs',
    content: 'Les créneaux de rendez-vous sont ouverts sur le portail.',
    targetRole: 'GUARDIAN',
    status: 'PUBLISHED',
    publishedAt: '2026-11-07T16:00:00',
  },
  {
    id: 4,
    title: 'Brouillon communication fête de fin d’année',
    content: 'Projet de festivités à finaliser.',
    targetRole: 'ALL',
    status: 'DRAFT',
    publishedAt: null,
  },
]

function renderComponent({ roles = ['ROLE_ADMIN'], permissions = [] } = {}) {
  const authValue = {
    user: { id: 1, email: 'user@edutrack.fr', roles, permissions },
    isAuthenticated: true,
    isLoading: false,
    hasRole: vi.fn((checkRoles) => {
      const arr = Array.isArray(checkRoles) ? checkRoles : [checkRoles]
      return arr.some((r) => roles.includes(r))
    }),
    hasPermission: vi.fn((checkPerms) => {
      const arr = Array.isArray(checkPerms) ? checkPerms : [checkPerms]
      return arr.some((p) => permissions.includes(p))
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

  it('renders announcements with audience and status badges', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: sampleAnnouncements,
        totalItems: 4,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByText('Fermeture exceptionnelle de l’établissement')).toBeInTheDocument()
      expect(screen.getByText('Réunion des professeurs principaux')).toBeInTheDocument()
      expect(screen.getByText('Rencontre parents-professeurs')).toBeInTheDocument()
      expect(screen.getByText('Brouillon communication fête de fin d’année')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Tout le monde').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Enseignants').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Parents').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Publiée').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Brouillon').length).toBeGreaterThanOrEqual(1)
  })

  it('provides full CRUD management buttons for ROLE_ADMIN', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: sampleAnnouncements,
        totalItems: 4,
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

  it('allows ROLE_STAFF to create and manage announcements', async () => {
    announcementService.getAnnouncements.mockResolvedValue({
      success: true,
      data: {
        items: sampleAnnouncements,
        totalItems: 4,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_STAFF'] })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nouvelle annonce/i })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /modifier/i }).length).toBeGreaterThan(0)
    })
  })

  it('provides read-only view for recipient roles (ROLE_STUDENT, ROLE_PARENT, ROLE_TEACHER)', async () => {
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

    // Verifies that for recipient role, status is forced to PUBLISHED
    expect(announcementService.getAnnouncements).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'PUBLISHED',
      })
    )
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

  it('deletes an announcement after confirmation by admin', async () => {
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
