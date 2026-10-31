import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext, useAuth } from '../auth/AuthContext'
import { AuthProvider } from '../auth/AuthProvider'
import { AuthGate } from '../auth/AuthGate'
import ProfilePage from './ProfilePage'

const user = { id: 1, email: 'alice@example.test', firstName: 'Alice', lastName: 'Dupont', phone: '0612345678', language: 'fr', active: true, roles: ['ROLE_TEACHER', 'ROLE_PARENT'], permissions: [] }
const document = (overrides = {}) => ({
  id: 7, documentTypeName: 'Type fourni par le serveur', status: 'PENDING', uploadedAt: '2026-10-30T23:30:00',
  expiresAt: '2027-10-30', rejectionReason: null, fileKey: 'abc-123.pdf',
  downloadUrl: `/api/v1/documents/files/abc-123.pdf?expires=${Date.now() + 900000}&signature=abc_DEF-123`,
  ...overrides,
})
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done }); return { promise, resolve } }
const context = (request, currentUser = user) => ({ user: currentUser, isAuthenticated: Boolean(currentUser), roles: currentUser?.roles || [], request })
function mount(request = vi.fn().mockResolvedValue([]), currentUser = user) {
  return render(<AuthContext.Provider value={context(request, currentUser)}><ProfilePage /></AuthContext.Provider>)
}

