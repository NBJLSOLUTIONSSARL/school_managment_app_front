import { useState, useEffect, useCallback } from 'react'
import { SummarySubheader } from '@/components/ui/SummarySubheader'
import { StatCard } from '@/components/ui/StatCard'
import { Alert } from '@/components/ui/Alert'
import { invoiceService } from '../api/invoiceService'
import { InvoiceDetailModal } from './InvoiceDetailModal'
import { CreateInvoiceModal } from './CreateInvoiceModal'
import { RecordPaymentModal } from './RecordPaymentModal'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  CreditCard,
  Plus,
  RefreshCw,
  Receipt,
} from 'lucide-react'

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const fetchInvoices = useCallback(async ({ signal } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await invoiceService.getInvoices({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: 15,
      })
      if (signal?.aborted) return
      const content = res?.content || (Array.isArray(res) ? res : [])
      setInvoices(content)
      setTotalPages(res?.totalPages || 1)
      setTotalElements(res?.totalElements || content.length)
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.response?.data?.message || err.message || 'Impossible de charger les factures.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [statusFilter, page])

  useEffect(() => {
    const controller = new AbortController()
    const pending = Promise.resolve().then(() => fetchInvoices({ signal: controller.signal }))
    return () => {
      controller.abort()
      pending.catch(() => {})
    }
  }, [fetchInvoices])

  const handleOpenDetail = (inv) => {
    setSelectedInvoice(inv)
    setDetailModalOpen(true)
  }

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv)
    setPaymentModalOpen(true)
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      inv.number?.toLowerCase().includes(q) ||
      inv.studentName?.toLowerCase().includes(q)
    )
  })

  // KPI calculations on loaded invoices
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0)
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0)
  const totalDue = Math.max(0, totalBilled - totalPaid)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <CheckCircle2 className="w-3 h-3" /> Réglée
          </span>
        )
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3 h-3" /> Partiel
          </span>
        )
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <AlertTriangle className="w-3 h-3" /> En retard
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]">
            Non payée
          </span>
        )
    }
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 select-none bg-[#F8FAFC]">
      {/* Property Wallet Subheader matching Image 1 */}
      <SummarySubheader
        title="Gestion Financière — Facturation & Règlements"
        subtitle="Suivi des bordereaux, paiements échelonnés et états de recouvrement des familles"
        tabs={[
          { id: 'ALL', label: `Toutes les factures (${totalElements})` },
          { id: 'UNPAID', label: 'Non payées' },
          { id: 'PARTIAL', label: 'Partielles' },
          { id: 'PAID', label: 'Payées' },
          { id: 'OVERDUE', label: 'En retard' },
        ]}
        activeTab={statusFilter}
        onTabChange={(tabId) => {
          setStatusFilter(tabId)
          setPage(0)
        }}
        actionLabel="Nouvelle Facture"
        onAction={() => setCreateModalOpen(true)}
      />

      {error && <Alert variant="error" message={error} />}

      {/* 4 StatCards with Live Financial Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Receipt}
          title="Total Facturé (Page)"
          value={`${Number(totalBilled).toLocaleString()} €`}
          subtitle="Montant cumulé émis"
          trend="Émis"
          trendType="neutral"
          subMetrics={[
            { label: 'Factures affichées', value: filteredInvoices.length.toString() },
            { label: 'Total Global', value: `${totalElements} dossiers` },
          ]}
          progress={100}
          progressColor="#0F172A"
        />
        <StatCard
          icon={CheckCircle2}
          title="Règlements Encaissés"
          value={`${Number(totalPaid).toLocaleString()} €`}
          subtitle="Paiements confirmés"
          trend="Encaissé"
          trendType="up"
          subMetrics={[
            { label: 'Soldées', value: invoices.filter((i) => i.status === 'PAID').length.toString() },
            { label: 'Acomptes', value: invoices.filter((i) => i.status === 'PARTIAL').length.toString() },
          ]}
          progress={totalBilled ? Math.round((totalPaid / totalBilled) * 100) : 0}
          progressColor="#059669"
        />
        <StatCard
          icon={AlertTriangle}
          title="Reste à Recouvrer"
          value={`${Number(totalDue).toLocaleString()} €`}
          subtitle="Solde exigible"
          trend="À percevoir"
          trendType="neutral"
          subMetrics={[
            { label: 'En retard', value: invoices.filter((i) => i.status === 'OVERDUE').length.toString() },
            { label: 'Partielles', value: invoices.filter((i) => i.status === 'PARTIAL').length.toString() },
          ]}
          progress={totalBilled ? Math.round((totalDue / totalBilled) * 100) : 0}
          progressColor="#0F172A"
        />
        <StatCard
          icon={CreditCard}
          title="Taux de Recouvrement"
          value={totalBilled ? `${Math.round((totalPaid / totalBilled) * 100)}%` : '0%'}
          subtitle="Performance financière"
          trend="Ratio"
          trendType="up"
          subMetrics={[
            { label: 'Objectif', value: '95%' },
            { label: 'Statut', value: totalDue === 0 ? 'Optimal' : 'En cours' },
          ]}
          progress={totalBilled ? Math.round((totalPaid / totalBilled) * 100) : 0}
          progressColor="#0F172A"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Rechercher par numéro de facture ou élève..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/15 focus:border-[#0F172A] text-[#0F172A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchInvoices}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#020617] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle Facture
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
              <option value="ALL">Toutes les factures ({totalElements})</option>
              <option value="UNPAID">Non payées (UNPAID)</option>
              <option value="PARTIAL">Partielles (PARTIAL)</option>
              <option value="PAID">Payées (PAID)</option>
              <option value="OVERDUE">En retard (OVERDUE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            <div className="inline-block w-6 h-6 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mb-2" />
            <p>Chargement des factures...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            <Receipt className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-[#0F172A]">Aucune facture trouvée</p>
            <p className="mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Aucune facture ne correspond à vos filtres de recherche.'
                : 'Aucune facture n\'a encore été émise.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-2xs font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-2.5 px-3">Numéro</th>
                  <th className="py-2.5 px-3">Élève</th>
                  <th className="py-2.5 px-3">Date d'Échéance</th>
                  <th className="py-2.5 px-3 text-right">Montant Total</th>
                  <th className="py-2.5 px-3 text-right">Reste Dû</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredInvoices.map((inv) => {
                  const remaining = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0))
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(inv)}
                    >
                      <td className="py-2 px-3 font-mono font-semibold text-[#0F172A]">
                        {inv.number || `#${inv.id}`}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#0F172A]">
                        {inv.studentName || `Élève #${inv.studentId}`}
                      </td>
                      <td className="py-2 px-3 text-[#64748B]">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-[#0F172A]">
                        {Number(inv.totalAmount || 0).toLocaleString()} €
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span className={remaining > 0 ? 'text-danger-emphasis' : 'text-success-emphasis'}>
                          {Number(remaining).toLocaleString()} €
                        </span>
                      </td>
                      <td className="py-2 px-3">{getStatusBadge(inv.status)}</td>
                      <td
                        className="py-2 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(inv)}
                            title="Voir le détail"
                            className="p-1 rounded text-text-muted hover:text-text-default hover:bg-fill-neutral-subtle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {remaining > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenPayment(inv)}
                              title="Encaisser"
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-semibold text-success-emphasis bg-success-subtle rounded hover:bg-success-hover hover:text-text-on-primary transition-colors border border-success-subtle"
                            >
                              <CreditCard className="w-2.5 h-2.5" />
                              Encaisser
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border-default flex items-center justify-between text-2xs text-text-muted">
            <span>
              Page {page + 1} sur {totalPages} ({totalElements} factures)
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
      <InvoiceDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        invoiceSummary={selectedInvoice}
        onOpenPayment={handleOpenPayment}
      />

      <CreateInvoiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onInvoiceCreated={fetchInvoices}
      />

      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={selectedInvoice}
        onPaymentRecorded={fetchInvoices}
      />
    </div>
  )
}
