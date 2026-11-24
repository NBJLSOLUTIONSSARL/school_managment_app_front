import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  CheckSquare,
  UserCheck,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { admissionsService } from '../api/admissionsService'
import { ApplicationDetailModal } from './ApplicationDetailModal'
import { RecordDecisionModal } from './RecordDecisionModal'

export function AdmissionsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modals state
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)

  const fetchApplications = useCallback(async ({ signal } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await admissionsService.getApplications({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: 15,
      })
      if (signal?.aborted) return
      const content = res?.content || (Array.isArray(res) ? res : [])
      setApplications(content)
      setTotalPages(res?.totalPages || 1)
      setTotalElements(res?.totalElements || content.length)
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.response?.data?.message || err.message || 'Impossible de charger les candidatures.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [statusFilter, page])

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => fetchApplications({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [fetchApplications])

  const handleOpenDetail = (app) => {
    setSelectedApplication(app)
    setDetailModalOpen(true)
  }

  const handleOpenDecision = (app) => {
    setSelectedApplication(app)
    setDecisionModalOpen(true)
  }

  const handleDecisionSaved = async (id, decisionData) => {
    await admissionsService.recordDecision(id, decisionData)
    await fetchApplications()
  }

  const handleConvertToStudent = async (id) => {
    const student = await admissionsService.convertToStudent(id)
    await fetchApplications()
    return student
  }

  const filteredApplications = useMemo(() => {
    if (!searchQuery) return applications
    const q = searchQuery.toLowerCase()
    return applications.filter((app) => {
      const nameMatch = app.candidateName?.toLowerCase().includes(q)
      const guardianMatch =
        app.guardian?.firstName?.toLowerCase().includes(q) ||
        app.guardian?.lastName?.toLowerCase().includes(q)
      return nameMatch || guardianMatch
    })
  }, [applications, searchQuery])

  const columns = [
    {
      key: 'candidateName',
      label: 'Candidat / Identité',
      render: (_, app) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center font-bold text-xs text-[#2563EB] shrink-0">
            {app.candidateName ? app.candidateName.slice(0, 2).toUpperCase() : 'CD'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-[#0F172A] text-xs block truncate">
              {app.candidateName}
            </span>
            <span className="text-[11px] text-[#64748B]">Dossier #{app.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'candidateBirthDate',
      label: 'Date de Naissance',
      render: (val) => (
        <span className="text-xs text-[#475569]">
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'guardian',
      label: 'Tuteur / Contact',
      render: (_, app) => {
        if (!app.guardian) return <span className="text-xs text-[#94A3B8] italic">Non renseigné</span>
        const gName = `${app.guardian.firstName || ''} ${app.guardian.lastName || ''}`.trim()
        return (
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#0F172A] truncate">{gName}</div>
            <div className="text-[11px] text-[#64748B] truncate">{app.guardian.phone || app.guardian.email || '—'}</div>
          </div>
        )
      },
    },
    {
      key: 'submittedAt',
      label: 'Date Dépôt',
      render: (val) => (
        <span className="text-xs text-[#475569]">
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '130px',
      render: (val) => {
        const statusMap = {
          ACCEPTED: { badge: 'Complete', label: 'Admis' },
          UNDER_REVIEW: { badge: 'Follow-Up', label: 'En cours' },
          WAITLISTED: { badge: 'In Negotiation', label: 'Liste d’attente' },
          REJECTED: { badge: 'To Contact', label: 'Refusé' },
          SUBMITTED: { badge: 'Follow-Up', label: 'Nouveau' },
        }
        const cfg = statusMap[val] || { badge: 'To Contact', label: val || 'Soumis' }
        return <StatusBadge status={cfg.badge} label={cfg.label} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, app) => (
        <EntityTableActions
          row={app}
          actions={[
            {
              label: 'Détails',
              icon: Eye,
              onClick: () => handleOpenDetail(app),
            },
            {
              label: 'Décision',
              icon: CheckSquare,
              onClick: () => handleOpenDecision(app),
            },
            {
              label: 'Convertir en élève',
              icon: UserCheck,
              hidden: app.status !== 'ACCEPTED',
              onClick: () => handleConvertToStudent(app.id),
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
        Statut du dossier
      </label>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value)
          setPage(0)
        }}
        className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
      >
        <option value="ALL">Tous les statuts</option>
        <option value="SUBMITTED">Nouveaux dossiers</option>
        <option value="UNDER_REVIEW">En cours d'examen</option>
        <option value="ACCEPTED">Admis</option>
        <option value="WAITLISTED">Liste d'attente</option>
        <option value="REJECTED">Refusés</option>
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      {/* Screen-reader heading preserving test suite & accessibility */}
      <h1 className="sr-only">Gestion des Admissions</h1>

      <EntityListToolbar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(0)
        }}
        searchPlaceholder="Rechercher par candidat ou tuteur..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
        onClearFilters={() => {
          setStatusFilter('ALL')
          setPage(0)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredApplications}
        isLoading={loading}
        error={error}
        onRetry={fetchApplications}
        emptyTitle="Aucune candidature trouvée"
        emptyDescription={
          searchQuery || hasActiveFilters
            ? 'Aucune candidature ne correspond à vos filtres.'
            : 'Aucun dossier d’admission n’est enregistré pour le moment.'
        }
        page={page + 1}
        pageSize={15}
        totalItems={totalElements}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage - 1)}
        onRowClick={(app) => handleOpenDetail(app)}
      />

      {detailModalOpen && (
        <ApplicationDetailModal
          isOpen={detailModalOpen}
          application={selectedApplication}
          onClose={() => setDetailModalOpen(false)}
          onOpenDecision={() => {
            setDetailModalOpen(false)
            setDecisionModalOpen(true)
          }}
          onConvertToStudent={handleConvertToStudent}
        />
      )}

      {decisionModalOpen && (
        <RecordDecisionModal
          isOpen={decisionModalOpen}
          application={selectedApplication}
          onClose={() => setDecisionModalOpen(false)}
          onSaved={handleDecisionSaved}
        />
      )}
    </div>
  )
}

export default AdmissionsPage
