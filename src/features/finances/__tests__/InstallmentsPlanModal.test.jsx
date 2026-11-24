import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstallmentsPlanModal } from '../components/InstallmentsPlanModal';
import { invoiceInstallmentService } from '../api/invoiceInstallmentService';

vi.mock('../api/invoiceInstallmentService', () => ({
  invoiceInstallmentService: {
    getInstallments: vi.fn(),
    createInstallmentPlan: vi.fn(),
    payInstallment: vi.fn(),
  },
}));

describe('InstallmentsPlanModal', () => {
  const mockInvoice = {
    id: 10,
    number: 'INV-2026-001',
    finalAmount: 600,
  };

  const mockInstallments = [
    {
      id: 1,
      installmentNumber: 1,
      dueDate: '2026-11-30',
      amount: 200,
      paidAmount: 200,
      status: 'PAID',
    },
    {
      id: 2,
      installmentNumber: 2,
      dueDate: '2026-12-31',
      amount: 200,
      paidAmount: 0,
      status: 'PENDING',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing installment schedule', async () => {
    invoiceInstallmentService.getInstallments.mockResolvedValueOnce(mockInstallments);

    render(<InstallmentsPlanModal isOpen={true} onClose={() => {}} invoice={mockInvoice} />);

    await waitFor(() => {
      expect(screen.getByText('Échéancier de Paiement — Facture INV-2026-001')).toBeInTheDocument();
    });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getAllByText('200 EUR').length).toBeGreaterThan(0);
    expect(screen.getByText('PAID')).toBeInTheDocument();
    expect(screen.getByText('Régler')).toBeInTheDocument();
  });

  it('pays an installment when button clicked', async () => {
    invoiceInstallmentService.getInstallments.mockResolvedValue(mockInstallments);
    invoiceInstallmentService.payInstallment.mockResolvedValueOnce({ id: 2, status: 'PAID' });

    render(<InstallmentsPlanModal isOpen={true} onClose={() => {}} invoice={mockInvoice} />);

    await waitFor(() => {
      expect(screen.getByText('Régler')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Régler'));

    await waitFor(() => {
      expect(invoiceInstallmentService.payInstallment).toHaveBeenCalledWith(2, 200);
    });
  });
});
