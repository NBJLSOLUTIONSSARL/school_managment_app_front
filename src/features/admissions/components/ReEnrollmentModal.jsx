import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { admissionWave7Service } from '../api/admissionWave7Service'
import { useToast } from '@/hooks/useToast'
import { RotateCw, CheckCircle2, X } from 'lucide-react'

export function ReEnrollmentModal({
  studentId,
  studentName,
  isOpen,
  onClose,
  academicYearId = 1,
  gradeLevels = [],
}) {
  const [form, setForm] = useState({
    academicYearId: academicYearId,
    targetGradeLevelId: gradeLevels[0]?.id || '',
    paymentReference: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await admissionWave7Service.submitReEnrollment(studentId, {
      academicYearId: Number(form.academicYearId),
      targetGradeLevelId: form.targetGradeLevelId ? Number(form.targetGradeLevelId) : null,
      paymentReference: form.paymentReference || null,
    })

    if (res.success) {
      toast?.success?.('Demande de réinscription soumise avec succès')
      onClose()
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors de la soumission')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              Réinscription Annuelle
            </h3>
            <p className="text-2xs text-neutral-500 mt-0.5">
              Élève : <span className="font-medium text-neutral-700 dark:text-neutral-300">{studentName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
          <div>
            <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Année Académique Cible *
            </label>
            <input
              type="text"
              disabled
              value="2026 – 2027"
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Niveau Scolaire Souhaité
            </label>
            <select
              value={form.targetGradeLevelId}
              onChange={(e) => setForm({ ...form, targetGradeLevelId: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-hidden"
            >
              <option value="">Sélectionner un niveau supérieur</option>
              {gradeLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} ({lvl.cycle || lvl.stage || 'Niveau'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Référence du Paiement des Frais d'Inscription
            </label>
            <input
              type="text"
              placeholder="ex: VIR-2026-9988 ou CHQ-00124"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded text-2xs text-neutral-500 space-y-1">
            <p>
              • La réinscription est soumise à la validation administrative et pédagogique.
            </p>
            <p>
              • Les pièces justificatives expirées devront être renouvelées via le dossier documentaire.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {submitting ? 'Envoi...' : 'Soumettre la réinscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

ReEnrollmentModal.propTypes = {
  studentId: PropTypes.number.isRequired,
  studentName: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  academicYearId: PropTypes.number,
  gradeLevels: PropTypes.array,
}
