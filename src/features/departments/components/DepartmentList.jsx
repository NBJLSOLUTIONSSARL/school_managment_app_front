import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Pencil,
  Trash2,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
  const [loadError, setLoadError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDepartments = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await departmentService.getDepartments()
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setDepartments(res.data)
        } else {
          const msg = res.error?.message || 'Erreur lors du chargement des départements.'
          setLoadError(msg)
          toastError(msg)
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les départements.'
          setLoadError(msg)
          toastError(msg)
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

  const filteredDepartments = useMemo(() => {
    let list = departments
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter((d) => d.name?.toLowerCase().includes(term))
    }
    return list
  }, [departments, searchTerm])

  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredDepartments.slice(start, start + pageSize)
  }, [filteredDepartments, page, pageSize])

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
      key: 'name',
      label: 'Département / Unité',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center font-bold text-xs text-[#2563EB] shrink-0">
            {val ? val.slice(0, 2).toUpperCase() : 'DP'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-[#0F172A] text-xs truncate block">{val}</span>
            <span className="text-[11px] text-[#64748B]">Département #{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'teachersCount',
      label: 'Corps Professoral',
      width: '180px',
      render: (val) => (
        <span className="text-xs text-[#475569]">
          {val || 0} {(val || 0) > 1 ? 'professeurs' : 'professeur'}
        </span>
      ),
    },
    {
      key: 'staffCount',
      label: 'Personnel Admin',
      width: '180px',
      render: (val) => (
        <span className="text-xs text-[#475569]">
          {val || 0} {(val || 0) > 1 ? 'membres' : 'membre'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: () => <StatusBadge status="Complete" label="Actif" />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <EntityTableActions
          row={row}
          actions={[
            {
              label: 'Modifier',
              icon: Pencil,
              hidden: !canEdit,
              onClick: () => {
                setEditingDepartment(row)
                setIsModalOpen(true)
              },
            },
            {
              label: 'Supprimer',
              icon: Trash2,
              variant: 'danger',
              hidden: !canDelete,
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = statusFilter !== 'ALL'

  const filtersContent = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
        Statut du département
      </label>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value)
          setPage(1)
        }}
        className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
      >
        <option value="ALL">Tous les départements</option>
        <option value="ACTIVE">Actifs uniquement</option>
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={
          canCreate
            ? () => {
                setEditingDepartment(null)
                setIsModalOpen(true)
              }
            : undefined
        }
        addNewLabel="Nouveau département"
        canAddNew={canCreate}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Filtrer par nom de département..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
        onClearFilters={() => {
          setStatusFilter('ALL')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={paginatedDepartments}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadDepartments}
        emptyTitle="Aucun département trouvé"
        emptyDescription={
          searchTerm
            ? 'Aucun département ne correspond à votre recherche.'
            : 'Commencez par créer une unité pédagogique.'
        }
        emptyAction={
          canCreate
            ? {
                label: 'Nouveau département',
                onClick: () => {
                  setEditingDepartment(null)
                  setIsModalOpen(true)
                },
              }
            : undefined
        }
        page={page}
        pageSize={pageSize}
        totalItems={filteredDepartments.length}
        totalPages={Math.max(1, Math.ceil(filteredDepartments.length / pageSize))}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
      />

      {isModalOpen && (
        <DepartmentFormModal
          isOpen={isModalOpen}
          department={editingDepartment}
          onClose={() => {
            setIsModalOpen(false)
            setEditingDepartment(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingDepartment(null)
            loadDepartments()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer le département"
          message={`Êtes-vous sûr de vouloir supprimer le département "${deleteTarget.name}" ?`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer'}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default DepartmentList
