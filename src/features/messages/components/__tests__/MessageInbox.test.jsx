import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { MessageInbox } from '../MessageInbox'
import { messageService } from '../../api/messageService'

vi.mock('../../api/messageService', () => ({
  messageService: {
    getInbox: vi.fn(),
    getSent: vi.fn(),
    getMessageById: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
    deleteMessage: vi.fn(),
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

const inboxMessages = [
  {
    id: 1,
    senderId: 3,
    recipientId: 10,
    subject: 'Notes du devoir surveillé',
    content: 'Bonjour, voici les notes de mathématiques.',
    read: false,
    sentAt: '2026-11-08T10:15:00',
  },
  {
    id: 2,
    senderId: 4,
    recipientId: 10,
    subject: 'Absence justifiée',
    content: 'Certificat médical transmis au secrétariat.',
    read: true,
    sentAt: '2026-11-07T14:20:00',
  },
]

const sentMessages = [
  {
    id: 3,
    senderId: 10,
    recipientId: 5,
    subject: 'Remplacement de cours',
    content: 'Pouvez-vous assurer le cours de physique mardi ?',
    read: true,
    sentAt: '2026-11-09T09:00:00',
  },
]

function renderComponent({ userId = 10 } = {}) {
  const authValue = {
    user: { id: userId, email: 'user10@edutrack.fr', roles: ['ROLE_TEACHER'] },
    isAuthenticated: true,
    isLoading: false,
    hasRole: vi.fn(() => false),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <MessageInbox />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('MessageInbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders inbox messages and unread counter badge', async () => {
    messageService.getInbox.mockResolvedValue({
      success: true,
      data: {
        items: inboxMessages,
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Notes du devoir surveillé')).toBeInTheDocument()
      expect(screen.getByText('Absence justifiée')).toBeInTheDocument()
      expect(screen.getByText('User #3')).toBeInTheDocument()
    })

    // Unread count is 1 in inbox tab badge
    const inboxTabBtn = screen.getByRole('button', { name: /boîte de réception/i })
    expect(inboxTabBtn.querySelector('span:last-child')).toHaveTextContent('1')
  })

  it('preserves unread badge when toggling between Inbox and Sent tabs', async () => {
    messageService.getInbox.mockResolvedValue({
      success: true,
      data: {
        items: inboxMessages,
        totalItems: 2,
        totalPages: 1,
      },
    })
    messageService.getSent.mockResolvedValue({
      success: true,
      data: {
        items: sentMessages,
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Notes du devoir surveillé')).toBeInTheDocument()
    })

    const inboxTabBtn = screen.getByRole('button', { name: /boîte de réception/i })
    expect(inboxTabBtn.querySelector('span:last-child')).toHaveTextContent('1')

    // Switch to Sent tab
    const sentTabBtn = screen.getByRole('button', { name: /messages envoyés/i })
    fireEvent.click(sentTabBtn)

    await waitFor(() => {
      expect(screen.getByText('Remplacement de cours')).toBeInTheDocument()
    })

    // Unread badge still shows on Inbox button
    expect(inboxTabBtn.querySelector('span:last-child')).toHaveTextContent('1')
  })

  it('marks a message as read in modal and decrements unread counter', async () => {
    messageService.getInbox.mockResolvedValue({
      success: true,
      data: {
        items: inboxMessages,
        totalItems: 2,
        totalPages: 1,
      },
    })
    messageService.markAsRead.mockResolvedValue({
      success: true,
      data: { ...inboxMessages[0], read: true },
    })

    renderComponent({ userId: 10 })

    await waitFor(() => {
      expect(screen.getByText('Notes du devoir surveillé')).toBeInTheDocument()
    })

    // Click on unread message to read it
    fireEvent.click(screen.getByText('Notes du devoir surveillé'))

    await waitFor(() => {
      expect(messageService.markAsRead).toHaveBeenCalledWith(1)
    })

    // Close details modal via footer button
    const closeBtn = screen.getAllByRole('button', { name: /fermer/i }).pop()
    fireEvent.click(closeBtn)

    // Unread count decremented to 0, badge removed
    await waitFor(() => {
      const inboxTabBtn = screen.getByRole('button', { name: /boîte de réception/i })
      expect(inboxTabBtn.querySelector('.bg-rose-600')).toBeNull()
    })
  })

  it('filters messages in real time with searchTerm', async () => {
    messageService.getInbox.mockResolvedValue({
      success: true,
      data: {
        items: inboxMessages,
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Notes du devoir surveillé')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/filtrer les messages/i)
    fireEvent.change(searchInput, { target: { value: 'Absence' } })

    expect(screen.queryByText('Notes du devoir surveillé')).not.toBeInTheDocument()
    expect(screen.getByText('Absence justifiée')).toBeInTheDocument()
  })

  it('deletes a message from inbox after confirmation', async () => {
    messageService.getInbox.mockResolvedValue({
      success: true,
      data: {
        items: [inboxMessages[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })
    messageService.deleteMessage.mockResolvedValue({ success: true, data: true })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Notes du devoir surveillé')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByRole('button', { name: /^Supprimer$/i })
    fireEvent.click(deleteBtn)

    const confirmBtn = screen.getByRole('button', { name: /confirmer la suppression/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(messageService.deleteMessage).toHaveBeenCalledWith(1)
    })
  })
})
