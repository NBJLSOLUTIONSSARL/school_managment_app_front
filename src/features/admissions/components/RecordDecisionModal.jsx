import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { useI18n } from '@/hooks/useI18n'

export function RecordDecisionModal({ isOpen, onClose, application, onDecisionSaved }) {
  const { t } = useI18n()
  const [status, setStatus] = useState(application?.status || 'UNDER_REVIEW')
  const [decisionNote, setDecisionNote] = useState(application?.decisionNote || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !application) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onDecisionSaved(application.id, { status, decisionNote })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la prise de décision.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Décision d'Admission — ${application.candidateName || `Candidature #${application.id}`}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error" message={error} />}

        <div className="bg-fill-neutral-subtle p-3 rounded border border-border-default space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted">Candidat :</span>
            <span className="font-semibold text-text-default">{application.candidateName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Statut Actuel :</span>
            <span className="font-medium text-primary-default">{application.status}</span>
          </div>
          {application.guardian && (
            <div className="flex justify-between">
              <span className="text-text-muted">Tuteur Légal :</span>
              <span className="text-text-default">{application.guardian.firstName} {application.guardian.lastName} ({application.guardian.phone || application.guardian.email})</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Nouveau Statut / Décision <span className="text-danger-emphasis">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-border-default bg-fill-neutral hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary-focus text-text-default"
            required
          >
            <option value="UNDER_REVIEW">En Cours d'Examen (UNDER_REVIEW)</option>
            <option value="WAITLISTED">Liste d'Attente (WAITLISTED)</option>
            <option value="ACCEPTED">Admis / Accepté (ACCEPTED)</option>
            <option value="REJECTED">Refusé (REJECTED)</option>
          </select>
        </div>

        <div>
          <label className="block text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Note de Décision ou Commentaires
          </label>
          <textarea
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Justification de la décision ou instructions d'inscription..."
            className="w-full text-xs px-2.5 py-1.5 rounded border border-border-default bg-fill-neutral hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary-focus text-text-default"
          />
          <span className="text-2xs text-text-muted">{decisionNote.length}/1000 caractères</span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border-default">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-text-default bg-fill-neutral border border-border-default rounded hover:bg-fill-neutral-hover disabled:opacity-50"
          >
            {t('common.cancel', 'Annuler')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-text-on-primary bg-primary-default rounded hover:bg-primary-hover focus:ring-2 focus:ring-primary-focus disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Valider la décision'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
