import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Unlock,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { examService } from '@/features/exams/api/examService'
import { formatDate } from '@/utils/formatDate'
import { paginateLocal, teacherDisplayName } from '@/utils/academic'

export function ExamList() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { hasRole } = useAuth()

  const canManage = hasRole([
    'admin',
    'ROLE_ADMIN',
    'teacher',
    'ROLE_TEACHER',
    'staff',
    'ROLE_STAFF',
  ])
  const canDelete = hasRole(['admin', 'ROLE_ADMIN', 'teacher', 'ROLE_TEACHER'])

  const [exams, setExams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lockingId, setLockingId] = useState(null)

  const loadExams = useCallback(async () => {
    const result = await examService.getAllExams()
    setIsLoading(false)

    if (result.success) {
      setExams(Array.isArray(result.data) ? result.data : [])
      setLoadError(null)
    } else {
      setLoadError(result.error)
      toastError(result.error?.message || 'Impossible de charger les examens.')
    }
  }, [toastError])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async loader updates state after awaiting
    loadExams()
  }, [loadExams])

  const examTypes = useMemo(() => {
    const values = new Set(exams.map((exam) => exam.type).filter(Boolean))
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [exams])

  const filteredExams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return exams
      .filter((exam) => {
        const matchesSearch =
          !query ||
          [exam.title, exam.type, exam.teacherName, exam.id]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'locked' && exam.locked) ||
          (statusFilter === 'open' && !exam.locked)

        const matchesType = typeFilter === 'all' || exam.type === typeFilter

        return matchesSearch && matchesStatus && matchesType
      })
      .sort((a, b) => {
        const left = a[sortBy] ?? ''
        const right = b[sortBy] ?? ''
        if (left === right) return 0
        const comparison = String(left).localeCompare(String(right), 'fr', { numeric: true })
        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [exams, searchTerm, statusFilter, typeFilter, sortBy, sortDirection])

  const paginated = useMemo(
    () => paginateLocal(filteredExams, page, pageSize),
    [filteredExams, page, pageSize]
  )

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDirection('asc')
    }
  }

  const handleLockToggle = async (exam) => {
    setLockingId(exam.id)
    const result = await examService.setExamLock(exam.id, !exam.locked)
    setLockingId(null)

    if (result.success) {
      setExams((previous) =>
        previous.map((item) => (item.id === exam.id ? { ...item, ...result.data } : item))
      )
      success(result.message || `Examen ${result.data?.locked ? 'verrouillé' : 'déverrouillé'}.`)
    } else {
      toastError(result.error?.message || 'Impossible de modifier le verrouillage de l’examen.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await examService.deleteExam(deleteTarget.id)
    setIsDeleting(false)

    if (result.success) {
      setExams((previous) => previous.filter((exam) => exam.id !== deleteTarget.id))
      setDeleteTarget(null)
      success('Examen supprimé avec succès.')
    } else {
      toastError(result.error?.message || 'Impossible de supprimer cet examen.')
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Examen / Titre',
      sortable: true,
      render: (value, row) => (
        <div className="min-w-0">
          <span className="font-semibold text-[#0F172A] text-xs block truncate">{value}</span>
          <span className="text-[11px] text-[#64748B]">#{row.id}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '130px',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-[#475569]">{value || 'Examen'}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      width: '120px',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-[#475569]">{formatDate(value)}</span>
      ),
    },
    {
      key: 'teacherName',
      label: 'Enseignant',
      render: (_, row) => (
        <span className="text-xs font-medium text-[#0F172A] truncate block max-w-xs">
          {teacherDisplayName(row)}
        </span>
      ),
    },
    {
      key: 'maxScore',
      label: 'Barème',
      width: '120px',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <span className="font-mono text-2xs text-[#475569]">
          {value ?? 20} pts · coef. {row.coefficient ?? 1}
        </span>
      ),
    },
    {
      key: 'locked',
      label: 'Statut',
      width: '110px',
      render: (value) => (
        <StatusBadge status={value ? 'Locked' : 'Open'} showDot />
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
              label: 'Ouvrir',
              icon: ExternalLink,
              onClick: () => navigate(`/exams/${row.id}`),
            },
            {
              label: row.locked ? 'Déverrouiller' : 'Verrouiller',
              icon: row.locked ? Unlock : Lock,
              hidden: !canManage,
              disabled: lockingId === row.id,
              onClick: () => handleLockToggle(row),
            },
            {
              label: 'Supprimer',
              icon: Trash2,
              variant: 'danger',
              hidden: !canDelete || row.locked,
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all'
  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)

  const filtersContent = (
    <div className="space-y-3">
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
          <option value="all">Tous les statuts</option>
          <option value="open">Ouverts</option>
          <option value="locked">Verrouillés</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          Type d’examen
        </label>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
        >
          <option value="all">Tous les types</option>
          {examTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={canManage ? () => navigate('/exams/new') : undefined}
        addNewLabel="Nouvel examen"
        canAddNew={canManage}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Titre, type, enseignant..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setStatusFilter('all')
          setTypeFilter('all')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={paginated.items}
        isLoading={isLoading}
        error={loadError}
        onRetry={() => {
          setIsLoading(true)
          loadExams()
        }}
        emptyTitle="Aucun examen trouvé"
        emptyDescription={
          searchTerm || hasActiveFilters
            ? 'Aucun examen ne correspond aux filtres sélectionnés.'
            : 'Commencez par planifier un premier examen.'
        }
        emptyAction={
          canManage
            ? {
                label: 'Nouvel examen',
                onClick: () => navigate('/exams/new'),
              }
            : undefined
        }
        page={paginated.page}
        pageSize={pageSize}
        totalItems={paginated.totalItems}
        totalPages={paginated.totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/exams/${row.id}`)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Supprimer l’examen"
        description={`Supprimer définitivement « ${deleteTarget?.title || ''} » ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export const ExamListPage = ExamList
export default ExamList
