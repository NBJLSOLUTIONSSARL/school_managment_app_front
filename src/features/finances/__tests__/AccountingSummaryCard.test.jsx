import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountingSummaryCard } from '../components/AccountingSummaryCard';
import { invoiceInstallmentService } from '../api/invoiceInstallmentService';

vi.mock('../api/invoiceInstallmentService', () => ({
  invoiceInstallmentService: {
    getAccountingSummary: vi.fn(),
    triggerOverdueReminders: vi.fn(),
  },
}));

describe('AccountingSummaryCard', () => {
  const mockSummary = {
    totalInvoiced: 125000,
    totalCollected: 95000,
    totalPending: 30000,
    totalOverdue: 12000,
    totalDiscounts: 5000,
    totalExpenses: 40000,
    netBalance: 55000,
    totalInvoicesCount: 150,
    paidInvoicesCount: 110,
    overdueInvoicesCount: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary indicators accurately', async () => {
    invoiceInstallmentService.getAccountingSummary.mockResolvedValueOnce(mockSummary);

    render(<AccountingSummaryCard onRefreshTrigger={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Récapitulatif Comptable')).toBeInTheDocument();
    });

    expect(screen.getByText('150 factures')).toBeInTheDocument();
    expect(screen.getByText('125,000 EUR')).toBeInTheDocument();
    expect(screen.getByText('95,000 EUR')).toBeInTheDocument();
    expect(screen.getByText('30,000 EUR')).toBeInTheDocument();
    expect(screen.getByText('12,000 EUR')).toBeInTheDocument();
    expect(screen.getByText('55,000 EUR')).toBeInTheDocument();
  });

  it('triggers overdue reminders when button clicked', async () => {
    invoiceInstallmentService.getAccountingSummary.mockResolvedValue(mockSummary);
    invoiceInstallmentService.triggerOverdueReminders.mockResolvedValueOnce({
      message: 'Rappels envoyés avec succès',
    });

    render(<AccountingSummaryCard onRefreshTrigger={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Relancer impayés email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Relancer impayés email'));

    await waitFor(() => {
      expect(invoiceInstallmentService.triggerOverdueReminders).toHaveBeenCalled();
      expect(screen.getByText('Rappels envoyés avec succès')).toBeInTheDocument();
    });
  });
});
