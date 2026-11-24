import { useState } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, CheckCircle2, FileText, XCircle, X } from 'lucide-react'
import { attendanceService } from '../api/attendanceService'

export function PendingJustificationsModal({
  isOpen,
  onClose,
  justifications = [],
  onReviewed,
}) {
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleApprove = async (id) => {
    setProcessingId(id)
    setError(null)
    const res = await attendanceService.reviewJustification(id, {
      status: 'APPROVED',
      reviewNote: 'Justificatif validé par la vie scolaire',
    })
    setProcessingId(null)
    if (res.success) {
      onReviewed?.()
    } else {
      setError(res.error?.message || "Erreur lors de l'approbation du justificatif")
    }
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      setError('Veuillez renseigner un motif pour le rejet.')
      return
    }

    setProcessingId(id)
    setError(null)
    const res = await attendanceService.reviewJustification(id, {
      status: 'REJECTED',
      reviewNote: rejectReason.trim(),
    })
    setProcessingId(null)
    if (res.success) {
      setRejectingId(null)
      setRejectReason('')
      onReviewed?.()
    } else {
      setError(res.error?.message || 'Erreur lors du rejet du justificatif')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Validation des justificatifs d'absence
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

        <div className="mt-4 max-h-96 overflow-y-auto space-y-3">
          {justifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              Aucun justificatif d'absence en attente de révision.
            </div>
          ) : (
            justifications.map((j) => (
              <div
                key={j.id}
                className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {j.studentName}
                    </span>
                    <span className="ml-2 font-mono text-2xs text-slate-500">
                      ({j.className} • {j.studentNumber})
                    </span>
                  </div>
                  <span className="font-mono text-2xs font-bold text-slate-600 dark:text-slate-300">
                    Absence du {j.attendanceDate}
                  </span>
                </div>

                <div className="mt-2 rounded-lg bg-white p-2.5 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <p className="font-medium text-slate-500 text-2xs uppercase tracking-wider mb-0.5">
                    Motif renseigné par {j.submittedByName} :
                  </p>
                  <p>{j.reason}</p>
                </div>

                {j.documentTitle && (
                  <div className="mt-2 flex items-center gap-1.5 text-2xs text-blue-600 dark:text-blue-400">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Pièce jointe : {j.documentTitle}</span>
                  </div>
                )}

                {rejectingId === j.id ? (
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/40 p-2.5 dark:border-rose-900 dark:bg-rose-950/20">
                    <label className="block text-2xs font-semibold text-rose-800 dark:text-rose-300 mb-1">
                      Motif du rejet :
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex: Document illisible, absence non autorisée..."
                      className="w-full rounded border border-rose-300 bg-white px-2 py-1 text-xs focus:outline-none dark:bg-slate-900"
                    />
                    <div className="mt-2 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null)
                          setRejectReason('')
                        }}
                        className="rounded px-2 py-1 text-2xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(j.id)}
                        disabled={processingId === j.id}
                        className="rounded bg-rose-600 px-2.5 py-1 text-2xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                      >
                        Confirmer le rejet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingId(j.id)}
                      disabled={processingId === j.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1 text-2xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 cursor-pointer"
                    >
                      <XCircle className="h-3 w-3" /> Rejeter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(j.id)}
                      disabled={processingId === j.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-2xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Valider (Excusée)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

PendingJustificationsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  justifications: PropTypes.array,
  onReviewed: PropTypes.func,
}

export default PendingJustificationsModal
