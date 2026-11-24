import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TwoFactorSection } from '../TwoFactorSection'
import { AuthContext } from '@/features/auth/context/AuthContext'
import * as authApi from '@/features/auth/api/authApi'

vi.mock('@/features/auth/api/authApi', () => ({
  setupTwoFactor: vi.fn(),
  enableTwoFactor: vi.fn(),
  disableTwoFactor: vi.fn(),
}))

describe('TwoFactorSection', () => {
  const updateSessionUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders disabled badge and "Activer la 2FA" button when user.twoFactorEnabled is false', () => {
    render(
      <AuthContext.Provider value={{ user: { id: 1, twoFactorEnabled: false }, updateSessionUser }}>
        <TwoFactorSection />
      </AuthContext.Provider>
    )

    expect(screen.getByText('Désactivée')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Activer la 2FA/i })).toBeInTheDocument()
  })

  it('opens setup modal and allows confirming 6-digit TOTP to enable 2FA', async () => {
    authApi.setupTwoFactor.mockResolvedValueOnce({
      data: {
        secretKey: 'JBSWY3DPEHPK3PXP',
        qrCodeUri: 'otpauth://totp/EduTrack:alice?secret=JBSWY3DPEHPK3PXP',
      },
    })
    authApi.enableTwoFactor.mockResolvedValueOnce({
      data: {
        recoveryCodes: ['REC11111', 'REC22222', 'REC33333', 'REC44444', 'REC55555', 'REC66666', 'REC77777', 'REC88888'],
      },
    })

    render(
      <AuthContext.Provider value={{ user: { id: 1, twoFactorEnabled: false }, updateSessionUser }}>
        <TwoFactorSection />
      </AuthContext.Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Activer la 2FA/i }))

    await waitFor(() => {
      expect(screen.getByText('Configurer l’application d’authentification')).toBeInTheDocument()
      expect(screen.getByDisplayValue('JBSWY3DPEHPK3PXP')).toBeInTheDocument()
    })

    const codeInput = screen.getByLabelText(/Saisissez le code à 6 chiffres/i)
    fireEvent.change(codeInput, { target: { value: '654321' } })

    fireEvent.click(screen.getByRole('button', { name: /Vérifier et activer/i }))

    await waitFor(() => {
      expect(authApi.enableTwoFactor).toHaveBeenCalledWith({ code: '654321' })
      expect(updateSessionUser).toHaveBeenCalledWith({ twoFactorEnabled: true })
      expect(screen.getByText('Codes de secours d’urgence')).toBeInTheDocument()
      expect(screen.getByText('REC11111')).toBeInTheDocument()
    })
  })

  it('renders enabled badge and "Désactiver la 2FA" button when user.twoFactorEnabled is true', async () => {
    authApi.disableTwoFactor.mockResolvedValueOnce({ success: true })

    render(
      <AuthContext.Provider value={{ user: { id: 1, twoFactorEnabled: true }, updateSessionUser }}>
        <TwoFactorSection />
      </AuthContext.Provider>
    )

    expect(screen.getByText('Activée')).toBeInTheDocument()
    const disableBtn = screen.getByRole('button', { name: /Désactiver la 2FA/i })
    expect(disableBtn).toBeInTheDocument()

    fireEvent.click(disableBtn)

    expect(screen.getByText('Désactiver l’authentification à deux facteurs')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/^Mot de passe/i), { target: { value: 'SecretPassword123' } })
    fireEvent.change(screen.getByLabelText(/Code TOTP/i), { target: { value: '123456' } })

    fireEvent.click(screen.getByRole('button', { name: /Confirmer la désactivation/i }))

    await waitFor(() => {
      expect(authApi.disableTwoFactor).toHaveBeenCalledWith({
        password: 'SecretPassword123',
        code: '123456',
      })
      expect(updateSessionUser).toHaveBeenCalledWith({ twoFactorEnabled: false })
    })
  })
})
