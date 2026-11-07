import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { CheckCircle2, UserPlus, Clock, FileText, AlertCircle, XCircle } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'

export function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onOpenDecision,
  onConvertToStudent,
}) {
  const { t } = useI18n()
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState(null)
  const [convertSuccess, setConvertSuccess] = useState(null)

  if (!isOpen || !application) return null

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
            <CheckCircle2 className="w-3 h-3" /> Admis (ACCEPTED)
          </span>
        )
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
            <Clock className="w-3 h-3" /> En Examen (UNDER_REVIEW)
          </span>
        )
      case 'WAITLISTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-neutral-subtle text-neutral-emphasis border border-neutral-subtle">
            <AlertCircle className="w-3 h-3" /> Liste d'attente
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
            <XCircle className="w-3 h-3" /> Refusé (REJECTED)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-neutral-subtle text-neutral-emphasis border border-neutral-subtle">
            {status || 'SUBMITTED'}
          </span>
        )
    }
  }

  const handleConvert = async () => {
    if (!window.confirm(`Confirmez-vous l'inscription définitive et la conversion du candidat "${application.candidateName}" en élève inscrit ?`)) {
      return
    }
    setConverting(true)
    setConvertError(null)
    setConvertSuccess(null)
    try {
      const student = await onConvertToStudent(application.id)
      setConvertSuccess(`Élève inscrit avec succès. Matricule attribué : ${student?.studentNumber || 'Inscrit'}`)
    } catch (err) {
      setConvertError(err.response?.data?.message || err.message || 'Impossible de convertir en élève.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Candidature #${application.id} — ${application.candidateName || 'Dossier'}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {convertError && <Alert variant="error" message={convertError} />}
        {convertSuccess && <Alert variant="success" message={convertSuccess} />}

        {/* Header summary */}
        <div className="flex items-center justify-between p-3 bg-fill-neutral-subtle rounded border border-border-default">
          <div>
            <h3 className="text-sm font-semibold text-text-default">{application.candidateName}</h3>
            <p className="text-2xs text-text-muted">
              Déposé le {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}
              {application.candidateBirthDate && ` • Né(e) le ${new Date(application.candidateBirthDate).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(application.status)}
            {application.student && (
              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                Inscrit (Élève #{application.student.studentNumber || application.student.id})
              </span>
            )}
          </div>
        </div>

        {/* Tuteur & Contact info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border border-border-default rounded space-y-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">Tuteur Légal / Parent</span>
            {application.guardian ? (
              <div>
                <p className="font-semibold text-text-default">
                  {application.guardian.firstName} {application.guardian.lastName}
                </p>
                <p className="text-text-muted">{application.guardian.email || 'Aucun email'}</p>
                <p className="text-text-muted">{application.guardian.phone || 'Aucun téléphone'}</p>
              </div>
            ) : (
              <p className="text-text-muted italic">Aucun tuteur rattaché.</p>
            )}
          </div>

          <div className="p-3 border border-border-default rounded space-y-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">Décision & Notes Administratives</span>
            <p className="text-text-default whitespace-pre-wrap">
              {application.decisionNote || <span className="text-text-muted italic">Aucune note de décision enregistrée.</span>}
            </p>
          </div>
        </div>

        {/* Documents */}
        <div className="border border-border-default rounded p-3 space-y-2">
          <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">Pièces Justificatives Déposées</span>
          {application.documents && application.documents.length > 0 ? (
            <div className="divide-y divide-border-default">
              {application.documents.map((doc) => (
                <div key={doc.id} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted" />
                    <span className="font-medium text-text-default">{doc.fileName || `Document #${doc.id}`}</span>
                    <span className="text-2xs text-text-muted">({doc.fileType || 'Fichier'})</span>
                  </div>
                  {doc.downloadUrl && (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-default hover:underline font-medium text-2xs"
                    >
                      Consulter
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted italic">Aucune pièce justificative attachée à cette candidature.</p>
          )}
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border-default">
          <div>
            {application.status === 'ACCEPTED' && !application.student && (
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-on-primary bg-success-default rounded hover:bg-success-hover focus:ring-2 focus:ring-success-focus disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {converting ? 'Conversion en cours...' : 'Inscrire comme Élève Officiel'}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-text-default bg-fill-neutral border border-border-default rounded hover:bg-fill-neutral-hover"
            >
              {t('common.close', 'Fermer')}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenDecision(application)
              }}
              className="px-3 py-1.5 text-xs font-semibold text-text-on-primary bg-primary-default rounded hover:bg-primary-hover focus:ring-2 focus:ring-primary-focus"
            >
              Modifier le Statut / Décision
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
