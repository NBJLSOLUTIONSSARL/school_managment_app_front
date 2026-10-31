import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { documentError, getDocumentAccess, getMyDocuments } from '../../documents/documentApi'
import ProfileIcon from '../profile/ProfileIcon'

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

export default function LegalDocumentsSection() {
  const { request } = useAuth()
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
    <section id="mes-documents" aria-labelledby="documents-title" className="profile-documents">
      <div className="profile-documents-heading">
        <div className="profile-documents-title"><ProfileIcon name="file" /><div><h2 id="documents-title">Documents légaux</h2><p>Consultez vos documents personnels. Cliquez sur Voir pour les visualiser.</p></div></div>
        <button type="button" className="profile-action profile-refresh" disabled={state.loading} onClick={refresh}><ProfileIcon name="refresh" />Actualiser</button>
      </div>
      <div>
        {state.loading && <p role="status" className="profile-feedback">Chargement des documents…</p>}
        {state.error && <div className="space-y-3 profile-feedback"><p role="alert" className="profile-error">{state.error}</p><button type="button" className={buttonClass} onClick={refresh}>Réessayer</button></div>}
        {!state.loading && !state.error && (state.documents.length === 0 ? <p className="profile-feedback">Aucun document disponible.</p>
          : <table className="profile-document-table" aria-label="Documents légaux"><thead><tr><th scope="col">Type de document</th><th scope="col">Statut</th><th scope="col">Date d’ajout</th><th scope="col">Date d’expiration</th><th scope="col">Actions</th></tr></thead><tbody>{state.documents.map((document) => {
            const [label, color] = statuses[document.status]
            const name = document.documentTypeName || 'Document'
            return <tr key={document.id}>
              <td><div className="profile-document-name"><ProfileIcon name="file" /><span>{name}</span></div></td>
              <td><span className={`profile-status ${color}`}><i />{label}</span></td>
              <td><span className="profile-mobile-label">Date d’ajout</span>{dateLabel(document.uploadedAt)}{document.rejectionReason && <p className="profile-rejection"><span className="sr-only">Motif de rejet : </span>{document.rejectionReason}</p>}</td>
              <td><span className="profile-mobile-label">Date d’expiration</span>{document.expiresAt ? dateLabel(document.expiresAt) : '—'}</td>
              <td><DocumentAccess id={document.id} name={name} request={request} /></td>
            </tr>
          })}</tbody></table>)}
      </div>
    </section>
  )
}
