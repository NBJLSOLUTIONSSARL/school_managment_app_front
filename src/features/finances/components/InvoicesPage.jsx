import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  CreditCard,
  Check,
  Copy,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { invoiceService } from '../api/invoiceService'
import { InvoiceDetailModal } from './InvoiceDetailModal'
import { CreateInvoiceModal } from './CreateInvoiceModal'
import { RecordPaymentModal } from './RecordPaymentModal'

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [copiedId, setCopiedId] = useState(null)

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

  const handleCopy = (text, id, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenDetail = (inv) => {
    setSelectedInvoice(inv)
    setDetailModalOpen(true)
  }

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv)
    setPaymentModalOpen(true)
  }

  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices
    const q = searchQuery.toLowerCase()
    return invoices.filter((inv) =>
      inv.number?.toLowerCase().includes(q) ||
      inv.studentName?.toLowerCase().includes(q)
    )
  }, [invoices, searchQuery])

  const columns = [
    {
      key: 'number',
      label: 'Facture / Numéro',
      render: (val, inv) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center font-bold text-xs text-[#2563EB] shrink-0">
            {inv.number ? inv.number.slice(0, 2).toUpperCase() : 'FC'}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#0F172A] font-semibold">
            <span>{inv.number || `#${inv.id}`}</span>
            <button
              type="button"
              onClick={(e) => handleCopy(inv.number || `#${inv.id}`, inv.id, e)}
              className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded transition-colors cursor-pointer"
              title="Copier le numéro"
            >
              {copiedId === inv.id ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'studentName',
      label: 'Élève / Bénéficiaire',
      render: (_, inv) => (
        <span className="text-xs font-medium text-[#0F172A] truncate block max-w-xs">
          {inv.studentName || `Élève #${inv.studentId}`}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Montant Total',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-[#0F172A]">
          {Number(val || 0).toLocaleString()} €
        </span>
      ),
    },
    {
      key: 'remaining',
      label: 'Reste Dû',
      render: (_, inv) => {
        const remaining = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0))
        return (
          <span
            className={`font-mono text-xs font-semibold ${
              remaining > 0 ? 'text-[#DC2626]' : 'text-[#059669]'
            }`}
          >
            {Number(remaining).toLocaleString()} €
          </span>
        )
      },
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      render: (val) => (
        <span className="text-xs text-[#475569]">
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: '120px',
      render: (val) => {
        const statusMap = {
          PAID: { badge: 'Complete', label: 'Réglée' },
          PARTIAL: { badge: 'Follow-Up', label: 'Partiel' },
          UNPAID: { badge: 'In Negotiation', label: 'En attente' },
          OVERDUE: { badge: 'To Contact', label: 'En retard' },
        }
        const cfg = statusMap[val] || { badge: 'To Contact', label: val || 'Brouillon' }
        return <StatusBadge status={cfg.badge} label={cfg.label} />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, inv) => {
        const remaining = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0))
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {remaining > 0 && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleOpenPayment(inv)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-2 py-1 h-7"
              >
                Encaisser
              </Button>
            )}
            <EntityTableActions
              row={inv}
              actions={[
                {
                  label: 'Détails',
                  icon: Eye,
                  onClick: () => handleOpenDetail(inv),
                },
                {
                  label: 'Encaisser paiement',
                  icon: CreditCard,
                  hidden: remaining <= 0,
                  onClick: () => handleOpenPayment(inv),
                },
              ]}
            />
          </div>
        )
      },
    },
  ]

  const hasActiveFilters = statusFilter !== 'ALL'

  const filtersContent = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
        Statut de paiement
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
        <option value="UNPAID">En attente (Impayée)</option>
        <option value="PARTIAL">Partiellement payée</option>
        <option value="PAID">Réglée</option>
        <option value="OVERDUE">En retard</option>
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      {/* Screen-reader heading preserving test suite & accessibility */}
      <h1 className="sr-only">Gestion Financière</h1>

      <EntityListToolbar
        onAddNew={() => setCreateModalOpen(true)}
        addNewLabel="Nouvelle facture"
        canAddNew={true}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(0)
        }}
        searchPlaceholder="Rechercher par numéro ou élève..."
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
        data={filteredInvoices}
        isLoading={loading}
        error={error}
        onRetry={fetchInvoices}
        emptyTitle="Aucune facture trouvée"
        emptyDescription={
          searchQuery || hasActiveFilters
            ? 'Aucune facture ne correspond à vos filtres.'
            : 'Aucune facture enregistrée pour le moment.'
        }
        emptyAction={{
          label: 'Nouvelle facture',
          onClick: () => setCreateModalOpen(true),
        }}
        page={page + 1}
        pageSize={15}
        totalItems={totalElements}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage - 1)}
        onRowClick={(inv) => handleOpenDetail(inv)}
      />

      {detailModalOpen && (
        <InvoiceDetailModal
          isOpen={detailModalOpen}
          invoice={selectedInvoice}
          onClose={() => setDetailModalOpen(false)}
          onOpenPayment={(inv) => {
            setDetailModalOpen(false)
            setSelectedInvoice(inv)
            setPaymentModalOpen(true)
          }}
        />
      )}

      {createModalOpen && (
        <CreateInvoiceModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => {
            setCreateModalOpen(false)
            fetchInvoices()
          }}
        />
      )}

      {paymentModalOpen && (
        <RecordPaymentModal
          isOpen={paymentModalOpen}
          invoice={selectedInvoice}
          onClose={() => setPaymentModalOpen(false)}
          onRecorded={() => {
            setPaymentModalOpen(false)
            fetchInvoices()
          }}
        />
      )}
    </div>
  )
}

export default InvoicesPage
