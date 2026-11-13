import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, School, ArrowRight, Archive } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { classService } from '../api/classService'
import { academicYearService } from '../api/academicYearService'
import { subjectService } from '../api/subjectService'

export function ClassesList() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [years, setYears] = useState([])
  const [gradeLevels, setGradeLevels] = useState([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState('')

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    academicYearId: '',
    gradeLevelId: '',
    sectionId: '',
    room: '',
    capacity: 30,
    headTeacherId: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Load filter options
  useEffect(() => {
    let active = true
    Promise.resolve().then(async () => {
      const [yearRes, gradeRes] = await Promise.all([
        academicYearService.getAcademicYears(),
        subjectService.getGradeLevels(),
      ])
      if (!active) return
      if (yearRes.success) {
        setYears(yearRes.data || [])
        const activeYear = yearRes.data?.find((y) => y.active)
        if (activeYear) setSelectedYearId(activeYear.id)
      }
      if (gradeRes.success) {
        setGradeLevels(gradeRes.data || [])
      }
    })
    return () => {
      active = false
    }
  }, [])

  const loadClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await classService.getClasses({
      academicYearId: selectedYearId || undefined,
      gradeLevelId: selectedGradeId || undefined,
      search: search || undefined,
      size: 100,
    })
    if (res.success) {
      setClasses(res.data?.items || [])
    } else {
      setError(res.error?.message || 'Erreur lors du chargement des classes')
    }
    setLoading(false)
  }, [selectedYearId, selectedGradeId, search])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) loadClasses()
    })
    return () => {
      active = false
    }
  }, [loadClasses])

  const handleOpenCreate = () => {
    setCreateForm({
      name: '',
      academicYearId: selectedYearId || (years[0]?.id || ''),
      gradeLevelId: gradeLevels[0]?.id || '',
      sectionId: '',
      room: '',
      capacity: 30,
      headTeacherId: '',
    })
    setModalOpen(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...createForm,
      capacity: Number(createForm.capacity) || 30,
      academicYearId: Number(createForm.academicYearId),
      gradeLevelId: Number(createForm.gradeLevelId),
      sectionId: createForm.sectionId ? Number(createForm.sectionId) : null,
      headTeacherId: createForm.headTeacherId ? Number(createForm.headTeacherId) : null,
      room: createForm.room?.trim() || null,
    }
    const res = await classService.createClass(payload)
    setSubmitting(false)
    if (res.success) {
      setModalOpen(false)
      loadClasses()
    } else {
      alert(res.error?.message || 'Erreur lors de la création de la classe')
    }
  }

  const handleArchive = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Archiver cette classe ?')) return
    const res = await classService.archiveClass(id)
    if (res.success) {
      loadClasses()
    } else {
      alert(res.error?.message || "Impossible d'archiver la classe")
    }
  }

  return (
    <div className="space-y-4">
      {/* Top action & filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Classes & Groupes Pédagogiques</h1>
          <p className="text-2xs text-slate-500">
            Gestion des cohortes, des capacités et des professeurs principaux.
          </p>
        </div>
        <Button size="xs" onClick={handleOpenCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nouvelle Classe
        </Button>
      </div>

      {/* Filter strip */}
      <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-3 text-xs">
        <input
          type="text"
          placeholder="Rechercher par nom, salle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 w-52 rounded border border-slate-200 px-2.5 text-2xs focus:border-slate-400 focus:outline-none"
        />
        <select
          value={selectedYearId}
          onChange={(e) => setSelectedYearId(e.target.value)}
          aria-label="Filtrer par année scolaire"
          className="h-7 rounded border border-slate-200 px-2 text-2xs text-slate-700 focus:outline-none"
        >
          <option value="">Toutes les années</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name} {y.active ? '★ En cours' : ''}
            </option>
          ))}
        </select>
        <select
          value={selectedGradeId}
          onChange={(e) => setSelectedGradeId(e.target.value)}
          aria-label="Filtrer par niveau scolaire"
          className="h-7 rounded border border-slate-200 px-2 text-2xs text-slate-700 focus:outline-none"
        >
          <option value="">Tous les niveaux</option>
          {gradeLevels.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
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
              <th className="px-4 py-2.5">Classe</th>
              <th className="px-4 py-2.5">Année</th>
              <th className="px-4 py-2.5">Niveau</th>
              <th className="px-4 py-2.5">Salle</th>
              <th className="px-4 py-2.5">Professeur Principal</th>
              <th className="px-4 py-2.5">Remplissage / Capacité</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Chargement des classes...
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Aucune classe trouvée pour ces critères.
                </td>
              </tr>
            ) : (
              classes.map((c) => {
                const enrolled = c.enrolledStudentsCount || 0
                const cap = c.capacity || 30
                const pct = Math.round((enrolled / cap) * 100)
                const isFull = enrolled >= cap

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/classes/${c.id}`)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-slate-400" />
                        <span>{c.name}</span>
                        {c.status === 'ARCHIVED' && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-3xs text-amber-800">
                            Archivée
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.academicYearName || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.gradeLevelName || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.room || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.headTeacherName || 'Non assigné'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${
                              isFull
                                ? 'bg-rose-500'
                                : pct >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-2xs font-semibold ${
                            isFull ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {enrolled}/{cap}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="2xs"
                          variant="ghost"
                          onClick={(e) => handleArchive(c.id, e)}
                          title="Archiver"
                        >
                          <Archive className="h-3 w-3 text-slate-400 hover:text-amber-600" />
                        </Button>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Créer une nouvelle classe"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
          <Input
            label="Nom de la classe (ex: 6ème A, Seconde 1)"
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Nom de classe"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-2xs font-medium text-slate-700">
                Année Scolaire *
              </label>
              <select
                required
                value={createForm.academicYearId}
                onChange={(e) => setCreateForm({ ...createForm, academicYearId: e.target.value })}
                className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.active ? '(En cours)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-2xs font-medium text-slate-700">
                Niveau Scolaire *
              </label>
              <select
                required
                value={createForm.gradeLevelId}
                onChange={(e) => setCreateForm({ ...createForm, gradeLevelId: e.target.value })}
                className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {gradeLevels.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Salle de cours (optionnel)"
              placeholder="Bât A - Salle 102"
              value={createForm.room}
              onChange={(e) => setCreateForm({ ...createForm, room: e.target.value })}
            />
            <Input
              type="number"
              label="Capacité maximale d'élèves *"
              min="1"
              max="60"
              required
              value={createForm.capacity}
              onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="xs" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="xs" disabled={submitting}>
              {submitting ? 'Création...' : 'Créer la classe'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
