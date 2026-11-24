import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Copy,
  MapPin,
  Check,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { staffService } from '../api/staffService'
import { departmentService } from '@/features/departments/api/departmentService'
import { StaffFormModal } from './StaffFormModal'
import { StaffDetailsModal } from './StaffDetailsModal'

export function StaffList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'ROLE_ADMIN'])
  const canEdit = hasRole(['admin', 'ROLE_ADMIN', 'staff', 'ROLE_STAFF'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  const [staffList, setStaffList] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [detailStaff, setDetailStaff] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch departments
  useEffect(() => {
    async function loadDepts() {
      const res = await departmentService.getDepartments()
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data)
      }
    }
    loadDepts()
  }, [])

  // Fetch staff
  const loadStaff = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const deptId = selectedDepartment !== 'ALL' ? Number(selectedDepartment) : undefined
        const res = await staffService.getStaff({ departmentId: deptId })
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setStaffList(res.data)
        } else {
          const msg = res.error?.message || 'Erreur lors du chargement du personnel.'
          setLoadError(msg)
          toastError(msg)
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger le personnel.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [selectedDepartment, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadStaff({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadStaff])

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Email ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Local filter
  const filteredStaff = useMemo(() => {
    let list = staffList

    if (statusFilter !== 'ALL') {
      const wantActive = statusFilter === 'ACTIVE'
      list = list.filter((s) => Boolean(s.user?.active) === wantActive)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter((s) => {
        const u = s.user || {}
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
        const email = (u.email || '').toLowerCase()
        const pos = (s.position || '').toLowerCase()
        const deptName = (s.department?.name || '').toLowerCase()
        return (
          fullName.includes(term) ||
          email.includes(term) ||
          pos.includes(term) ||
          deptName.includes(term)
        )
      })
    }

    return list
  }, [staffList, searchTerm, statusFilter])

  const paginatedStaff = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredStaff.slice(start, start + pageSize)
  }, [filteredStaff, page, pageSize])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await staffService.deleteStaff(deleteTarget.id)
      if (res.success) {
        const name = deleteTarget.user
          ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
          : 'Le membre'
        success(`${name} a été supprimé avec succès.`)
        setDeleteTarget(null)
        loadStaff()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression du membre.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Personnel / Membre',
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'E')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[#0F172A] text-xs truncate">{name}</div>
              <div className="text-[11px] text-[#64748B] truncate">{u.email || '-'}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'position',
      label: 'Fonction / Poste',
      render: (val) => (
        <span className="text-xs text-[#475569] truncate block max-w-xs">{val || 'Administration Générale'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Coordonnées',
      width: '180px',
      render: (_, row) => {
        const email = row.user?.email || '-'
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#334155]">
            <span className="truncate">{email}</span>
            {email !== '-' && (
              <button
                type="button"
                onClick={(e) => handleCopy(email, row.id, e)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded transition-colors cursor-pointer"
                title="Copier l'email"
              >
                {copiedId === row.id ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        )
      },
    },
    {
      key: 'department',
      label: 'Département',
      width: '160px',
      render: (dept) => (
        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
          <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          <span className="truncate">{dept?.name || 'Direction'}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '130px',
      render: (_, row) => <span className="text-xs text-[#475569]">{row.user?.phone || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (_, row) => (
        <StatusBadge
          status={row.user?.active ? 'Complete' : 'To Contact'}
          label={row.user?.active ? 'Actif' : 'Inactif'}
        />
      ),
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
              label: 'Détails',
              icon: Eye,
              onClick: () => setDetailStaff(row),
            },
            {
              label: 'Modifier',
              icon: Pencil,
              hidden: !canEdit,
              onClick: () => {
                setEditingStaff(row)
                setIsFormOpen(true)
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

  const hasActiveFilters = selectedDepartment !== 'ALL' || statusFilter !== 'ALL'
  const activeFiltersCount = (selectedDepartment !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Département
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          <option value="ALL">Tous les départements</option>
          {departments.map((dept) => (
            <option key={dept.id} value={String(dept.id)}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Statut
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs uniquement</option>
          <option value="INACTIVE">Inactifs uniquement</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={
          canCreate
            ? () => {
                setEditingStaff(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        addNewLabel="Nouveau membre"
        canAddNew={canCreate}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par nom, poste, email..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setSelectedDepartment('ALL')
          setStatusFilter('ALL')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={paginatedStaff}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadStaff}
        emptyTitle="Aucun membre du personnel trouvé"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucun membre ne correspond à vos filtres.'
            : 'Commencez par ajouter un premier membre du personnel.'
        }
        emptyAction={
          canCreate
            ? {
                label: 'Nouveau membre',
                onClick: () => {
                  setEditingStaff(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
        page={page}
        pageSize={pageSize}
        totalItems={filteredStaff.length}
        totalPages={Math.max(1, Math.ceil(filteredStaff.length / pageSize))}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setDetailStaff(row)}
      />

      {isFormOpen && (
        <StaffFormModal
          isOpen={isFormOpen}
          staff={editingStaff}
          departments={departments}
          onClose={() => {
            setIsFormOpen(false)
            setEditingStaff(null)
          }}
          onSuccess={() => {
            setIsFormOpen(false)
            setEditingStaff(null)
            loadStaff()
          }}
        />
      )}

      {detailStaff && (
        <StaffDetailsModal
          isOpen={Boolean(detailStaff)}
          staff={detailStaff}
          onClose={() => setDetailStaff(null)}
          onEdit={() => {
            setEditingStaff(detailStaff)
            setDetailStaff(null)
            setIsFormOpen(true)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer le membre"
          message={`Êtes-vous sûr de vouloir supprimer ${
            deleteTarget.user
              ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
              : 'ce membre'
          } ? Cette action est irréversible.`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer'}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default StaffList
