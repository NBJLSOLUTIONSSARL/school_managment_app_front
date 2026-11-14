import { useState } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, FileText, Send, X } from 'lucide-react'
import { attendanceService } from '../api/attendanceService'

export function JustificationModal({
  isOpen,
  onClose,
  record,
  documents = [],
  onSubmitted,
}) {
  const [reason, setReason] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !record) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Veuillez renseigner un motif pour justifier cette absence.')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload = {
      attendanceRecordId: record.id,
      reason: reason.trim(),
      documentId: documentId ? Number(documentId) : undefined,
    }

    const res = await attendanceService.submitJustification(payload)
    setSubmitting(false)

    if (res.success) {
      setReason('')
      setDocumentId('')
      onSubmitted?.()
      onClose()
    } else {
      setError(res.error?.message || 'Erreur lors de la soumission du justificatif')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Justifier une absence
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-500">Élève :</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {record.studentName} ({record.className})
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-500">Date d'absence :</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {record.attendanceDate}
            </span>
          </div>
          {record.subjectName && (
            <div className="flex justify-between mt-1">
              <span className="text-slate-500">Cours concerné :</span>
              <span className="text-slate-900 dark:text-white">
                {record.subjectName} ({record.timeSlotLabel})
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Motif de l'absence *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Rendez-vous médical chez le médecin traitant, certificat fourni..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Pièce justificative (optionnelle)
            </label>
            <select
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
            >
              <option value="">Sélectionner un document déjà téléversé</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.documentType?.name || doc.fileUrl}
                </option>
              ))}
            </select>
            <p className="mt-1 text-3xs text-slate-400">
              Vous pouvez associer un certificat médical ou une lettre téléversée dans vos documents légaux.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Envoi...' : 'Transmettre le justificatif'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

JustificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.object,
  documents: PropTypes.array,
  onSubmitted: PropTypes.func,
}

export default JustificationModal
