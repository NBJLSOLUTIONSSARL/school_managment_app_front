import { useState, useEffect, useCallback } from 'react'
import { Plus, BookOpen, Clock, Award, Trash2, Edit2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { subjectService } from '../api/subjectService'

export function SubjectsList() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // Modal Create/Edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    coefficient: 1.0,
    weeklyHours: 2.0,
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const loadSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await subjectService.getSubjects({ search, size: 100 })
    if (res.success) {
      setSubjects(res.data?.items || [])
    } else {
      setError(res.error?.message || 'Erreur lors du chargement des matières')
    }
    setLoading(false)
  }, [search])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) loadSubjects()
    })
    return () => {
      active = false
    }
  }, [loadSubjects])

  const handleOpenCreate = () => {
    setEditingSubject(null)
    setForm({
      code: '',
      name: '',
      coefficient: 1.0,
      weeklyHours: 2.0,
      description: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject)
    setForm({
      code: subject.code || '',
      name: subject.name || '',
      coefficient: subject.coefficient ?? 1.0,
      weeklyHours: subject.weeklyHours ?? 2.0,
      description: subject.description || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...form,
      coefficient: Number(form.coefficient) || 1.0,
      weeklyHours: Number(form.weeklyHours) || 2.0,
      description: form.description?.trim() || null,
    }
    let res
    if (editingSubject) {
      res = await subjectService.updateSubject(editingSubject.id, payload)
    } else {
      res = await subjectService.createSubject(payload)
    }
    setSubmitting(false)
    if (res.success) {
      setModalOpen(false)
      loadSubjects()
    } else {
      alert(res.error?.message || 'Erreur lors de la sauvegarde de la matière')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette matière ?')) return
    const res = await subjectService.deleteSubject(id)
    if (res.success) {
      loadSubjects()
    } else {
      alert(res.error?.message || 'Impossible de supprimer cette matière')
    }
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Matières & Disciplines</h1>
          <p className="text-2xs text-slate-500">
            Catalogue académique des matières enseignées, coefficients et volumes horaires.
          </p>
        </div>
        <Button size="xs" onClick={handleOpenCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nouvelle Matière
        </Button>
      </div>

      {/* Search strip */}
      <div className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3 text-xs">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 w-full rounded border border-slate-200 pl-8 pr-2.5 text-2xs focus:border-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
            <tr>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Nom de la matière</th>
              <th className="px-4 py-2.5">Coefficient</th>
              <th className="px-4 py-2.5">Heures / semaine</th>
              <th className="px-4 py-2.5">Description</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Chargement des matières...
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Aucune matière enregistrée.
                </td>
              </tr>
            ) : (
              subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">
                    {s.code}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>{s.coefficient}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{s.weeklyHours} h</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{s.description || '—'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="2xs"
                        variant="ghost"
                        onClick={() => handleOpenEdit(s)}
                        title="Modifier"
                      >
                        <Edit2 className="h-3 w-3 text-slate-500" />
                      </Button>
                      <Button
                        size="2xs"
                        variant="ghost"
                        onClick={() => handleDelete(s.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3 text-rose-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? 'Modifier la matière' : 'Nouvelle Matière'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Code Matière (ex: MATH, FR, HIST)"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="CODE"
            />
            <div className="col-span-2">
              <Input
                label="Nom complet de la matière"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mathématiques"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              label="Coefficient pondérateur *"
              required
              value={form.coefficient}
              onChange={(e) => setForm({ ...form, coefficient: e.target.value })}
            />
            <Input
              type="number"
              step="0.5"
              min="0.5"
              max="40"
              label="Heures hebdomadaires *"
              required
              value={form.weeklyHours}
              onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-2xs font-medium text-slate-700">
              Description ou objectifs pédagogiques
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded border border-slate-200 p-2 text-xs focus:border-slate-400 focus:outline-none"
              placeholder="Programme officiel, niveau recommandé..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="xs" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="xs" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
