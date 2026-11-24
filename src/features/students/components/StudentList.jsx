import { useState, useEffect, useCallback } from 'react'
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
import { useDebounce } from '@/hooks/useDebounce'
import { studentService } from '../api/studentService'
import { StudentFormModal } from './StudentFormModal'
import { StudentDetailsModal } from './StudentDetailsModal'
import { StudentGuardianModal } from './StudentGuardianModal'

export function StudentList() {
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canCreate = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const canEdit = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN'])

  // Data & Pagination state
  const [students, setStudents] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Filter state
  const [nameSearch, setNameSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [copiedId, setCopiedId] = useState(null)

  const debouncedName = useDebounce(nameSearch, 300)

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [detailStudent, setDetailStudent] = useState(null)
  const [guardianTargetStudent, setGuardianTargetStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load students from real backend
  const loadStudents = useCallback(
    async ({ signal } = {}) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await studentService.getStudents({
          page,
          size: pageSize,
          name: debouncedName,
          status: statusFilter,
          sort: 'id,desc',
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setStudents(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          const msg = res.error?.message || 'Erreur lors du chargement des élèves.'
          setLoadError(msg)
          toastError(msg)
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Impossible de charger les élèves.'
          setLoadError(msg)
          toastError(msg)
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [page, pageSize, debouncedName, statusFilter, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadStudents({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadStudents])

  // Copy to clipboard helper
  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    success(`Matricule ${text} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Delete action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await studentService.deleteStudent(deleteTarget.id)
      if (res.success) {
        const name = deleteTarget.user
          ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
          : 'L’élève'
        success(`${name} a été supprimé avec succès.`)
        setDeleteTarget(null)
        loadStudents()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression de l’élève.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Élève / Identité',
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'E')[0]}${(u.lastName || 'L')[0]}`.toUpperCase()
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
      key: 'description',
      label: 'Filière / Programme',
      render: (_, row) => {
        const prog = row.gradeLevel || row.className || 'Cycle Secondaire Général'
        return <span className="text-xs text-[#475569] truncate block max-w-xs">{prog}</span>
      },
    },
    {
      key: 'studentNumber',
      label: 'Matricule',
      width: '140px',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#334155]">
          <span>{val || '-'}</span>
          {val && (
            <button
              type="button"
              onClick={(e) => handleCopy(val, row.id, e)}
              className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded transition-colors cursor-pointer"
              title="Copier le matricule"
            >
              {copiedId === row.id ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Campus / Ville',
      width: '150px',
      render: (_, row) => {
        const city = row.city || row.user?.address || 'Campus Principal'
        return (
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span className="truncate">{city}</span>
          </div>
        )
      },
    },
    {
      key: 'guardians',
      label: 'Tuteur / Contact',
      width: '160px',
      render: (guardians) => {
        const guardian = Array.isArray(guardians) && guardians.length > 0 ? guardians[0] : null
        if (!guardian) {
          return <span className="text-xs text-[#94A3B8] italic">Non assigné</span>
        }
        const name = `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'Tuteur légal'
        return <span className="text-xs font-medium text-[#334155] truncate block">{name}</span>
      },
    },
    {
      key: 'status',
      label: 'Statut',
      width: '110px',
      render: (val, row) => {
        const isActive = val === 'ACTIVE' || row.user?.active
        return (
          <StatusBadge
            status={isActive ? 'Complete' : 'To Contact'}
            label={isActive ? 'Actif' : 'Inactif'}
          />
        )
      },
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
              onClick: () => setDetailStudent(row),
            },
            {
              label: 'Modifier',
              icon: Pencil,
              hidden: !canEdit,
              onClick: () => {
                setEditingStudent(row)
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

  const hasActiveFilters = statusFilter !== 'ALL'

  const filtersContent = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
        Statut d’inscription
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
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      {/* Standalone Toolbar */}
      <EntityListToolbar
        onAddNew={
          canCreate
            ? () => {
                setEditingStudent(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        addNewLabel="Nouvel élève"
        canAddNew={canCreate}
        searchValue={nameSearch}
        onSearchChange={(val) => {
          setNameSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par nom, matricule, email..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
        onClearFilters={() => {
          setStatusFilter('ALL')
          setPage(1)
        }}
      />

      {/* Dominant Table */}
      <EntityDataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadStudents}
        emptyTitle="Aucun élève trouvé"
        emptyDescription={
          nameSearch || hasActiveFilters
            ? 'Aucun élève ne correspond à vos critères de recherche.'
            : 'Commencez par inscrire un premier élève.'
        }
        emptyAction={
          canCreate
            ? {
                label: 'Nouvel élève',
                onClick: () => {
                  setEditingStudent(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setDetailStudent(row)}
      />

      {/* Modals */}
      {isFormOpen && (
        <StudentFormModal
          isOpen={isFormOpen}
          student={editingStudent}
          onClose={() => {
            setIsFormOpen(false)
            setEditingStudent(null)
          }}
          onSuccess={() => {
            setIsFormOpen(false)
            setEditingStudent(null)
            loadStudents()
          }}
        />
      )}

      {detailStudent && (
        <StudentDetailsModal
          isOpen={Boolean(detailStudent)}
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
          onEdit={() => {
            setEditingStudent(detailStudent)
            setDetailStudent(null)
            setIsFormOpen(true)
          }}
          onAddGuardian={() => {
            setGuardianTargetStudent(detailStudent)
            setDetailStudent(null)
          }}
        />
      )}

      {guardianTargetStudent && (
        <StudentGuardianModal
          isOpen={Boolean(guardianTargetStudent)}
          student={guardianTargetStudent}
          onClose={() => setGuardianTargetStudent(null)}
          onSuccess={() => {
            setGuardianTargetStudent(null)
            loadStudents()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer l'élève"
          message={`Êtes-vous sûr de vouloir supprimer ${
            deleteTarget.user
              ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}`
              : 'cet élève'
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

export default StudentList
