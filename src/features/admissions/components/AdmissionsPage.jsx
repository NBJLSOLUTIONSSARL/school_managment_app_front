import { useState, useEffect, useCallback } from 'react'
import { SummarySubheader } from '@/components/ui/SummarySubheader'
import { StatCard } from '@/components/ui/StatCard'
import { Alert } from '@/components/ui/Alert'
import { admissionsService } from '../api/admissionsService'
import { ApplicationDetailModal } from './ApplicationDetailModal'
import { RecordDecisionModal } from './RecordDecisionModal'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  RefreshCw,
  UserCheck,
  FileCheck,
  Users,
} from 'lucide-react'

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

  // Filter client-side search by candidate name or guardian
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const nameMatch = app.candidateName?.toLowerCase().includes(q)
    const guardianMatch =
      app.guardian?.firstName?.toLowerCase().includes(q) ||
      app.guardian?.lastName?.toLowerCase().includes(q)
    return nameMatch || guardianMatch
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <CheckCircle2 className="w-3 h-3" /> Admis
          </span>
        )
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3 h-3" /> En cours
          </span>
        )
      case 'WAITLISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
            <AlertCircle className="w-3 h-3" /> Liste d'attente
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <XCircle className="w-3 h-3" /> Refusé
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]">
            {status || 'SUBMITTED'}
          </span>
        )
    }
  }

  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length
  const waitlistedCount = applications.filter((a) => a.status === 'WAITLISTED').length

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none bg-[#F8FAFC]">
      {/* Property Wallet Subheader matching Image 1 */}
      <SummarySubheader
        title="Gestion des Admissions & Candidatures"
        subtitle="Examen des dossiers scolaires, décisions du comité pédagogique et conversion en inscriptions"
        tabs={[
          { id: 'ALL', label: `Toutes les candidatures (${totalElements})` },
          { id: 'UNDER_REVIEW', label: "En cours d'examen" },
          { id: 'ACCEPTED', label: 'Admis' },
          { id: 'WAITLISTED', label: "Liste d'attente" },
          { id: 'REJECTED', label: 'Refusés' },
        ]}
        activeTab={statusFilter}
        onTabChange={(tabId) => {
          setStatusFilter(tabId)
          setPage(0)
        }}
        actionLabel="Exporter la liste"
        onAction={() => window.print()}
      />

      {error && <Alert variant="error" message={error} />}

      {/* 4 StatCards with Live Admission Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={FileCheck}
          title="Total Candidatures"
          value={totalElements.toString()}
          subtitle="Campagne 2026 - 2027"
          trend="Inscriptions"
          trendType="neutral"
          subMetrics={[
            { label: 'Affichées', value: filteredApplications.length.toString() },
            { label: 'Total Global', value: `${totalElements} dossiers` },
          ]}
          progress={100}
          progressColor="#0F172A"
        />
        <StatCard
          icon={Clock}
          title="Dossiers en Examen"
          value={underReviewCount.toString()}
          subtitle="En cours d'instruction"
          trend="Commission"
          trendType="neutral"
          subMetrics={[
            { label: 'En attente', value: underReviewCount.toString() },
            { label: 'Liste d\'attente', value: waitlistedCount.toString() },
          ]}
          progress={totalElements ? Math.round((underReviewCount / totalElements) * 100) : 0}
          progressColor="#D97706"
        />
        <StatCard
          icon={CheckCircle2}
          title="Admissions Prononcées"
          value={acceptedCount.toString()}
          subtitle="Avis d'admission favorables"
          trend="Validés"
          trendType="up"
          subMetrics={[
            { label: 'Admis', value: acceptedCount.toString() },
            { label: 'Inscrits', value: `${acceptedCount} élèves` },
          ]}
          progress={totalElements ? Math.round((acceptedCount / totalElements) * 100) : 0}
          progressColor="#059669"
        />
        <StatCard
          icon={Users}
          title="Taux d'Admission"
          value={totalElements ? `${Math.round((acceptedCount / totalElements) * 100)}%` : '0%'}
          subtitle="Sélectivité de la promotion"
          trend="Taux"
          trendType="up"
          subMetrics={[
            { label: 'Admissibilité', value: totalElements ? `${Math.round((acceptedCount / totalElements) * 100)}%` : '0%' },
            { label: 'Statut', value: 'Conforme' },
          ]}
          progress={totalElements ? Math.round((acceptedCount / totalElements) * 100) : 0}
          progressColor="#0F172A"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Rechercher par candidat ou tuteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/15 focus:border-[#0F172A] text-[#0F172A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchApplications}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#94A3B8]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
              className="text-xs px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/15 focus:border-[#0F172A] text-[#0F172A] cursor-pointer"
            >
              <option value="ALL">Tous les statuts ({totalElements})</option>
              <option value="SUBMITTED">Nouveaux (SUBMITTED)</option>
              <option value="UNDER_REVIEW">En cours d'examen</option>
              <option value="ACCEPTED">Admis / Acceptés</option>
              <option value="WAITLISTED">Liste d'attente</option>
              <option value="REJECTED">Refusés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#94A3B8]">
            <div className="inline-block w-6 h-6 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Chargement des dossiers d'admission...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#94A3B8]">
            <UserCheck className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-40" />
            <p className="font-bold text-[#0F172A] text-sm">Aucun dossier trouvé</p>
            <p className="mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Aucune candidature ne correspond à vos filtres de recherche.'
                : 'Aucune candidature n\'a encore été enregistrée dans le système.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4"># ID</th>
                  <th className="py-3 px-4">Candidat</th>
                  <th className="py-3 px-4">Date de Naissance</th>
                  <th className="py-3 px-4">Tuteur / Contact</th>
                  <th className="py-3 px-4">Date Dépôt</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(app)}
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-[#94A3B8]">#{app.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F172A] hover:underline">
                        {app.candidateName}
                      </span>
                      {app.student && (
                        <span className="block text-[11px] text-[#059669] font-medium">
                          Inscrit (Matricule: {app.student.studentNumber || app.student.id})
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-text-muted">
                      {app.candidateBirthDate
                        ? new Date(app.candidateBirthDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-3">
                      {app.guardian ? (
                        <div>
                          <span className="text-text-default">
                            {app.guardian.firstName} {app.guardian.lastName}
                          </span>
                          <span className="block text-2xs text-text-muted">
                            {app.guardian.phone || app.guardian.email || 'Sans contact'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">Non renseigné</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-text-muted">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-3">{getStatusBadge(app.status)}</td>
                    <td
                      className="py-2 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(app)}
                          title="Voir le dossier complet"
                          className="p-1 rounded text-text-muted hover:text-text-default hover:bg-fill-neutral-subtle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDecision(app)}
                          title="Statut / Décision"
                          className="px-2 py-0.5 text-2xs font-semibold text-primary-default bg-primary-subtle rounded hover:bg-primary-hover hover:text-text-on-primary transition-colors"
                        >
                          Décision
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border-default flex items-center justify-between text-2xs text-text-muted">
            <span>
              Page {page + 1} sur {totalPages} ({totalElements} candidatures)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 rounded border border-border-default disabled:opacity-40 hover:bg-fill-neutral-hover"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 rounded border border-border-default disabled:opacity-40 hover:bg-fill-neutral-hover"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ApplicationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        application={selectedApplication}
        onOpenDecision={handleOpenDecision}
        onConvertToStudent={handleConvertToStudent}
      />

      <RecordDecisionModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        application={selectedApplication}
        onDecisionSaved={handleDecisionSaved}
      />
    </div>
  )
}