describe('read-only profile and legal documents', () => {
  it('renders authenticated fields, roles, status and optional photo without editing controls', async () => {
    mount(undefined, { ...user, photoUrl: '/profile-photo.png' })
    expect(screen.getByRole('heading', { name: 'Mon profil' })).toBeInTheDocument()
    const details = screen.getByRole('region', { name: 'Informations personnelles' })
    for (const value of ['Alice', 'Dupont', 'alice@example.test', '0612345678', 'fr']) expect(within(details).getByText(value)).toBeInTheDocument()
    expect(screen.getByText('Enseignant')).toBeInTheDocument()
    expect(screen.getByText('Parent')).toBeInTheDocument()
    expect(screen.getByText('Compte actif')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Photo de profil' })).toHaveAttribute('referrerpolicy', 'no-referrer')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /enregistrer|ajouter|supprimer/i })).not.toBeInTheDocument()
    await screen.findByText('Aucun document disponible.')
  })

  it('omits absent optional data and tolerates missing names and failed images', async () => {
    mount(undefined, { ...user, firstName: null, lastName: null, phone: null, language: null, photoUrl: null, roles: [] })
    expect(screen.queryByText('Téléphone')).not.toBeInTheDocument()
    expect(screen.queryByText('Langue')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getAllByText('Non renseigné')).toHaveLength(2)
    expect(screen.getByText('Aucun rôle attribué')).toBeInTheDocument()
    await screen.findByText('Aucun document disponible.')
  })

  it('hides a photo that cannot load', async () => {
    mount(undefined, { ...user, photoUrl: '/missing.png' })
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Initiales du profil')).toHaveTextContent('AD')
    await screen.findByText('Aucun document disponible.')
  })

  it('refreshes the document table and removes previously prepared signed links', async () => {
    const refresh = deferred()
    const request = vi.fn().mockResolvedValueOnce([document()]).mockResolvedValueOnce(document()).mockReturnValueOnce(refresh.promise)
    mount(request)
    fireEvent.click(await screen.findByRole('button', { name: /Voir Type/ }))
    await screen.findByRole('link')
    fireEvent.click(screen.getByRole('button', { name: 'Actualiser' }))
    expect(screen.getByRole('button', { name: 'Actualiser' })).toBeDisabled()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    await act(async () => refresh.resolve([document({ status: 'APPROVED' })]))
    expect(screen.getByRole('table', { name: 'Documents légaux' })).toBeInTheDocument()
    expect(screen.getByText('Approuvé')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(5)
    expect(request).toHaveBeenLastCalledWith('/api/v1/documents/my-documents')
  })

  it('shows loading then actual statuses, dates and rejection reason', async () => {
    const loading = deferred()
    mount(vi.fn().mockReturnValue(loading.promise))
    expect(screen.getByText('Chargement des documents…')).toBeInTheDocument()
    await act(async () => loading.resolve([
      document(), document({ id: 8, status: 'APPROVED', expiresAt: null }),
      document({ id: 9, status: 'REJECTED', rejectionReason: 'Document illisible' }),
    ]))
    for (const status of ['En attente', 'Approuvé', 'Rejeté']) expect(screen.getByText(status)).toBeInTheDocument()
    expect(screen.getAllByText('30/10/2026')).toHaveLength(3)
    expect(screen.getAllByText('30/10/2027')).toHaveLength(2)
    expect(screen.getByText('Document illisible')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it.each([401, 403, 404, 503, 0])('handles %s safely and allows retry', async (status) => {
    const request = vi.fn().mockRejectedValueOnce({ status, message: 'sensitive server details' }).mockResolvedValueOnce([])
    mount(request)
    const alert = await screen.findByRole('alert')
    expect(alert).not.toHaveTextContent('sensitive server details')
    const fragments = { 401: 'session a expiré', 403: 'autorisations', 404: 'plus disponibles', 503: 'temporairement indisponible', 0: 'Impossible' }
    expect(alert).toHaveTextContent(fragments[status])
    expect(screen.queryByText('Aucun document disponible.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    await screen.findByText('Aucun document disponible.')
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('refreshes expired list URLs and offers only validated fresh access', async () => {
    const fresh = document()
    const request = vi.fn().mockResolvedValueOnce([document({ downloadUrl: '/expired' })]).mockResolvedValueOnce(fresh)
    mount(request)
    fireEvent.click(await screen.findByRole('button', { name: /Voir Type/ }))
    const link = await screen.findByRole('link', { name: /Ouvrir Type/ })
    expect(request).toHaveBeenLastCalledWith('/api/v1/documents/7')
    expect(link).toHaveAttribute('href', `${window.location.origin}${fresh.downloadUrl}`)
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveFocus()
  })

  it('refreshes a prepared link if it has expired before clicking', async () => {
    const first = document()
    const request = vi.fn().mockResolvedValueOnce([first]).mockResolvedValueOnce(first).mockResolvedValueOnce(document({ downloadUrl: '/invalid' }))
    mount(request)
    fireEvent.click(await screen.findByRole('button', { name: /Voir Type/ }))
    const link = await screen.findByRole('link')
    const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000000)
    try {
      expect(fireEvent.click(link)).toBe(false)
      await screen.findByRole('alert')
      expect(request).toHaveBeenCalledTimes(3)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    } finally { clock.mockRestore() }
  })

  it('blocks invalid signed URLs and permits another access attempt', async () => {
    const request = vi.fn().mockResolvedValueOnce([document()]).mockResolvedValueOnce(document({ downloadUrl: 'https://evil.test/file' })).mockResolvedValueOnce(document())
    mount(request)
    fireEvent.click(await screen.findByRole('button', { name: /Voir Type/ }))
    await screen.findByRole('alert')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Voir Type/ }))
    await screen.findByRole('link')
  })

  it('discards old list results after user change and clears content on logout', async () => {
    const oldList = deferred()
    const request = vi.fn().mockReturnValueOnce(oldList.promise).mockResolvedValueOnce([])
    const view = mount(request)
    view.rerender(<AuthContext.Provider value={context(request, { ...user, id: 2, email: 'bob@example.test' })}><ProfilePage /></AuthContext.Provider>)
    await screen.findByText('Aucun document disponible.')
    await act(async () => oldList.resolve([document()]))
    expect(screen.queryByText('Type fourni par le serveur')).not.toBeInTheDocument()
    view.rerender(<AuthContext.Provider value={context(request, null)}><ProfilePage /></AuthContext.Provider>)
    expect(screen.queryByText('Documents légaux')).not.toBeInTheDocument()
  })

  it('discards pending signed access after user change', async () => {
    const metadata = deferred()
    const request = vi.fn().mockResolvedValueOnce([document()]).mockReturnValueOnce(metadata.promise).mockResolvedValueOnce([])
    const view = mount(request)
    fireEvent.click(await screen.findByRole('button', { name: /Voir Type/ }))
    view.rerender(<AuthContext.Provider value={context(request, { ...user, id: 2 })}><ProfilePage /></AuthContext.Provider>)
    await act(async () => metadata.resolve(document()))
    await screen.findByText('Aucun document disponible.')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

function SessionHarness() {
  const auth = useAuth()
  return <><button onClick={() => { void auth.login({ email: user.email, password: 'test' }) }}>Start session</button><AuthGate><ProfilePage /></AuthGate></>
}
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
function loginResponse(expiresIn = 3600) {
  const token = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiresIn }))}.signature`
  return response({ success: true, data: { tokenType: 'Bearer', accessToken: token, expiresIn, user } })
}

describe('SCRUM-54 authentication integration', () => {
  it('sends the bearer token and delegates a document 401 to existing session cleanup', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(loginResponse()).mockResolvedValueOnce(response({}, 401))
    vi.stubGlobal('fetch', fetch)
    render(<AuthProvider><SessionHarness /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    expect(fetch.mock.calls[1][0]).toBe('/api/v1/documents/my-documents')
    expect(fetch.mock.calls[1][1].headers.get('Authorization')).toMatch(/^Bearer /)
    await screen.findByRole('form', { name: 'Formulaire de connexion' })
    expect(screen.queryByText('Documents légaux')).not.toBeInTheDocument()
  })

  it('removes profile data on logout and ignores an in-flight response', async () => {
    const pending = deferred()
    const fetch = vi.fn().mockResolvedValueOnce(loginResponse()).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(response({ success: true }))
    vi.stubGlobal('fetch', fetch)
    render(<AuthProvider><SessionHarness /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Start session' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Se déconnecter' }))
    await act(async () => pending.resolve(response([document()])))
    expect(screen.queryByText('Documents légaux')).not.toBeInTheDocument()
    expect(screen.queryByText('Type fourni par le serveur')).not.toBeInTheDocument()
    expect(fetch.mock.calls[2][0]).toBe('/api/v1/auth/logout')
  })

  it('removes a loaded profile when the existing session timer expires', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(loginResponse(60)).mockResolvedValueOnce(response([document()])))
    render(<AuthProvider><SessionHarness /></AuthProvider>)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Start session' })) })
    expect(screen.getByText('Documents légaux')).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(61000) })
    expect(screen.queryByText('Documents légaux')).not.toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulaire de connexion' })).toBeInTheDocument()
  })
})
