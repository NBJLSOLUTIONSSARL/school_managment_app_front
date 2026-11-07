import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { InvoicesPage } from '../components/InvoicesPage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/hooks/useI18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key, fallback) => fallback || key,
    language: 'fr',
  })),
}))

vi.mock('../api/invoiceService', () => ({
  invoiceService: {
    getInvoices: vi.fn().mockResolvedValue({
      content: [
        {
          id: 501,
          number: 'INV-2026-001',
          studentId: 9,
          studentName: 'Lucas Bernard',
          dueDate: '2026-10-15',
          totalAmount: 1200.0,
          paidAmount: 600.0,
          status: 'PARTIAL',
        },
        {
          id: 502,
          number: 'INV-2026-002',
          studentId: 10,
          studentName: 'Emma Johnson',
          dueDate: '2026-11-01',
          totalAmount: 850.0,
          paidAmount: 850.0,
          status: 'PAID',
        },
      ],
      totalPages: 1,
      totalElements: 2,
    }),
    getInvoiceById: vi.fn().mockResolvedValue({
      id: 501,
      number: 'INV-2026-001',
      studentName: 'Lucas Bernard',
      totalAmount: 1200.0,
      paidAmount: 600.0,
      status: 'PARTIAL',
      lines: [],
    }),
    createInvoice: vi.fn().mockResolvedValue({ id: 503 }),
  },
}))

vi.mock('../api/paymentService', () => ({
  paymentService: {
    getPaymentsByInvoice: vi.fn().mockResolvedValue([]),
    createPayment: vi.fn().mockResolvedValue({ id: 901 }),
    downloadReceipt: vi.fn().mockResolvedValue(true),
  },
}))

vi.mock('../api/feeTypeService', () => ({
  feeTypeService: {
    getAllFeeTypes: vi.fn().mockResolvedValue([
      { id: 1, name: 'Scolarité T1', defaultAmount: 800.0 },
      { id: 2, name: 'Demi-Pension', defaultAmount: 400.0 },
    ]),
  },
}))

describe('Finances Module', () => {
  let container = null
  let root = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    container = null
  })

  it('renders InvoicesPage with KPI summary and invoice list', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <InvoicesPage />
        </MemoryRouter>
      )
    })

    expect(container.textContent).toContain('Gestion Financière')
    expect(container.textContent).toContain('INV-2026-001')
    expect(container.textContent).toContain('Lucas Bernard')
    expect(container.textContent).toContain('INV-2026-002')
    expect(container.textContent).toContain('Emma Johnson')
    expect(container.textContent).toContain('Partiel')
    expect(container.textContent).toContain('Réglée')
  })

  it('calculates remaining balance and shows payment action for partial invoices', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <InvoicesPage />
        </MemoryRouter>
      )
    })

    expect(container.textContent).toContain('600')
    const encaisseButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent.includes('Encaisser')
    )
    expect(encaisseButtons.length).toBeGreaterThan(0)
  })
})
