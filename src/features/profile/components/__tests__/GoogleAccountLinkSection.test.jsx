import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthContext } from '@/features/auth'
import { GoogleAccountLinkSection } from '@/features/profile/components/GoogleAccountLinkSection'
import * as authApi from '@/features/auth/api/authApi'
import * as pkce from '@/features/auth/utils/pkce'

vi.mock('@/features/auth/api/authApi', () => ({
  getGoogleAuthConfig: vi.fn(),
  initiateGoogleLink: vi.fn(),
}))

vi.mock('@/features/auth/utils/pkce', () => ({
  generateRandomString: vi.fn(() => 'mock-random-string'),
  generateCodeChallenge: vi.fn(async () => 'mock-code-challenge'),
  storePkceSession: vi.fn(),
}))

describe('GoogleAccountLinkSection', () => {
  const mockUnlink = vi.fn()
  const mockInitiateLink = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    delete window.location
    window.location = { origin: 'http://localhost:3000', href: '' }
  })

  it('renders unlinked status and associate button when user is not linked to Google', () => {
    const user = { id: 1, email: 'admin@school.com', googleLinked: false }
    render(
      <AuthContext.Provider value={{ user, initiateGoogleLink: mockInitiateLink, unlinkGoogleAccount: mockUnlink }}>
        <GoogleAccountLinkSection />
      </AuthContext.Provider>
    )

    expect(screen.getByText('Non associé')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /associer mon compte google/i })).toBeInTheDocument()
  })

  it('renders linked status and unlink button when user is already linked to Google', () => {
    const user = { id: 1, email: 'admin@school.com', googleLinked: true }
    render(
      <AuthContext.Provider value={{ user, initiateGoogleLink: mockInitiateLink, unlinkGoogleAccount: mockUnlink }}>
        <GoogleAccountLinkSection />
      </AuthContext.Provider>
    )

    expect(screen.getByText('Compte Google associé')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dissocier le compte google/i })).toBeInTheDocument()
  })

  it('opens confirmation modal and executes linking flow with password confirmation and PKCE', async () => {
    const user = { id: 1, email: 'admin@school.com', googleLinked: false }
    mockInitiateLink.mockResolvedValueOnce({ data: { linkToken: 'mock-link-token-123' } })
    authApi.getGoogleAuthConfig.mockResolvedValueOnce({
      data: { enabled: true, clientId: 'mock-google-client-id.apps.googleusercontent.com' },
    })

    render(
      <AuthContext.Provider value={{ user, initiateGoogleLink: mockInitiateLink, unlinkGoogleAccount: mockUnlink }}>
        <GoogleAccountLinkSection />
      </AuthContext.Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /associer mon compte google/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirmer votre identité')).toBeInTheDocument()

    const passwordInput = screen.getByLabelText(/mot de passe actuel/i)
    fireEvent.change(passwordInput, { target: { value: 'SecretPassword123!' } })

    fireEvent.click(screen.getByRole('button', { name: /continuer avec google/i }))

    await waitFor(() => {
      expect(mockInitiateLink).toHaveBeenCalledWith({ password: 'SecretPassword123!' })
    })

    await waitFor(() => {
      expect(pkce.storePkceSession).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'link',
          linkToken: 'mock-link-token-123',
        })
      )
    })

    expect(window.location.href).toContain('accounts.google.com/o/oauth2/v2/auth')
    expect(window.location.href).toContain('mock-google-client-id.apps.googleusercontent.com')
  })

  it('handles unlink action when confirmed by user', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockUnlink.mockResolvedValueOnce(true)

    const user = { id: 1, email: 'admin@school.com', googleLinked: true }
    render(
      <AuthContext.Provider value={{ user, initiateGoogleLink: mockInitiateLink, unlinkGoogleAccount: mockUnlink }}>
        <GoogleAccountLinkSection />
      </AuthContext.Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /dissocier le compte google/i }))

    await waitFor(() => {
      expect(mockUnlink).toHaveBeenCalled()
    })
    expect(await screen.findByText('Compte Google dissocié avec succès.')).toBeInTheDocument()
  })
})
