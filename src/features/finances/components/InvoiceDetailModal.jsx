import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { Download, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { paymentService } from '../api/paymentService'
import { invoiceService } from '../api/invoiceService'
import { useI18n } from '@/hooks/useI18n'

export function InvoiceDetailModal({ isOpen, onClose, invoiceSummary, onOpenPayment }) {
  const { t } = useI18n()
  const [invoice, setInvoice] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen || !invoiceSummary?.id) return

    let isMounted = true
    const loadDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const [invRes, payRes] = await Promise.all([
          invoiceService.getInvoiceById(invoiceSummary.id),
          paymentService.getPaymentsByInvoice(invoiceSummary.id).catch(() => []),
        ])
        if (isMounted) {
          setInvoice(invRes)
          setPayments(Array.isArray(payRes) ? payRes : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Erreur lors du chargement de la facture.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDetails()
    return () => {
      isMounted = false
    }
  }, [isOpen, invoiceSummary?.id])

  if (!isOpen) return null

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
            <CheckCircle2 className="w-3 h-3" /> Réglée (PAID)
          </span>
        )
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
            <Clock className="w-3 h-3" /> Partiel (PARTIAL)
          </span>
        )
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
            <AlertTriangle className="w-3 h-3" /> En retard (OVERDUE)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
            Non payée (UNPAID)
          </span>
        )
    }
  }

  const remaining = invoice ? Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0)) : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Facture ${invoice?.number || invoiceSummary?.number || `#${invoiceSummary?.id}`}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {error && <Alert variant="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-text-muted">
            <div className="inline-block w-6 h-6 border-2 border-primary-default border-t-transparent rounded-full animate-spin mb-2" />
            <p>Chargement des détails de la facture...</p>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="flex items-center justify-between p-3 bg-fill-neutral-subtle rounded border border-border-default">
              <div>
                <span className="text-2xs font-mono text-text-muted">Numéro : {invoice?.number}</span>
                <h3 className="text-sm font-semibold text-text-default">
                  {invoice?.studentName || `Élève #${invoice?.studentId}`}
                </h3>
                <p className="text-2xs text-text-muted">
                  Échéance : {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <div className="mb-1">{getStatusBadge(invoice?.status)}</div>
                <div className="font-mono text-sm font-bold text-text-default">
                  {Number(invoice?.totalAmount || 0).toLocaleString()} €
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-border-default rounded overflow-hidden">
              <div className="bg-fill-neutral-subtle px-3 py-2 border-b border-border-default font-semibold text-2xs uppercase tracking-wider text-text-muted">
                Lignes de Facturation
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-default text-2xs text-text-muted">
                    <th className="py-2 px-3">Prestation / Frais</th>
                    <th className="py-2 px-3 text-center">Quantité</th>
                    <th className="py-2 px-3 text-right">Prix Unitaire</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {invoice?.lines && invoice.lines.length > 0 ? (
                    invoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 font-medium text-text-default">{l.feeTypeName || `Frais #${l.feeTypeId}`}</td>
                        <td className="py-2 px-3 text-center text-text-muted">{l.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono text-text-muted">
                          {Number(l.unitAmount || 0).toFixed(2)} €
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-text-default">
                          {Number(l.totalAmount || (l.quantity * l.unitAmount) || 0).toFixed(2)} €
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-center text-text-muted italic">
                        Aucune ligne détaillée.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {Number(invoice?.discount || 0) > 0 && (
                    <tr className="bg-fill-neutral-subtle border-t border-border-default text-text-muted">
                      <td colSpan={3} className="py-1.5 px-3 text-right font-medium">Réduction accordée :</td>
                      <td className="py-1.5 px-3 text-right font-mono text-success-emphasis">
                        -{Number(invoice.discount).toFixed(2)} €
                      </td>
                    </tr>
                  )}
                  <tr className="bg-fill-neutral-subtle font-semibold text-text-default">
                    <td colSpan={3} className="py-2 px-3 text-right">Net à payer :</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {Number(invoice?.totalAmount || 0).toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payments history */}
            <div className="border border-border-default rounded overflow-hidden">
              <div className="bg-fill-neutral-subtle px-3 py-2 border-b border-border-default flex items-center justify-between">
                <span className="font-semibold text-2xs uppercase tracking-wider text-text-muted">
                  Règlements Enregistrés ({payments.length})
                </span>
                <span className="font-mono text-2xs font-semibold text-success-emphasis">
                  Encaissé : {Number(invoice?.paidAmount || 0).toFixed(2)} €
                </span>
              </div>
              {payments.length === 0 ? (
                <div className="p-3 text-center text-2xs text-text-muted italic">
                  Aucun règlement n'a encore été perçu pour cette facture.
                </div>
              ) : (
                <div className="divide-y divide-border-default text-xs">
                  {payments.map((p) => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold font-mono text-text-default">
                          {Number(p.amount || 0).toFixed(2)} €
                        </span>
                        <span className="text-2xs text-text-muted ml-2">
                          via {p.method} • {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => paymentService.downloadReceipt(p.id)}
                        className="inline-flex items-center gap-1 text-2xs text-primary-default hover:underline font-medium"
                      >
                        <Download className="w-3 h-3" /> Reçu PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <div>
                {remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenPayment(invoice)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-on-primary bg-primary-default rounded hover:bg-primary-hover focus:ring-2 focus:ring-primary-focus"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Encaisser un règlement ({remaining.toFixed(2)} €)
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-text-default bg-fill-neutral border border-border-default rounded hover:bg-fill-neutral-hover"
              >
                {t('common.close', 'Fermer')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
