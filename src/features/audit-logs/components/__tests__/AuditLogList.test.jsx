import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuditLogList } from '../AuditLogList'
import { auditLogService } from '../../api/auditLogService'
import { AuthContext } from '@/features/auth'

vi.mock('../../api/auditLogService', () => ({
  auditLogService: {
    getAuditLogs: vi.fn(),
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

const sampleLogs = [
  {
    id: 1,
    action: 'CREATE',
    entity: 'Student',
    userId: 2,
    ipAddress: '127.0.0.1',
    createdAt: '2026-11-12T10:15:30Z',
  },
  {
    id: 2,
    action: 'DELETE',
    entity: 'Announcement',
    userId: null,
    ipAddress: '192.168.1.1',
    createdAt: '2026-11-12T11:00:00Z',
  },
]

function renderComponent({ roles = ['ROLE_ADMIN'] } = {}) {
  const authValue = {
    user: { id: 1, email: 'admin@school.edu', roles },
    hasRole: (r) => {
      const allowed = Array.isArray(r) ? r : [r]
      return roles.some((role) => allowed.includes(role))
    },
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <AuditLogList />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('AuditLogList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auditLogService.getAuditLogs.mockResolvedValue({
      success: true,
      data: {
        items: sampleLogs,
        totalItems: 2,
        totalPages: 1,
      },
    })
  })

  it('renders the audit log table and opens details modal without error when clicking Détails', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
    })

    const detailsButtons = screen.getAllByRole('button', { name: /détails/i })
    expect(detailsButtons).toHaveLength(2)

    fireEvent.click(detailsButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByText("Journal d'audit #1")).toBeInTheDocument()

    const closeButtons = screen.getAllByRole('button', { name: /fermer/i })
    fireEvent.click(closeButtons[0])

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('blocks non-admin users from accessing audit logs', () => {
    renderComponent({ roles: ['ROLE_TEACHER'] })

    expect(screen.getByText('Accès Restreint')).toBeInTheDocument()
    expect(
      screen.getByText("Cette section d'audit système est strictement réservée aux administrateurs.")
    ).toBeInTheDocument()
  })
})
