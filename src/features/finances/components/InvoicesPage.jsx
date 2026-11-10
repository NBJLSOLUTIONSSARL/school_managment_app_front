import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  DollarSign,
  Clock,
  Award,
  ChevronRight,
  Eye,
  Copy,
  Check,
} from 'lucide-react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { StatCard } from '@/components/ui/StatCard'
import { TableToolbar } from '@/components/ui/TableToolbar'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
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
  const [activeView, setActiveView] = useState('table')
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

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      inv.number?.toLowerCase().includes(q) ||
      inv.studentName?.toLowerCase().includes(q)
    )
  })

  // KPI calculations
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0)
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0)
  const paidCount = invoices.filter((i) => i.status === 'PAID').length

  const columns = [
    {
      key: 'number',
      label: 'Facture / Numéro',
      sortable: true,
      render: (val, inv) => (
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-bold text-xs text-[#111827] shrink-0">
            {inv.number ? inv.number.slice(0, 2).toUpperCase() : 'FC'}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#111827] font-semibold">
            <span>{inv.number || `#${inv.id}`}</span>
            <button
              type="button"
              onClick={(e) => handleCopy(inv.number || `#${inv.id}`, inv.id, e)}
              className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded transition cursor-pointer"
              title="Copier le numéro"
            >
              {copiedId === inv.id ? (
                <Check className="w-3 h-3 text-[#059669]" />
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
        <div className="flex items-center justify-between gap-2 max-w-xs group cursor-pointer">
          <span className="text-xs font-medium text-[#111827] truncate">
            {inv.studentName || `Élève #${inv.studentId}`}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] shrink-0" />
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Montant Total',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-[#111827]">
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
          PAID: { badge: 'Complete', label: 'Réglée' },
          PARTIAL: { badge: 'Follow-Up', label: 'Partiel' },
          UNPAID: { badge: 'In Negotiation', label: 'En attente' },
          OVERDUE: { badge: 'To Contact', label: 'En retard' },
        }
        const cfg = statusMap[val] || { badge: 'To Contact', label: val || 'Draft' }
        return <StatusBadge status={cfg.badge} label={cfg.label} showPlus />
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, inv) => {
        const remaining = Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0))
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => handleOpenDetail(inv)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Détails
            </Button>
            {remaining > 0 && (
              <Button
                size="xs"
                variant="primary"
                onClick={() => handleOpenPayment(inv)}
              >
                Encaisser
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] min-h-screen">
      <DocTypePageHead
        icon={CreditCard}
        title="Gestion Financière"
        count={totalElements}
        countLabel="factures"
        primaryAction={{
          label: 'New invoice',
          onClick: () => setCreateModalOpen(true),
        }}
      />

      {error && <Alert variant="error" message={error} />}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CreditCard}
          title="Active Opportunities"
          value={`${totalElements} active`}
          trendValue="↗ 3.5%"
          trendType="positive"
        />
        <StatCard
          icon={DollarSign}
          title="Deals Closed This Month"
          value={`${paidCount} completed`}
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
          value={`${totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 62}%`}
          trendValue="↗ 8.34%"
          trendType="positive"
        />
      </div>

      <TableToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par numéro ou élève..."
        primaryActionLabel="New invoice"
        onPrimaryAction={() => setCreateModalOpen(true)}
        filters={[
          {
            label: 'Person to contact',
            onClick: () => {},
          },
          {
            label: statusFilter === 'ALL' ? 'Status' : statusFilter,
            onClick: () => {
              const options = ['ALL', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE']
              const idx = options.indexOf(statusFilter)
              setStatusFilter(options[(idx + 1) % options.length])
            },
          },
        ]}
      />

      <PaginatedTable
        columns={columns}
        data={filteredInvoices}
        totalItems={totalElements}
        pageSize={15}
        page={page + 1}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p - 1)}
        isLoading={loading}
        enableSelection
        onRowClick={(inv) => handleOpenDetail(inv)}
      />

      {/* Modals */}
      {detailModalOpen && (
        <InvoiceDetailModal
          isOpen={detailModalOpen}
          invoice={selectedInvoice}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedInvoice(null)
          }}
          onRecordPayment={() => {
            setDetailModalOpen(false)
            setPaymentModalOpen(true)
          }}
        />
      )}

      {createModalOpen && (
        <CreateInvoiceModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false)
            fetchInvoices()
          }}
        />
      )}

      {paymentModalOpen && (
        <RecordPaymentModal
          isOpen={paymentModalOpen}
          invoice={selectedInvoice}
          onClose={() => {
            setPaymentModalOpen(false)
            setSelectedInvoice(null)
          }}
          onSuccess={() => {
            setPaymentModalOpen(false)
            setSelectedInvoice(null)
            fetchInvoices()
          }}
        />
      )}
    </div>
  )
}

export default InvoicesPage
