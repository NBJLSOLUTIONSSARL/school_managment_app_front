import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { useI18n } from '@/hooks/useI18n'
import { paymentService } from '../api/paymentService'

export function RecordPaymentModal({ isOpen, onClose, invoice, onPaymentRecorded }) {
  const { t } = useI18n()
  const remaining = invoice ? Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0)) : 0
  const [amount, setAmount] = useState(remaining ? remaining.toFixed(2) : '')
  const [method, setMethod] = useState('CASH')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !invoice) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await paymentService.createPayment({
        invoiceId: invoice.id,
        amount: parseFloat(amount),
        method,
      })
      if (onPaymentRecorded) {
        await onPaymentRecorded()
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Impossible d\'enregistrer le paiement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enregistrer un Règlement — Facture ${invoice.number || `#${invoice.id}`}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && <Alert variant="error" message={error} />}

        <div className="bg-fill-neutral-subtle p-3 rounded border border-border-default space-y-1">
          <div className="flex justify-between">
            <span className="text-text-muted">Élève :</span>
            <span className="font-semibold text-text-default">
              {invoice.studentName || `Élève #${invoice.studentId}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Montant Total :</span>
            <span className="font-mono text-text-default">{Number(invoice.totalAmount || 0).toLocaleString()} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Reste à payer :</span>
            <span className="font-mono font-bold text-danger-emphasis">
              {Number(remaining).toLocaleString()} €
            </span>
          </div>
        </div>

        <div>
          <label className="block text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Montant du Versement (€) <span className="text-danger-emphasis">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={remaining || undefined}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-border-default bg-fill-neutral hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary-focus text-text-default font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Mode de Règlement <span className="text-danger-emphasis">*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-border-default bg-fill-neutral hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary-focus text-text-default"
            required
          >
            <option value="CASH">Espèces (CASH)</option>
            <option value="BANK_TRANSFER">Virement Bancaire (BANK_TRANSFER)</option>
            <option value="CHECK">Chèque Bancaire (CHECK)</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border-default">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-text-default bg-fill-neutral border border-border-default rounded hover:bg-fill-neutral-hover disabled:opacity-50"
          >
            {t('common.cancel', 'Annuler')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-text-on-primary bg-primary-default rounded hover:bg-primary-hover focus:ring-2 focus:ring-primary-focus disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Valider le paiement'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
