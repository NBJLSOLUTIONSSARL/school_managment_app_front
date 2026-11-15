import React, { useCallback, useEffect, useState } from 'react'
import { documentTypeService } from '../api/documentTypeService'
import { useToast } from '@/hooks/useToast'
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Shield,
} from 'lucide-react'

export function DocumentTypesManager() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applicableRole: 'STUDENT',
    maxSizeMb: 10,
    required: true,
    active: true,
  })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const loadTypes = useCallback(async () => {
    setLoading(true)
    const res = await documentTypeService.getDocumentTypes(false)
    if (res.success) {
      setTypes(res.data)
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors du chargement des types')
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    const task = Promise.resolve().then(() => loadTypes())
    return () => {
      void task
    }
  }, [loadTypes])

  const handleOpenModal = (docType = null) => {
    if (docType) {
      setEditingType(docType)
      setFormData({
        name: docType.name || '',
        description: docType.description || '',
        applicableRole: docType.applicableRole || 'STUDENT',
        maxSizeMb: docType.maxSizeMb || 10,
        required: docType.required ?? true,
        active: docType.active ?? true,
      })
    } else {
      setEditingType(null)
      setFormData({
        name: '',
        description: '',
        applicableRole: 'STUDENT',
        maxSizeMb: 10,
        required: true,
        active: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    let res
    if (editingType) {
      res = await documentTypeService.updateDocumentType(editingType.id, formData)
    } else {
      res = await documentTypeService.createDocumentType(formData)
    }

    if (res.success) {
      toast?.success?.(
        editingType
          ? 'Type de document mis à jour'
          : 'Nouveau type de document créé'
      )
      setIsModalOpen(false)
      loadTypes()
    } else {
      toast?.error?.(res.error?.message || "Erreur lors de l'enregistrement")
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce type de document ?')) return
    const res = await documentTypeService.deleteDocumentType(id)
    if (res.success) {
      toast?.success?.('Type de document supprimé')
      loadTypes()
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            Types de Documents & Conformité
          </h2>
          <p className="text-2xs text-neutral-500 mt-0.5">
            Configurez les pièces justificatives obligatoires par rôle (Élèves, Enseignants, Personnel).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter un type
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-500">
          Chargement des types de documents...
        </div>
      ) : types.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-500">
          Aucun type de document configuré.
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 text-2xs uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Nom</th>
                <th className="py-2.5 px-3">Rôle Cible</th>
                <th className="py-2.5 px-3">Obligatoire</th>
                <th className="py-2.5 px-3">Taille Max</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {types.map((type) => (
                <tr
                  key={type.id}
                  className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition"
                >
                  <td className="py-3 px-3">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {type.name}
                    </span>
                    {type.description && (
                      <p className="text-2xs text-neutral-500 mt-0.5 truncate max-w-xs">
                        {type.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      <Shield className="w-2.5 h-2.5" />
                      {type.applicableRole}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {type.required ? (
                      <span className="text-2xs font-medium text-rose-600 dark:text-rose-400">
                        Obligatoire
                      </span>
                    ) : (
                      <span className="text-2xs text-neutral-400">Facultatif</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                    {type.maxSizeMb} Mo
                  </td>
                  <td className="py-3 px-3">
                    {type.active ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-medium text-neutral-400">
                        <X className="w-3 h-3" /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(type)}
                        aria-label={`Modifier ${type.name}`}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        aria-label={`Supprimer ${type.name}`}
                        className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              {editingType ? 'Modifier le Type de Document' : 'Nouveau Type de Document'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom du document *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Certificat de Vaccination"
                  className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="ex: Carnet de santé à jour ou attestation médicale..."
                  className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Rôle Applicable *
                  </label>
                  <select
                    value={formData.applicableRole}
                    onChange={(e) => setFormData({ ...formData, applicableRole: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                  >
                    <option value="ALL">Tous les profils</option>
                    <option value="STUDENT">Élèves</option>
                    <option value="TEACHER">Enseignants</option>
                    <option value="STAFF">Personnel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Taille Max (Mo) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.maxSizeMb}
                    onChange={(e) => setFormData({ ...formData, maxSizeMb: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                  <span className="text-2xs text-neutral-700 dark:text-neutral-300">
                    Document obligatoire
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                  <span className="text-2xs text-neutral-700 dark:text-neutral-300">Actif</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-medium transition"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
