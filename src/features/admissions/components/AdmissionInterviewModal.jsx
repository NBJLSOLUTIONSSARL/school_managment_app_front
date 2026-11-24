import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { admissionWave7Service } from '../api/admissionWave7Service'
import { useToast } from '@/hooks/useToast'
import { Calendar, Clock, Plus, X, Award } from 'lucide-react'

export function AdmissionInterviewModal({ applicationId, candidateName, isOpen, onClose }) {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isScheduling, setIsScheduling] = useState(false)
  const [selectedInterviewForGrade, setSelectedInterviewForGrade] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: '',
    interviewerName: '',
    interviewType: 'INTERVIEW',
    maxScore: 20,
    comments: '',
  })
  const [gradeForm, setGradeForm] = useState({
    score: '',
    status: 'COMPLETED',
    comments: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const loadInterviews = useCallback(async () => {
    if (!applicationId) return
    setLoading(true)
    const res = await admissionWave7Service.getInterviews(applicationId)
    if (res.success) {
      setInterviews(res.data)
    }
    setLoading(false)
  }, [applicationId])

  useEffect(() => {
    const task = Promise.resolve().then(() => {
      if (isOpen) {
        loadInterviews()
        setIsScheduling(false)
        setSelectedInterviewForGrade(null)
      }
    })
    return () => {
      void task
    }
  }, [isOpen, loadInterviews])

  if (!isOpen) return null

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await admissionWave7Service.scheduleInterview(applicationId, {
      ...scheduleForm,
      maxScore: Number(scheduleForm.maxScore),
    })
    if (res.success) {
      toast?.success?.('Entretien/Test planifié avec succès')
      setIsScheduling(false)
      loadInterviews()
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors de la planification')
    }
    setSubmitting(false)
  }

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    if (!selectedInterviewForGrade) return
    setSubmitting(true)
    const res = await admissionWave7Service.recordInterviewResult(
      selectedInterviewForGrade.id,
      {
        ...gradeForm,
        score: Number(gradeForm.score),
      }
    )
    if (res.success) {
      toast?.success?.('Résultat enregistré avec succès')
      setSelectedInterviewForGrade(null)
      loadInterviews()
    } else {
      toast?.error?.(res.error?.message || "Erreur lors de l'enregistrement")
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-lg w-full p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              Entretiens & Tests d'Admission
            </h3>
            <p className="text-2xs text-neutral-500 mt-0.5">
              Candidat : <span className="font-medium text-neutral-700 dark:text-neutral-300">{candidateName}</span>
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

        {/* Action button */}
        {!isScheduling && !selectedInterviewForGrade && (
          <div className="py-3 flex justify-end">
            <button
              onClick={() => setIsScheduling(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
            >
              <Plus className="w-3 h-3" /> Planifier une session
            </button>
          </div>
        )}

        {/* Schedule Form */}
        {isScheduling && (
          <form onSubmit={handleScheduleSubmit} className="py-3 space-y-3 text-xs border-b border-neutral-100 dark:border-neutral-800 mb-3">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
              Planifier un entretien ou test
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Type d'évaluation *
                </label>
                <select
                  value={scheduleForm.interviewType}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs"
                >
                  <option value="INTERVIEW">Entretien oral</option>
                  <option value="WRITTEN_TEST">Épreuve écrite</option>
                  <option value="ORAL_TEST">Test de langues / oral</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Date et Heure *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.interviewDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Examinateur / Jury *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: M. Dupont"
                  value={scheduleForm.interviewerName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Note maximale
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={scheduleForm.maxScore}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, maxScore: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                Remarques / Modalités
              </label>
              <textarea
                rows={2}
                placeholder="Salle, documents requis, etc."
                value={scheduleForm.comments}
                onChange={(e) => setScheduleForm({ ...scheduleForm, comments: e.target.value })}
                className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduling(false)}
                className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-2xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-2xs"
              >
                {submitting ? 'Planification...' : 'Confirmer'}
              </button>
            </div>
          </form>
        )}

        {/* Grade / Result Recording Form */}
        {selectedInterviewForGrade && (
          <form onSubmit={handleGradeSubmit} className="py-3 space-y-3 text-xs border-b border-neutral-100 dark:border-neutral-800 mb-3">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
              Saisir les résultats pour la session du {selectedInterviewForGrade.interviewDate?.replace('T', ' ')}
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Note obtenue (/ {selectedInterviewForGrade.maxScore}) *
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max={selectedInterviewForGrade.maxScore}
                  required
                  placeholder="ex: 16.5"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Statut final *
                </label>
                <select
                  value={gradeForm.status}
                  onChange={(e) => setGradeForm({ ...gradeForm, status: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs"
                >
                  <option value="COMPLETED">Terminé / Noté</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                Appréciation du jury
              </label>
              <textarea
                rows={2}
                placeholder="Commentaires sur la prestation du candidat..."
                value={gradeForm.comments}
                onChange={(e) => setGradeForm({ ...gradeForm, comments: e.target.value })}
                className="w-full px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInterviewForGrade(null)}
                className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-2xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-2xs"
              >
                {submitting ? 'Enregistrement...' : 'Valider la note'}
              </button>
            </div>
          </form>
        )}

        {/* Interviews list */}
        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            Chargement des sessions d'admission...
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            Aucun entretien ni test planifié pour cette candidature.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-60 overflow-y-auto">
            {interviews.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {item.interviewType === 'INTERVIEW'
                        ? 'Entretien oral'
                        : item.interviewType === 'WRITTEN_TEST'
                        ? 'Épreuve écrite'
                        : 'Test oral'}
                    </span>
                    <span className="text-2xs text-neutral-400">
                      avec {item.interviewerName}
                    </span>
                  </div>
                  <div className="text-2xs text-neutral-500 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{item.interviewDate?.replace('T', ' ')}</span>
                  </div>
                  {item.comments && (
                    <p className="text-2xs text-neutral-600 dark:text-neutral-400 mt-1 italic">
                      "{item.comments}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.score != null ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      <Award className="w-3 h-3" />
                      {item.score}/{item.maxScore}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedInterviewForGrade(item)
                        setGradeForm({
                          score: '',
                          status: 'COMPLETED',
                          comments: '',
                        })
                      }}
                      className="px-2 py-1 rounded text-2xs font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition"
                    >
                      Noter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

AdmissionInterviewModal.propTypes = {
  applicationId: PropTypes.number,
  candidateName: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
