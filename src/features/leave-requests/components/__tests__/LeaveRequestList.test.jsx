import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { LeaveRequestList } from '../LeaveRequestList'
import { leaveRequestService } from '../../api/leaveRequestService'

vi.mock('../../api/leaveRequestService', () => ({
  leaveRequestService: {
    getLeaveRequests: vi.fn(),
    createLeaveRequest: vi.fn(),
    updateLeaveRequest: vi.fn(),
    approveLeaveRequest: vi.fn(),
    rejectLeaveRequest: vi.fn(),
    cancelLeaveRequest: vi.fn(),
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

const sampleRequests = [
  {
    id: 101,
    userId: 5,
    type: 'ANNUAL',
    status: 'PENDING',
    startDate: '2026-11-25',
    endDate: '2026-11-28',
    reason: 'Congés annuels de fin d’année.',
    requestedAt: '2026-11-10T09:00:00',
  },
  {
    id: 102,
    userId: 1, // Admin himself
    type: 'SICK',
    status: 'PENDING',
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    reason: 'Intervention médicale programmée.',
    requestedAt: '2026-11-11T14:30:00',
  },
  {
    id: 103,
    userId: 9,
    type: 'ADMINISTRATIVE',
    status: 'APPROVED',
    startDate: '2026-11-15',
    endDate: '2026-11-16',
    reason: 'Formation professionnelle.',
    requestedAt: '2026-11-05T08:00:00',
  },
]

function renderComponent({ userId = 1, roles = ['ROLE_ADMIN'] } = {}) {
  const authValue = {
    user: { id: userId, email: 'user@edutrack.fr', roles },
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
        <LeaveRequestList />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('LeaveRequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('allows teacher to view their own requests and displays status badges', async () => {
    leaveRequestService.getLeaveRequests.mockResolvedValue({
      success: true,
      data: {
        items: [sampleRequests[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent({ userId: 5, roles: ['ROLE_TEACHER'] })

    await waitFor(() => {
      expect(screen.getByText('2026-11-25')).toBeInTheDocument()
      expect(screen.getByText('2026-11-28')).toBeInTheDocument()
      expect(screen.getAllByText('En attente').length).toBeGreaterThanOrEqual(1)
    })

    // Teacher can edit or cancel their own pending request
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()

    // Teacher CANNOT approve or reject
    expect(screen.queryByRole('button', { name: '✓' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument()
  })

  it('allows admin to quickly approve a pending request from another staff member', async () => {
    leaveRequestService.getLeaveRequests.mockResolvedValue({
      success: true,
      data: {
        items: [sampleRequests[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })
    leaveRequestService.approveLeaveRequest.mockResolvedValue({
      success: true,
      data: { ...sampleRequests[0], status: 'APPROVED' },
    })

    renderComponent({ userId: 1, roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByText('User #5')).toBeInTheDocument()
    })

    const approveBtn = screen.getByRole('button', { name: '✓' })
    fireEvent.click(approveBtn)

    await waitFor(() => {
      expect(leaveRequestService.approveLeaveRequest).toHaveBeenCalledWith(101)
    })
  })

  it('prevents admin from auto-approving their own pending request', async () => {
    leaveRequestService.getLeaveRequests.mockResolvedValue({
      success: true,
      data: {
        items: [sampleRequests[1]], // id 102, userId 1
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent({ userId: 1, roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByText('User #1 (Moi)')).toBeInTheDocument()
    })

    // Approve / Reject buttons should NOT be present for own request
    expect(screen.queryByRole('button', { name: '✓' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument()

    // Can cancel or edit own request
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument()
  })

  it('cancels a pending leave request when owner confirms cancellation', async () => {
    leaveRequestService.getLeaveRequests.mockResolvedValue({
      success: true,
      data: {
        items: [sampleRequests[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })
    leaveRequestService.cancelLeaveRequest.mockResolvedValue({
      success: true,
      data: { ...sampleRequests[0], status: 'CANCELLED' },
    })

    renderComponent({ userId: 5, roles: ['ROLE_TEACHER'] })

    await waitFor(() => {
      expect(screen.getByText('User #5 (Moi)')).toBeInTheDocument()
    })

    const cancelBtn = screen.getByRole('button', { name: /annuler/i })
    fireEvent.click(cancelBtn)

    // Confirm dialog
    const confirmBtn = screen.getByRole('button', { name: /confirmer l’annulation/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(leaveRequestService.cancelLeaveRequest).toHaveBeenCalledWith(101)
    })
  })

  it('opens details modal and displays duration in days and reason', async () => {
    leaveRequestService.getLeaveRequests.mockResolvedValue({
      success: true,
      data: {
        items: [sampleRequests[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent({ userId: 5, roles: ['ROLE_TEACHER'] })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /détails/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /détails/i }))

    await waitFor(() => {
      expect(screen.getByText('Détail de la demande de congé')).toBeInTheDocument()
      expect(screen.getByText('Congés annuels de fin d’année.')).toBeInTheDocument()
      expect(screen.getByText('4 jours')).toBeInTheDocument()
    })
  })
})
