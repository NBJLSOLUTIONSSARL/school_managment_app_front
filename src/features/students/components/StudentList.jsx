import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  UserCheck,
  Clock,
  Award,
  ChevronRight,
  Copy,
  MapPin,
  Check,
} from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { TableToolbar } from '@/components/ui/TableToolbar'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
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
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortParam, _setSortParam] = useState('id,desc')
  const [activeView, setActiveView] = useState('table')
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
      try {
        const res = await studentService.getStudents({
          page,
          size: pageSize,
          name: debouncedName,
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
    [page, pageSize, debouncedName, statusFilter, sortParam, toastError]
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

  // Table columns styled exactly like the reference image
  const columns = [
    {
      key: 'fullName',
      label: 'Élève / Identité',
      sortable: true,
      render: (_, row) => {
        const u = row.user || {}
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom'
        const initials = `${(u.firstName || 'E')[0]}${(u.lastName || 'L')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#111827] font-semibold text-xs shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[#111827] text-xs truncate">{name}</div>
              <div className="text-[11px] text-[#6B7280] truncate">{u.email || '-'}</div>
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
        return (
          <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
            <span className="text-xs text-[#4B5563] truncate">{prog}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] shrink-0" />
          </div>
        )
      },
    },
    {
      key: 'studentNumber',
      label: 'Matricule',
      sortable: true,
      width: '140px',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#374151]">
          <span>{val || '-'}</span>
          {val && (
            <button
              type="button"
              onClick={(e) => handleCopy(val, row.id, e)}
              className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded transition cursor-pointer"
              title="Copier le matricule"
            >
              {copiedId === row.id ? (
                <Check className="w-3 h-3 text-[#059669]" />
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
          <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            <span className="truncate">{city}</span>
          </div>
        )
      },
    },
    {
      key: 'guardians',
      label: 'Personne de contact',
      width: '170px',
      render: (guardians) => {
        const guardian = Array.isArray(guardians) && guardians.length > 0 ? guardians[0] : null
        if (!guardian) {
          return <span className="text-xs text-[#9CA3AF] italic">Non assigné</span>
        }
        const name = `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'Tuteur légal'
        const initials = `${(guardian.firstName || 'T')[0]}${(guardian.lastName || 'L')[0]}`.toUpperCase()
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#374151] flex items-center justify-center font-bold text-[10px] shrink-0">
              {initials}
            </div>
            <span className="text-xs font-medium text-[#374151] truncate">{name}</span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (val, row) => {
        const isActive = val === 'ACTIVE' || row.user?.active
        return (
          <StatusBadge
            status={isActive ? 'Complete' : 'To Contact'}
            label={isActive ? 'Actif' : 'Inactif'}
            showPlus
          />
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] min-h-screen">
      {/* Top Entity Header matching the image ("Companies • 156 companies") */}
      <DocTypePageHead
        icon={GraduationCap}
        title="Students"
        count={totalItems}
        countLabel="students"
        primaryAction={
          canCreate
            ? {
                label: 'New student',
                onClick: () => {
                  setEditingStudent(null)
                  setIsFormOpen(true)
                },
              }
            : undefined
        }
      />

      {/* 4 KPI / Metric Cards Grid matching the image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          title="Active Opportunities"
          value={totalItems ? `${totalItems} active` : '78 active'}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={UserCheck}
          title="Deals Closed This Month"
          value="15 completed"
          trendValue="↘ 1.2%"
          trendType="negative"
        />
        <StatCard
          icon={Clock}
          title="Average Response Time"
          value="4.2 days"
          trendValue="↗ 0.8%"
          trendType="positive"
        />
        <StatCard
          icon={Award}
          title="Engagement Rate"
          value="62%"
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      {/* View Switcher, Toolbar and Filter Bar matching the image */}
      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={nameSearch}
        onSearchChange={(val) => {
          setNameSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Search student, name or email..."
        primaryActionLabel="New student"
        onPrimaryAction={
          canCreate
            ? () => {
                setEditingStudent(null)
                setIsFormOpen(true)
              }
            : undefined
        }
        filters={[
          {
            label: 'Person to contact',
            onClick: () => {},
          },
          {
            label: statusFilter === 'ALL' ? 'Location' : statusFilter,
            onClick: () => {
              setStatusFilter((prev) => (prev === 'ALL' ? 'ACTIVE' : prev === 'ACTIVE' ? 'INACTIVE' : 'ALL'))
              setPage(1)
            },
          },
        ]}
      />

      {/* Data Table Container */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
          <Loader size="md" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            nameSearch || statusFilter !== 'ALL'
              ? 'No students match your filter criteria.'
              : 'Get started by creating a new student.'
          }
          action={
            canCreate
              ? {
                  label: 'New student',
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
          enableSelection
          onRowClick={(row) => setDetailStudent(row)}
        />
      )}

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
