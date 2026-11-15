import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { documentTypeService } from '../api/documentTypeService'
import { useToast } from '@/hooks/useToast'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Archive,
  RefreshCw,
} from 'lucide-react'

export function DocumentComplianceChecklist({ userId, studentId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchChecklist = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await documentTypeService.getChecklist({ userId, studentId })
    if (res.success) {
      setItems(res.data)
    } else {
      setError(res.error?.message || 'Erreur lors du chargement du dossier documentaire')
    }
    setLoading(false)
  }, [userId, studentId])

  useEffect(() => {
    const task = Promise.resolve().then(() => fetchChecklist())
    return () => {
      void task
    }
  }, [fetchChecklist])

  const handleArchive = async (documentId) => {
    if (!documentId) return
    const res = await documentTypeService.archiveDocument(documentId)
    if (res.success) {
      toast?.success?.('Document archivé avec succès')
      fetchChecklist()
    } else {
      toast?.error?.(res.error?.message || "Erreur lors de l'archivage")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Approuvé
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3" />
            Expiré
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            Rejeté
          </span>
        )
      case 'MISSING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800">
            <AlertTriangle className="w-3 h-3" />
            Manquant
          </span>
        )
    }
  }

  const approvedCount = items.filter((i) => i.status === 'APPROVED').length
  const requiredCount = items.filter((i) => i.required).length

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Dossier de Conformité Documentaire
          </h3>
          <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {approvedCount}/{items.length} documents
          </span>
        </div>
        <button
          onClick={fetchChecklist}
          disabled={loading}
          aria-label="Actualiser la liste"
          className="p-1.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Vérification des pièces justificatives...
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-rose-600 dark:text-rose-400">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Aucun document requis pour ce profil.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 mt-2">
          {items.map((item) => (
            <div
              key={item.documentTypeId}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {item.documentTypeName}
                  </span>
                  {item.required ? (
                    <span className="text-2xs text-rose-600 dark:text-rose-400 font-medium">
                      * Obligatoire
                    </span>
                  ) : (
                    <span className="text-2xs text-neutral-400">Facultatif</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-2xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
                {item.expiresAt && (
                  <p className="text-2xs text-neutral-400 mt-0.5">
                    Expire le {item.expiresAt}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {getStatusBadge(item.status)}

                {item.existingDocumentId && item.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => handleArchive(item.existingDocumentId)}
                    title="Archiver et remplacer"
                    aria-label={`Archiver ${item.documentTypeName}`}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Footer */}
      {!loading && !error && items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:divide-neutral-800 flex items-center justify-between text-2xs text-neutral-500">
          <span>
            {requiredCount} obligatoire{requiredCount > 1 ? 's' : ''}
          </span>
          <div className="w-32 bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${items.length > 0 ? (approvedCount / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

DocumentComplianceChecklist.propTypes = {
  userId: PropTypes.number,
  studentId: PropTypes.number,
}
