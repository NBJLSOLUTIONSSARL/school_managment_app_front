import { useState, useEffect, useCallback } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Loader } from '@/components/ui/Loader'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { studentService } from '../api/studentService'
import { StudentFormModal } from './StudentFormModal'
import { StudentDetailsModal } from './StudentDetailsModal'
import { StudentGuardianModal } from './StudentGuardianModal'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'ACTIVE', label: 'Actifs' },
  { value: 'INACTIVE', label: 'Inactifs' },
]

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

  // Filter state
  const [nameSearch, setNameSearch] = useState('')
  const [studentNumberSearch, setStudentNumberSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortParam, setSortParam] = useState('id,desc')

  const debouncedName = useDebounce(nameSearch, 300)
  const debouncedStudentNumber = useDebounce(studentNumberSearch, 300)

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
      try {
        const res = await studentService.getStudents({
          page,
          size: pageSize,
          name: debouncedName,
          studentNumber: debouncedStudentNumber,
          status: statusFilter,
          sort: sortParam,
        })

        if (signal?.aborted) return

        if (res.success && res.data) {
          setStudents(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          toastError(res.error?.message || 'Erreur lors du chargement des élèves.')
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [page, pageSize, debouncedName, debouncedStudentNumber, statusFilter, sortParam, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => loadStudents({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [loadStudents])

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
      key: 'studentNumber',
      label: 'Matricule',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-2xs font-semibold text-slate-800">{val || '-'}</span>
      ),
    },
    {
      key: 'fullName',
      label: 'Nom & Prénom',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'E')[0]}${(u.lastName || 'L')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] font-bold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-[#0F172A]">{name}</div>
              <div className="text-[11px] text-[#64748B]">{u.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone',
      label: 'Téléphone',
      width: '130px',
      render: (_, row) => <span className="text-xs text-slate-600">{row.user?.phone || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      width: '100px',
      render: (val, row) => (
        <StatusBadge status={val || (row.user?.active ? 'ACTIVE' : 'INACTIVE')} showDot />
      ),
    },
    {
      key: 'guardians',
      label: 'Tuteurs',
      width: '110px',
      align: 'center',
      render: (guardians) => {
        const count = Array.isArray(guardians) ? guardians.length : 0
        return (
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700">
            {count} {count > 1 ? 'tuteurs' : 'tuteur'}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '210px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation()
              setDetailStudent(row)
            }}
          >
            Détails
          </Button>
          {canCreate && (
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setGuardianTargetStudent(row)
              }}
            >
              + Tuteur
            </Button>
          )}
          {canEdit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                setEditingStudent(row)
                setIsFormOpen(true)
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
              onClick={(e) => {
                e.stopPropagation()
                setDeleteTarget(row)
              }}
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
      {/* Top Header */}
      <DocTypePageHead
        title="Gestion des Élèves"
        count={totalItems}
        searchTerm={nameSearch}
        onSearchChange={(val) => {
          setNameSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par nom ou prénom..."
        primaryAction={
          canCreate
            ? {
                label: 'Nouvel Élève',
                onClick: () => {
                  setEditingStudent(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      {/* Filter Bar matching Figma edutrack card */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 text-xs shadow-2xs">
        <div className="w-52">
          <input
            type="text"
            value={studentNumberSearch}
            onChange={(e) => {
              setStudentNumberSearch(e.target.value)
              setPage(1)
            }}
            placeholder="N° Matricule..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/15 focus:outline-none"
          />
        </div>
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            options={STATUS_FILTERS}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-[#64748B]">Trier par :</span>
          <select
            value={sortParam}
            onChange={(e) => {
              setSortParam(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium text-[#0F172A] focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/15 focus:outline-none cursor-pointer"
          >
            <option value="id,desc">Récents d'abord</option>
            <option value="id,asc">Anciens d'abord</option>
            <option value="studentNumber,asc">Matricule (A-Z)</option>
            <option value="studentNumber,desc">Matricule (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="Aucun élève trouvé"
          description={
            nameSearch || studentNumberSearch || statusFilter !== 'ALL'
              ? 'Aucun élève ne correspond aux critères de recherche.'
              : 'Commencez par inscrire un nouvel élève.'
          }
          action={
            canCreate
              ? {
                  label: 'Créer un élève',
                  onClick: () => {
                    setEditingStudent(null)
                    setIsFormOpen(true)
                  },
                }
              : undefined
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={students}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          isLoading={false}
          onRowClick={(row) => setDetailStudent(row)}
        />
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <StudentFormModal
          key={editingStudent?.id || 'new'}
          isOpen={isFormOpen}
          student={editingStudent}
          onClose={() => {
            setIsFormOpen(false)
            setEditingStudent(null)
          }}
          onSuccess={() => loadStudents()}
        />
      )}

      {/* Details Modal */}
      {detailStudent && (
        <StudentDetailsModal
          isOpen={Boolean(detailStudent)}
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
          onOpenAssignGuardian={(stu) => {
            setDetailStudent(null)
            setGuardianTargetStudent(stu)
          }}
          onOpenEdit={(stu) => {
            setDetailStudent(null)
            setEditingStudent(stu)
            setIsFormOpen(true)
          }}
        />
      )}

      {/* Assign Guardian Modal */}
      {guardianTargetStudent && (
        <StudentGuardianModal
          isOpen={Boolean(guardianTargetStudent)}
          student={guardianTargetStudent}
          onClose={() => setGuardianTargetStudent(null)}
          onSuccess={(updatedStudent) => {
            loadStudents()
            if (detailStudent && detailStudent.id === updatedStudent.id) {
              setDetailStudent(updatedStudent)
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer cet élève ?"
          message={`Êtes-vous sûr de vouloir supprimer l'élève ${deleteTarget.user ? `${deleteTarget.user.firstName} ${deleteTarget.user.lastName}` : ''} (${deleteTarget.studentNumber || ''}) ? Cette action est irréversible.`}
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

export default StudentList
