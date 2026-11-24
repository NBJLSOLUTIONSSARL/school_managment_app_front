import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { NotificationList } from '../NotificationList'
import { notificationService } from '../../api/notificationService'

vi.mock('../../api/notificationService', () => ({
  notificationService: {
    getUserNotifications: vi.fn(),
    markAsRead: vi.fn(),
    deleteNotification: vi.fn(),
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

function renderComponent(userOverrides = {}) {
  const authValue = {
    user: { id: 7, email: 'staff@edutrack.fr', ...userOverrides },
    isAuthenticated: true,
    isLoading: false,
    hasRole: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <NotificationList />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('NotificationList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders list of notifications with header count', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 10, content: 'Nouvelle admission enregistrée', read: false, type: 'INFO', createdAt: '2026-11-01T10:00:00' },
          { id: 11, content: 'Alerte sécurité mot de passe', read: true, type: 'WARNING', createdAt: '2026-11-02T11:00:00' },
        ],
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Nouvelle admission enregistrée')).toBeInTheDocument()
      expect(screen.getByText('Alerte sécurité mot de passe')).toBeInTheDocument()
    })
  })

  it('marks a notification as read and notifies the system', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 20, content: 'Demande de matériel acceptée', read: false, type: 'SUCCESS', createdAt: '2026-11-03T12:00:00' },
        ],
        totalItems: 1,
        totalPages: 1,
      },
    })
    notificationService.markAsRead.mockResolvedValue({ success: true, data: { id: 20, read: true } })

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Demande de matériel acceptée')).toBeInTheDocument()
    })

    const markReadBtn = screen.getByRole('button', { name: /marquer lu/i })
    fireEvent.click(markReadBtn)

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(20)
    })

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'edutrack:notifications-updated',
        detail: { id: 20, action: 'READ' },
      })
    )
  })

  it('deletes a notification after confirmation', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 30, content: 'Notification à supprimer', read: true, type: 'INFO', createdAt: '2026-11-04T12:00:00' },
        ],
        totalItems: 1,
        totalPages: 1,
      },
    })
    notificationService.deleteNotification.mockResolvedValue({ success: true, data: true })

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Notification à supprimer')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByRole('button', { name: /^Supprimer$/i })
    fireEvent.click(deleteBtn)

    // Confirm dialog appears
    const confirmBtn = screen.getByRole('button', { name: /confirmer la suppression/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(notificationService.deleteNotification).toHaveBeenCalledWith(30)
    })

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'edutrack:notifications-updated',
        detail: { id: 30, action: 'DELETE' },
      })
    )
  })

  it('updates notification state on external read event', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 50, content: 'Notification externe non lue', read: false, type: 'INFO' },
        ],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Notification externe non lue')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /marquer lu/i })).toBeInTheDocument()
    })

    act(() => {
      window.dispatchEvent(
        new CustomEvent('edutrack:notifications-updated', {
          detail: { id: 50, action: 'READ' },
        })
      )
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /marquer lu/i })).not.toBeInTheDocument()
    })
  })
})
