import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle, Calendar, Archive, Trash2, Edit2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { academicYearService } from '../api/academicYearService'

export function AcademicYearsList() {
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Year Modal
  const [yearModalOpen, setYearModalOpen] = useState(false)
  const [editingYear, setEditingYear] = useState(null)
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', active: false })
  const [submittingYear, setSubmittingYear] = useState(false)

  // Term Modal
  const [termModalOpen, setTermModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(null)
  const [termForm, setTermForm] = useState({ name: '', startDate: '', endDate: '', active: false })
  const [submittingTerm, setSubmittingTerm] = useState(false)

  const loadYears = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await academicYearService.getAcademicYears()
    if (res.success) {
      setYears(res.data || [])
    } else {
      setError(res.error?.message || 'Erreur lors du chargement des années académiques')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) loadYears()
    })
    return () => {
      active = false
    }
  }, [loadYears])

  const handleOpenCreateYear = () => {
    setEditingYear(null)
    setYearForm({ name: '', startDate: '', endDate: '', active: false })
    setYearModalOpen(true)
  }

  const handleOpenEditYear = (year) => {
    setEditingYear(year)
    setYearForm({
      name: year.name || '',
      startDate: year.startDate || '',
      endDate: year.endDate || '',
      active: !!year.active,
    })
    setYearModalOpen(true)
  }

  const handleSaveYear = async (e) => {
    e.preventDefault()
    setSubmittingYear(true)
    let res
    if (editingYear) {
      res = await academicYearService.updateAcademicYear(editingYear.id, yearForm)
    } else {
      res = await academicYearService.createAcademicYear(yearForm)
    }
    setSubmittingYear(false)
    if (res.success) {
      setYearModalOpen(false)
      loadYears()
    } else {
      alert(res.error?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleActivateYear = async (yearId) => {
    if (!window.confirm('Activer cette année scolaire ? Elle deviendra la seule année active.')) return
    const res = await academicYearService.activateAcademicYear(yearId)
    if (res.success) {
      loadYears()
    } else {
      alert(res.error?.message || "Impossible d'activer l'année")
    }
  }

  const handleDeleteOrArchiveYear = async (year) => {
    const msg = year.hasDependentData
      ? `Cette année possède des données dépendantes et sera ARCHIVÉE. Confirmer ?`
      : `Supprimer ou archiver l'année ${year.name} ?`
    if (!window.confirm(msg)) return
    const res = await academicYearService.deleteOrArchiveAcademicYear(year.id)
    if (res.success) {
      loadYears()
    } else {
      alert(res.error?.message || 'Action impossible')
    }
  }

  const handleOpenTerms = (year) => {
    setSelectedYear(year)
    setTermForm({ name: '', startDate: '', endDate: '', active: false })
    setTermModalOpen(true)
  }

  const handleAddTerm = async (e) => {
    e.preventDefault()
    if (!selectedYear) return
    setSubmittingTerm(true)
    const res = await academicYearService.createTerm(selectedYear.id, termForm)
    setSubmittingTerm(false)
    if (res.success) {
      setTermForm({ name: '', startDate: '', endDate: '', active: false })
      const updated = await academicYearService.getAcademicYearById(selectedYear.id)
      if (updated.success) {
        setSelectedYear(updated.data)
      }
      loadYears()
    } else {
      alert(res.error?.message || "Erreur lors de l'ajout du trimestre")
    }
  }

  const handleActivateTerm = async (termId) => {
    const res = await academicYearService.activateTerm(termId)
    if (res.success) {
      if (selectedYear) {
        const updated = await academicYearService.getAcademicYearById(selectedYear.id)
        if (updated.success) setSelectedYear(updated.data)
      }
      loadYears()
    } else {
      alert(res.error?.message || 'Impossible d’activer ce trimestre')
    }
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Années Scolaires & Trimestres</h1>
          <p className="text-2xs text-slate-500">
            Structure temporelle de l'établissement (une seule année active à la fois).
          </p>
        </div>
        <Button size="xs" onClick={handleOpenCreateYear}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nouvelle Année Scolaire
        </Button>
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
              <th className="px-4 py-2.5">Année Scolaire</th>
              <th className="px-4 py-2.5">Période</th>
              <th className="px-4 py-2.5">Statut</th>
              <th className="px-4 py-2.5">Trimestres</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Chargement des années...
                </td>
              </tr>
            ) : years.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Aucune année scolaire configurée.
                </td>
              </tr>
            ) : (
              years.map((y) => {
                const isArchived = y.status === 'ARCHIVED'
                const isActive = y.active
                const termsCount = Array.isArray(y.terms) ? y.terms.length : 0

                return (
                  <tr key={y.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{y.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {y.startDate || '—'} au {y.endDate || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {isActive ? (
                        <StatusBadge status="ACTIVE" customLabel="En cours" showDot />
                      ) : isArchived ? (
                        <StatusBadge status="ARCHIVED" customLabel="Archivée" />
                      ) : (
                        <StatusBadge status="INACTIVE" customLabel="Clôturée / Future" />
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenTerms(y)}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        <Layers className="h-3 w-3" />
                        {termsCount} trimestre{termsCount > 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isActive && !isArchived && (
                          <Button
                            size="2xs"
                            variant="outline"
                            onClick={() => handleActivateYear(y.id)}
                            title="Rendre active"
                          >
                            <CheckCircle className="mr-1 h-3 w-3 text-emerald-600" />
                            Activer
                          </Button>
                        )}
                        <Button
                          size="2xs"
                          variant="ghost"
                          onClick={() => handleOpenEditYear(y)}
                          title="Modifier"
                        >
                          <Edit2 className="h-3 w-3 text-slate-500" />
                        </Button>
                        {!isActive && (
                          <Button
                            size="2xs"
                            variant="ghost"
                            onClick={() => handleDeleteOrArchiveYear(y)}
                            title="Archiver / Supprimer"
                          >
                            {y.hasDependentData ? (
                              <Archive className="h-3 w-3 text-amber-600" />
                            ) : (
                              <Trash2 className="h-3 w-3 text-rose-500" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Year Create/Edit Modal */}
      <Modal
        isOpen={yearModalOpen}
        onClose={() => setYearModalOpen(false)}
        title={editingYear ? "Modifier l'année scolaire" : 'Nouvelle Année Scolaire'}
        size="md"
      >
        <form onSubmit={handleSaveYear} className="space-y-3 text-xs">
          <Input
            label="Nom de l'année (ex: 2026-2027)"
            required
            value={yearForm.name}
            onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
            placeholder="YYYY-YYYY"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Date de rentrée"
              required
              value={yearForm.startDate}
              onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
            />
            <Input
              type="date"
              label="Date de fin"
              required
              value={yearForm.endDate}
              onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeYearCheck"
              checked={yearForm.active}
              onChange={(e) => setYearForm({ ...yearForm, active: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-0"
            />
            <label htmlFor="activeYearCheck" className="text-slate-700">
              Définir comme l'année scolaire active actuelle
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="xs" onClick={() => setYearModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="xs" disabled={submittingYear}>
              {submittingYear ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Terms Management Drawer/Modal */}
      <Modal
        isOpen={termModalOpen}
        onClose={() => setTermModalOpen(false)}
        title={`Trimestres • ${selectedYear?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Terms table */}
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="w-full text-left text-2xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
                <tr>
                  <th className="px-3 py-2">Nom du Trimestre</th>
                  <th className="px-3 py-2">Période</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!selectedYear?.terms || selectedYear.terms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Aucun trimestre pour cette année.
                    </td>
                  </tr>
                ) : (
                  selectedYear.terms.map((t) => (
                    <tr key={t.id}>
                      <td className="px-3 py-2 font-medium text-slate-800">{t.name}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {t.startDate} au {t.endDate}
                      </td>
                      <td className="px-3 py-2">
                        {t.active ? (
                          <StatusBadge status="ACTIVE" customLabel="En cours" showDot />
                        ) : (
                          <StatusBadge status="INACTIVE" customLabel="Inactif" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {!t.active && (
                          <Button size="2xs" variant="outline" onClick={() => handleActivateTerm(t.id)}>
                            Activer
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Term Form */}
          <form onSubmit={handleAddTerm} className="rounded border border-slate-100 bg-slate-50 p-3 space-y-2">
            <h4 className="text-2xs font-semibold text-slate-800">Ajouter un trimestre</h4>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Nom"
                placeholder="Trimestre 1"
                required
                value={termForm.name}
                onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
              />
              <Input
                type="date"
                label="Début"
                required
                value={termForm.startDate}
                onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })}
              />
              <Input
                type="date"
                label="Fin"
                required
                value={termForm.endDate}
                onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" size="xs" disabled={submittingTerm}>
                {submittingTerm ? 'Ajout...' : 'Ajouter le trimestre'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
