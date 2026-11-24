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
import { teacherService } from '../api/teacherService'
import { departmentService } from '@/features/departments/api/departmentService'
import { TeacherFormModal } from './TeacherFormModal'
import { TeacherDetailsModal } from './TeacherDetailsModal'

export function TeacherList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'ROLE_ADMIN'])
  const canEdit = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  const [teachers, setTeachers] = useState([])
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
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [detailTeacher, setDetailTeacher] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch departments for filter dropdown
  useEffect(() => {
    async function loadDepts() {
      const res = await departmentService.getDepartments()
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data)
      }
    }
    loadDepts()
  }, [])

  // Fetch teachers
  const loadTeachers = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const deptId = selectedDepartment !== 'ALL' ? Number(selectedDepartment) : undefined
        const res = await teacherService.getTeachers({ departmentId: deptId })
        if (signal?.aborted) return
        if (res.success && Array.isArray(res.data)) {
          setTeachers(res.data)
        } else {
          const msg = res.error?.message || 'Erreur lors du chargement des enseignants.'
          setLoadError(msg)
          toastError(msg)
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les enseignants.'
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
    const pending = Promise.resolve().then(() => loadTeachers({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadTeachers])

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Email ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered teachers list (Search + Status)
  const filteredTeachers = useMemo(() => {
    let list = teachers

    if (statusFilter !== 'ALL') {
      const wantActive = statusFilter === 'ACTIVE'
      list = list.filter((t) => Boolean(t.user?.active) === wantActive)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter((t) => {
        const u = t.user || {}
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
        const email = (u.email || '').toLowerCase()
        const spec = (t.specialization || '').toLowerCase()
        const deptName = (t.department?.name || '').toLowerCase()
        return (
          fullName.includes(term) ||
          email.includes(term) ||
          spec.includes(term) ||
          deptName.includes(term)
        )
      })
    }

    return list
  }, [teachers, searchTerm, statusFilter])

  // Paged items
  const paginatedTeachers = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredTeachers.slice(start, start + pageSize)
  }, [filteredTeachers, page, pageSize])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await teacherService.deleteTeacher(deleteTarget.id)
      if (res.success) {
        const name = deleteTarget.user
          ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
          : 'L’enseignant'
        success(`${name} a été supprimé avec succès.`)
        setDeleteTarget(null)
        loadTeachers()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression de l’enseignant.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Professeur / Identité',
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'P')[0]}${(u.lastName || 'R')[0]}`.toUpperCase()
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
      key: 'specialization',
      label: 'Spécialisation / Discipline',
      render: (val) => (
        <span className="text-xs text-[#475569] truncate block max-w-xs">{val || 'Non renseignée'}</span>
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
          <span className="truncate">{dept?.name || 'Département Général'}</span>
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
              onClick: () => setDetailTeacher(row),
            },
            {
              label: 'Modifier',
              icon: Pencil,
              hidden: !canEdit,
              onClick: () => {
                setEditingTeacher(row)
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
                setEditingTeacher(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        addNewLabel="Nouveau professeur"
        canAddNew={canCreate}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par nom, matière, email..."
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
        data={paginatedTeachers}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadTeachers}
        emptyTitle="Aucun professeur trouvé"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucun enseignant ne correspond à vos filtres.'
            : 'Commencez par ajouter un premier professeur.'
        }
        emptyAction={
          canCreate
            ? {
                label: 'Nouveau professeur',
                onClick: () => {
                  setEditingTeacher(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
        page={page}
        pageSize={pageSize}
        totalItems={filteredTeachers.length}
        totalPages={Math.max(1, Math.ceil(filteredTeachers.length / pageSize))}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setDetailTeacher(row)}
      />

      {isFormOpen && (
        <TeacherFormModal
          isOpen={isFormOpen}
          teacher={editingTeacher}
          departments={departments}
          onClose={() => {
            setIsFormOpen(false)
            setEditingTeacher(null)
          }}
          onSuccess={() => {
            setIsFormOpen(false)
            setEditingTeacher(null)
            loadTeachers()
          }}
        />
      )}

      {detailTeacher && (
        <TeacherDetailsModal
          isOpen={Boolean(detailTeacher)}
          teacher={detailTeacher}
          onClose={() => setDetailTeacher(null)}
          onEdit={() => {
            setEditingTeacher(detailTeacher)
            setDetailTeacher(null)
            setIsFormOpen(true)
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer l'enseignant"
          message={`Êtes-vous sûr de vouloir supprimer ${
            deleteTarget.user
              ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
              : 'cet enseignant'
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

export default TeacherList
