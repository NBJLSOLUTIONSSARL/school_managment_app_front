import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { Plus, Trash2 } from 'lucide-react'
import { feeTypeService } from '../api/feeTypeService'
import { invoiceService } from '../api/invoiceService'
import { studentService } from '@/features/students/api/studentService'
import { useI18n } from '@/hooks/useI18n'

export function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated }) {
  const { t } = useI18n()
  const [students, setStudents] = useState([])
  const [feeTypes, setFeeTypes] = useState([])
  const [studentId, setStudentId] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [discount, setDiscount] = useState('0')
  const [lines, setLines] = useState([{ feeTypeId: '', quantity: 1, unitAmount: '0' }])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const init = async () => {
      setFetchingData(true)
      try {
        const [studRes, feeRes] = await Promise.all([
          studentService.getStudents({ page: 0, size: 100 }),
          feeTypeService.getAllFeeTypes().catch(() => []),
        ])
        if (isMounted) {
          const list = studRes?.content || (Array.isArray(studRes) ? studRes : [])
          setStudents(list)
          const fees = Array.isArray(feeRes) ? feeRes : []
          setFeeTypes(fees)
          if (fees.length > 0) {
            setLines([{ feeTypeId: fees[0].id, quantity: 1, unitAmount: fees[0].defaultAmount?.toString() || '0' }])
          }
          if (list.length > 0) {
            setStudentId(list[0].id)
          }
        }
      } catch {
        if (isMounted) {
          setError('Erreur lors du chargement des élèves et types de frais.')
        }
      } finally {
        if (isMounted) setFetchingData(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddLine = () => {
    const defaultFee = feeTypes[0]
    setLines((prev) => [
      ...prev,
      {
        feeTypeId: defaultFee?.id || '',
        quantity: 1,
        unitAmount: defaultFee?.defaultAmount?.toString() || '0',
      },
    ])
  }

  const handleRemoveLine = (index) => {
    if (lines.length <= 1) return
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const handleLineChange = (index, field, value) => {
    setLines((prev) => {
      const copy = [...prev]
      if (field === 'feeTypeId') {
        const selectedFee = feeTypes.find((f) => String(f.id) === String(value))
        copy[index] = {
          ...copy[index],
          feeTypeId: value,
          unitAmount: selectedFee?.defaultAmount?.toString() || copy[index].unitAmount,
        }
      } else {
        copy[index] = { ...copy[index], [field]: value }
      }
      return copy
    })
  }

  const calculateTotal = () => {
    const subtotal = lines.reduce((acc, l) => acc + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitAmount) || 0), 0)
    const disc = parseFloat(discount) || 0
    return Math.max(0, subtotal - disc)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!studentId) {
      setError('Veuillez sélectionner un élève.')
      return
    }
    if (lines.some((l) => !l.feeTypeId || parseFloat(l.unitAmount) < 0)) {
      setError('Vérifiez les lignes de facturation.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await invoiceService.createInvoice({
        studentId: Number(studentId),
        dueDate,
        discount: parseFloat(discount) || 0,
        lines: lines.map((l) => ({
          feeTypeId: Number(l.feeTypeId),
          quantity: parseInt(l.quantity, 10) || 1,
          unitAmount: parseFloat(l.unitAmount) || 0,
        })),
      })
      if (onInvoiceCreated) {
        await onInvoiceCreated()
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la facture.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Émettre une Nouvelle Facture"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && <Alert variant="error" message={error} />}

        {fetchingData ? (
          <div className="p-4 text-center text-text-muted">
            <div className="inline-block w-5 h-5 border-2 border-primary-default border-t-transparent rounded-full animate-spin mb-1" />
            <p>Chargement des données de référence...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Élève Bénéficiaire <span className="text-danger-emphasis">*</span>
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-border-default bg-fill-neutral text-text-default hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary-focus"
                  required
                >
                  <option value="">Sélectionner un élève...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Matricule: {s.studentNumber || s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Date d'Échéance <span className="text-danger-emphasis">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-border-default bg-fill-neutral text-text-default hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-primary-focus"
                  required
                />
              </div>
            </div>

            {/* Line items dynamic builder */}
            <div className="border border-border-default rounded p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-border-default pb-1.5">
                <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                  Prestations & Lignes de Frais
                </span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1 text-2xs font-semibold text-primary-default hover:underline"
                >
                  <Plus className="w-3 h-3" /> Ajouter une ligne
                </button>
              </div>

              <div className="space-y-2">
                {lines.map((line, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={line.feeTypeId}
                        onChange={(e) => handleLineChange(index, 'feeTypeId', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded border border-border-default bg-fill-neutral text-text-default"
                        required
                      >
                        <option value="">Choisir un type de frais...</option>
                        {feeTypes.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded border border-border-default bg-fill-neutral text-text-default text-center"
                        required
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Prix Unit."
                        value={line.unitAmount}
                        onChange={(e) => handleLineChange(index, 'unitAmount', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded border border-border-default bg-fill-neutral text-text-default font-mono text-right"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      disabled={lines.length <= 1}
                      className="p-1 text-text-muted hover:text-danger-emphasis disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount and Totals */}
            <div className="flex justify-between items-center bg-fill-neutral-subtle p-3 rounded border border-border-default">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold text-text-muted uppercase">Réduction (€) :</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 text-xs px-2 py-1 rounded border border-border-default bg-fill-neutral text-text-default font-mono text-right"
                />
              </div>
              <div className="text-right">
                <span className="text-2xs text-text-muted uppercase block">Montant Total Net</span>
                <span className="font-mono text-base font-bold text-primary-default">
                  {calculateTotal().toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Actions */}
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
                {loading ? 'Création...' : 'Émettre la facture'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
