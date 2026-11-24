import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActiveSessionsSection } from '../ActiveSessionsSection'
import * as authApi from '@/features/auth/api/authApi'

vi.mock('@/features/auth/api/authApi', () => ({
  getActiveSessions: vi.fn(),
  revokeSession: vi.fn(),
  revokeOtherSessions: vi.fn(),
}))

describe('ActiveSessionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders section and loads active sessions upon clicking "Consulter les sessions"', async () => {
    authApi.getActiveSessions.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          deviceType: 'Desktop',
          browser: 'Chrome 122',
          os: 'Linux',
          ipAddress: '192.168.1.10',
          current: true,
          createdAt: '2026-11-14T20:00:00Z',
        },
        {
          id: 2,
          deviceType: 'Mobile',
          browser: 'Safari',
          os: 'iOS',
          ipAddress: '10.0.0.5',
          current: false,
          createdAt: '2026-11-14T19:00:00Z',
        },
      ],
    })

    render(<ActiveSessionsSection />)

    expect(screen.getByText('Sessions actives & Appareils connectés')).toBeInTheDocument()
    const viewBtn = screen.getByRole('button', { name: /Consulter les sessions/i })
    expect(viewBtn).toBeInTheDocument()

    fireEvent.click(viewBtn)

    await waitFor(() => {
      expect(authApi.getActiveSessions).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Chrome 122 · Linux')).toBeInTheDocument()
      expect(screen.getByText('Safari · iOS')).toBeInTheDocument()
      expect(screen.getByText('Cette session')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Révoquer/i })).toBeInTheDocument()
    })
  })

  it('allows revoking a specific session and all other sessions', async () => {
    authApi.getActiveSessions.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          deviceType: 'Desktop',
          browser: 'Firefox',
          os: 'Linux',
          ipAddress: '127.0.0.1',
          current: true,
        },
        {
          id: 2,
          deviceType: 'Mobile',
          browser: 'Chrome Mobile',
          os: 'Android',
          ipAddress: '10.0.0.2',
          current: false,
        },
      ],
    })
    authApi.revokeSession.mockResolvedValueOnce({ success: true })

    render(<ActiveSessionsSection />)
    fireEvent.click(screen.getByRole('button', { name: /Consulter les sessions/i }))

    await waitFor(() => {
      expect(screen.getByText('Chrome Mobile · Android')).toBeInTheDocument()
    })

    const revokeBtn = screen.getByRole('button', { name: /Révoquer/i })
    fireEvent.click(revokeBtn)

    await waitFor(() => {
      expect(authApi.revokeSession).toHaveBeenCalledWith(2)
      expect(screen.queryByText('Chrome Mobile · Android')).not.toBeInTheDocument()
    })
  })
})
