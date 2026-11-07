import { useState, useEffect, useCallback, useMemo } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loader } from '@/components/ui/Loader'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { departmentService } from '../api/departmentService'
import { DepartmentFormModal } from './DepartmentFormModal'

export function DepartmentList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const canEdit = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDepartments = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      try {
        const res = await departmentService.getDepartments()
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setDepartments(res.data)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement des départements.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadDepartments({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadDepartments])

  // Filtered list
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments
    const term = searchTerm.toLowerCase()
    return departments.filter((d) => d.name?.toLowerCase().includes(term))
  }, [departments, searchTerm])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await departmentService.deleteDepartment(deleteTarget.id)
      if (res.success) {
        success(`Département "${deleteTarget.name}" supprimé avec succès.`)
        setDeleteTarget(null)
        loadDepartments()
      } else {
        toastError(
          res.error?.message ||
            'Impossible de supprimer ce département car des enseignants ou du personnel y sont rattachés.'
        )
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: '#',
      width: '60px',
      render: (val) => <span className="font-mono text-2xs text-slate-500">#{val}</span>,
    },
    {
      key: 'name',
      label: 'Département',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-900">{val}</span>,
    },
    {
      key: 'teachersCount',
      label: 'Enseignants',
      width: '130px',
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-700">
          {val} {val > 1 ? 'profs' : 'prof'}
        </span>
      ),
    },
    {
      key: 'staffCount',
      label: 'Personnel admin',
      width: '140px',
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-700">
          {val} {val > 1 ? 'membres' : 'membre'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {canEdit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setEditingDepartment(row)
                setIsModalOpen(true)
              }}
            >
              Modifier
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="xs"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteTarget(row)}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none">
      <DocTypePageHead
        title="Départements"
        count={filteredDepartments.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filtrer par nom de département..."
        primaryAction={
          canCreate
            ? {
                label: 'Nouveau Département',
                onClick: () => {
                  setEditingDepartment(null)
                  setIsModalOpen(true)
                }}
            : undefined
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          title="Aucun département"
          description={
            searchTerm
              ? `Aucun département ne correspond à "${searchTerm}".`
              : 'Commencez par créer votre premier département.'
          }
          action={
            canCreate
              ? {
                  label: 'Créer un département',
                  onClick: () => {
                    setEditingDepartment(null)
                    setIsModalOpen(true)
                  },
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredDepartments}
          page={1}
          pageSize={filteredDepartments.length || 10}
          totalItems={filteredDepartments.length}
          totalPages={1}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          isLoading={false}
        />
      )}

      {isModalOpen && (
        <DepartmentFormModal
          key={editingDepartment?.id || 'new'}
          isOpen={isModalOpen}
          department={editingDepartment}
          onClose={() => {
            setIsModalOpen(false)
            setEditingDepartment(null)
          }}
          onSuccess={() => loadDepartments()}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer le département ?"
          message={`Êtes-vous sûr de vouloir supprimer le département "${deleteTarget.name}" ? Cette action est irréversible.`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default DepartmentList
