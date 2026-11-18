import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { documentError, getDocumentAccess, getMyDocuments } from '@/features/profile/api/documentApi'
import ProfileIcon from '@/features/profile/components/ProfileIcon'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

const CURRENT_YEAR = new Date().getFullYear()

const buttonClass = 'profile-action'
const statuses = {
  PENDING: ['En attente', 'profile-status-pending'],
  APPROVED: ['Approuvé', 'profile-status-approved'],
  REJECTED: ['Rejeté', 'profile-status-rejected'],
}

function dateLabel(value) {
  if (!value) return 'Non renseignée'
  // LocalDate and LocalDateTime have no timezone; preserve the supplied calendar date.
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : 'Non renseignée'
}

function DocumentAccess({ id, name, request }) {
  const [access, setAccess] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const pending = useRef(false)
  const linkRef = useRef(null)
  useEffect(() => () => { generation.current += 1 }, [])
  useEffect(() => {
    if (!access) return
    linkRef.current?.focus()
    const timer = setTimeout(() => setAccess(null), Math.max(0, Math.min(access.expires - Date.now() - 5000, 2147483647)))
    return () => clearTimeout(timer)
  }, [access])

  async function prepare() {
    if (pending.current) return
    const operation = ++generation.current
    pending.current = true
    setBusy(true)
    setError('')
    setAccess(null)
    try {
      const result = await getDocumentAccess(request, id)
      if (operation === generation.current) setAccess(result)
    } catch (failure) {
      if (operation === generation.current) setError(documentError(failure))
    } finally {
      if (operation === generation.current) { pending.current = false; setBusy(false) }
    }
  }

  return (
    <div className="profile-document-access">
      {access ? <a ref={linkRef} className={buttonClass} href={access.href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
        aria-label={`Ouvrir ${name} (nouvel onglet)`}
        onClick={(event) => {
          if (access.expires <= Date.now() + 5000) { event.preventDefault(); void prepare() }
        }}><ProfileIcon name="eye" />Ouvrir ↗</a>
        : <button type="button" className={buttonClass} disabled={busy} onClick={() => { void prepare() }} aria-label={`Voir ${name}`}>
          <ProfileIcon name="eye" />{busy ? 'Préparation…' : 'Voir'}
        </button>}
      {busy && <p role="status" className="text-2xs text-frappe-muted">Préparation du lien…</p>}
      {access && <p role="status" className="text-2xs text-frappe-muted">Lien prêt. Ouverture dans un nouvel onglet.</p>}
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    </div>
  )
}

export function MyDocumentsView() {
  const { request, user } = useAuth()
  const { t, language, dir } = useI18n()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ loading: true, documents: [], error: '' })
  useEffect(() => {
    let active = true
    getMyDocuments(request).then(
      (documents) => { if (active) setState({ loading: false, documents, error: '' }) },
      (error) => { if (active) setState({ loading: false, documents: [], error: documentError(error) }) },
    )
    return () => { active = false }
  }, [request, attempt])

  function refresh() {
    setState({ loading: true, documents: [], error: '' })
    setAttempt((value) => value + 1)
  }

  return (
    <div dir={dir} lang={language} data-contract="document-table" className="min-h-screen flex flex-col bg-white select-none">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-2.5">
          <Link to="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-tight border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer" title={t('common.back', 'Retour')}>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.25" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-900">EduTrack</span>
        </div>
        <LanguageSwitcher size="xs" />
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="w-full max-w-4xl">
          <section aria-labelledby="documents-title" className="profile-documents bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 sm:p-8 space-y-6">
            <div className="profile-documents-heading flex items-center justify-between">
              <div className="profile-documents-title flex items-center gap-3">
                <ProfileIcon name="file" className="w-6 h-6 text-zinc-500" />
                <div>
                  <h2 id="documents-title" className="text-xl font-bold text-zinc-900">{t('profile.myDocumentsTitle', 'Mes documents légaux')}</h2>
                  <p className="text-xs text-zinc-500">{t('profile.myDocumentsSubtitle', 'Consultez vos documents personnels. Cliquez sur Voir pour les visualiser.')}</p>
                </div>
              </div>
              <button type="button" className="profile-action profile-refresh" disabled={state.loading} onClick={refresh}><ProfileIcon name="refresh" />{t('common.refresh', 'Actualiser')}</button>
            </div>
            <div>
              {state.loading && <p role="status" className="profile-feedback">{t('profile.loadingDocuments', 'Chargement des documents…')}</p>}
              {state.error && <div className="space-y-3 profile-feedback"><p role="alert" className="profile-error">{state.error}</p><button type="button" className={buttonClass} onClick={refresh}>{t('common.retry', 'Réessayer')}</button></div>}
              {!state.loading && !state.error && (state.documents.length === 0 ? <p className="profile-feedback">{t('profile.noDocuments', 'Aucun document disponible.')}</p>
                : <table className="profile-document-table w-full" aria-label={t('profile.documentsTableLabel', 'Documents légaux')}>
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th scope="col" className="text-start px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('profile.documentType', 'Type de document')}</th>
                        <th scope="col" className="text-start px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('profile.status', 'Statut')}</th>
                        <th scope="col" className="text-start px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('profile.addedDate', 'Date d\'ajout')}</th>
                        <th scope="col" className="text-start px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('profile.expiryDate', 'Date d\'expiration')}</th>
                        <th scope="col" className="text-start px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.documents.map((document) => {
                        const [label, color] = statuses[document.status]
                        const name = document.documentTypeName || 'Document'
                        return <tr key={document.id} className="border-b border-zinc-100 last:border-0">
                          <td className="px-4 py-3"><div className="profile-document-name flex items-center gap-2"><ProfileIcon name="file" className="w-4 h-4 text-zinc-400" /><span className="font-medium text-zinc-900">{name}</span></div></td>
                          <td className="px-4 py-3"><span className={`profile-status ${color}`}><i className="sr-only" />{label}</span></td>
                          <td className="px-4 py-3 text-zinc-600">{dateLabel(document.uploadedAt)}{document.rejectionReason && <p className="profile-rejection text-rose-600 text-xs mt-1"><span className="sr-only">Motif de rejet : </span>{document.rejectionReason}</p>}</td>
                          <td className="px-4 py-3 text-zinc-600">{document.expiresAt ? dateLabel(document.expiresAt) : '—'}</td>
                          <td className="px-4 py-3"><DocumentAccess id={document.id} name={name} request={request} /></td>
                        </tr>
                      })}</tbody>
                  </table>)}
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto text-center py-4 px-4 text-xs text-zinc-400">
        © {CURRENT_YEAR} EduTrack Platform · Tous droits réservés.
      </footer>
    </div>
  )
}

export default MyDocumentsView