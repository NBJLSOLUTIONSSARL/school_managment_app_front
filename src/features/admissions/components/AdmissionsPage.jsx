import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { StatCard } from '@/components/ui/StatCard'
import { TableToolbar } from '@/components/ui/TableToolbar'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { admissionsService } from '../api/admissionsService'
import { ApplicationDetailModal } from './ApplicationDetailModal'
import { RecordDecisionModal } from './RecordDecisionModal'

export function AdmissionsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('table')
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

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const nameMatch = app.candidateName?.toLowerCase().includes(q)
    const guardianMatch =
      app.guardian?.firstName?.toLowerCase().includes(q) ||
      app.guardian?.lastName?.toLowerCase().includes(q)
    return nameMatch || guardianMatch
  })

  const _underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length

  const columns = [
    {
      key: 'candidateName',
      label: 'Candidat / Dossier',
      sortable: true,
      render: (_, app) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#111827] shrink-0">
            {app.candidateName ? app.candidateName.slice(0, 2).toUpperCase() : 'CD'}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-[#111827] text-xs hover:underline block truncate">
              {app.candidateName}
            </span>
            <span className="text-[11px] text-[#6B7280]">Dossier #{app.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Date de Naissance',
      render: (_, app) => (
        <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
          <span className="text-xs text-[#4B5563]">
            {app.candidateBirthDate ? new Date(app.candidateBirthDate).toLocaleDateString() : 'N/A'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] shrink-0" />
        </div>
      ),
    },
    {
      key: 'guardian',
      label: 'Tuteur / Contact',
      render: (_, app) => {
        if (!app.guardian) return <span className="text-xs text-[#9CA3AF] italic">Non renseigné</span>
        const gName = `${app.guardian.firstName || ''} ${app.guardian.lastName || ''}`.trim()
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E7EB] text-[#374151] flex items-center justify-center font-bold text-[10px] shrink-0">
              {gName ? gName.slice(0, 2).toUpperCase() : 'TU'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#111827] truncate">{gName}</div>
              <div className="text-[10px] text-[#6B7280] truncate">{app.guardian.phone || app.guardian.email || '-'}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'submittedAt',
      label: 'Date Dépôt',
      render: (val) => (
        <span className="text-xs text-[#4B5563]">
          {val ? new Date(val).toLocaleDateString() : 'N/A'}
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
        return <StatusBadge status={cfg.badge} label={cfg.label} showPlus />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, app) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleOpenDetail(app)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Détails
          </Button>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => handleOpenDecision(app)}
          >
            Décision
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] min-h-screen">
      <DocTypePageHead
        icon={ClipboardCheck}
        title="Gestion des Admissions"
        count={totalElements}
        countLabel="candidatures"
        primaryAction={{
          label: 'Enrich data',
          onClick: () => fetchApplications(),
        }}
      />

      {error && <Alert variant="error" message={error} />}

      {/* 4 KPI Cards matching the image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardCheck}
          title="Active Opportunities"
          value={`${totalElements} active`}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={CheckCircle2}
          title="Deals Closed This Month"
          value={`${acceptedCount} completed`}
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
          value={`${totalElements ? Math.round((acceptedCount / totalElements) * 100) : 62}%`}
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par candidat ou tuteur..."
        primaryActionLabel="New application"
        onPrimaryAction={() => {}}
        filters={[
          {
            label: 'Person to contact',
            onClick: () => {},
          },
          {
            label: statusFilter === 'ALL' ? 'Status' : statusFilter,
            onClick: () => {
              const options = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'WAITLISTED', 'REJECTED']
              const idx = options.indexOf(statusFilter)
              setStatusFilter(options[(idx + 1) % options.length])
            },
          },
        ]}
      />

      <PaginatedTable
        columns={columns}
        data={filteredApplications}
        totalItems={totalElements}
        pageSize={15}
        page={page + 1}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p - 1)}
        isLoading={loading}
        enableSelection
        onRowClick={(app) => handleOpenDetail(app)}
      />

      {/* Modals */}
      {detailModalOpen && (
        <ApplicationDetailModal
          isOpen={detailModalOpen}
          application={selectedApplication}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedApplication(null)
          }}
          onRecordDecision={() => {
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
          onClose={() => {
            setDecisionModalOpen(false)
            setSelectedApplication(null)
          }}
          onSaved={handleDecisionSaved}
        />
      )}
    </div>
  )
}

export default AdmissionsPage
