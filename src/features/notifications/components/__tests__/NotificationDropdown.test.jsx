import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { NotificationDropdown } from '../NotificationDropdown'
import { notificationService } from '../../api/notificationService'

vi.mock('../../api/notificationService', () => ({
  notificationService: {
    getUserNotifications: vi.fn(),
    markAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}))

function renderComponent(userOverrides = {}) {
  const authValue = {
    user: { id: 5, email: 'teacher@edutrack.fr', ...userOverrides },
    isAuthenticated: true,
    isLoading: false,
    hasRole: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <NotificationDropdown />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('NotificationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders bell and displays unread badge counter', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 1, content: 'Nouvelle note disponible', read: false, type: 'INFO' },
          { id: 2, content: 'Demande de congé approuvée', read: true, type: 'SUCCESS' },
          { id: 3, content: 'Réunion demain à 10h', read: false, type: 'WARNING' },
        ],
        totalItems: 3,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('displays 9+ when unread items exceed 9', async () => {
    const unreadItems = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      content: `Notification ${i + 1}`,
      read: false,
      type: 'INFO',
    }))

    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: unreadItems,
        totalItems: 12,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('9+')).toBeInTheDocument()
    })
  })

  it('opens dropdown menu and displays notification items', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 101, content: 'Bulletins disponibles pour validation', read: false, type: 'INFO' },
        ],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    const bellBtn = screen.getByRole('button', { name: /centre de notifications/i })
    fireEvent.click(bellBtn)

    expect(screen.getByText('Bulletins disponibles pour validation')).toBeInTheDocument()
    expect(screen.getByText('Voir toutes les notifications →')).toBeInTheDocument()
  })

  it('marks a notification as read and dispatches edutrack:notifications-updated', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 42, content: 'Événement ajouté au calendrier', read: false, type: 'INFO' },
        ],
        totalItems: 1,
        totalPages: 1,
      },
    })
    notificationService.markAsRead.mockResolvedValue({ success: true, data: { id: 42, read: true } })

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    const bellBtn = screen.getByRole('button', { name: /centre de notifications/i })
    fireEvent.click(bellBtn)

    const markReadBtn = screen.getByRole('button', { name: 'Lu' })
    fireEvent.click(markReadBtn)

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(42)
    })

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'edutrack:notifications-updated',
        detail: { id: 42, action: 'READ' },
      })
    )
  })

  it('reacts to external edutrack:notifications-updated events', async () => {
    notificationService.getUserNotifications.mockResolvedValue({
      success: true,
      data: {
        items: [
          { id: 99, content: 'Message important', read: false, type: 'WARNING' },
        ],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Simulate external read event
    act(() => {
      window.dispatchEvent(
        new CustomEvent('edutrack:notifications-updated', {
          detail: { id: 99, action: 'READ' },
        })
      )
    })

    await waitFor(() => {
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
  })
})
