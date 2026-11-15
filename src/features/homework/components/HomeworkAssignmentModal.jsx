import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { homeworkWave7Service } from '../api/homeworkWave7Service'
import { useToast } from '@/hooks/useToast'
import { FileQuestion, CheckCircle2, X } from 'lucide-react'

export function HomeworkAssignmentModal({
  isOpen,
  onClose,
  classes = [],
  subjects = [],
  teacherId = 1,
  onAssignmentCreated,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: classes[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    dueDate: '',
    attachmentUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.classId || !form.subjectId || !form.dueDate) {
      toast?.error?.('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSubmitting(true)
    const res = await homeworkWave7Service.createAssignment({
      title: form.title,
      description: form.description,
      classId: Number(form.classId),
      subjectId: Number(form.subjectId),
      teacherId: Number(teacherId),
      dueDate: form.dueDate,
      attachmentUrl: form.attachmentUrl || null,
    })

    if (res.success) {
      toast?.success?.('Devoir créé avec succès')
      onAssignmentCreated?.(res.data)
      onClose()
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors de la création du devoir')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            Nouveau Devoir à Rendre
          </h3>
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
              Titre du devoir *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Dissertation - Le Siècle des Lumières"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Classe Cible *
              </label>
              <select
                required
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Matière *
              </label>
              <select
                required
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Date & Heure Limite de Rendu *
            </label>
            <input
              type="datetime-local"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Consignes & Énoncé
            </label>
            <textarea
              rows={3}
              placeholder="Instructions détaillées pour les élèves..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Pièce Jointe / Sujet (URL ou fichier)
            </label>
            <input
              type="text"
              placeholder="/files/devoirs/sujet.pdf"
              value={form.attachmentUrl}
              onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
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
              {submitting ? 'Création...' : 'Créer le devoir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

HomeworkAssignmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.array,
  subjects: PropTypes.array,
  teacherId: PropTypes.number,
  onAssignmentCreated: PropTypes.func,
}
