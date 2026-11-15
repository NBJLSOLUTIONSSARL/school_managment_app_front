import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LibraryManagerView from '../LibraryManagerView';
import { addonService } from '../../api/addonService';

vi.mock('../../api/addonService', () => ({
  addonService: {
    getLibraryStats: vi.fn(),
    getBooks: vi.fn(),
    getLoans: vi.fn(),
    applyPenalty: vi.fn(),
    payPenalty: vi.fn(),
  },
}));

describe('LibraryManagerView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addonService.getLibraryStats.mockResolvedValue({
      totalBooks: 150,
      totalCopies: 320,
      availableCopies: 280,
      activeLoans: 40,
      overdueLoans: 5,
      totalPenaltiesUnpaid: 125.5,
    });
    addonService.getBooks.mockResolvedValue({
      content: [
        { id: 1, title: 'Le Petit Prince', isbn: '978-0156012195', author: 'Antoine de Saint-Exupéry', totalCopies: 5, availableCopies: 3 },
      ],
      totalElements: 1,
    });
    addonService.getLoans.mockResolvedValue({
      content: [
        {
          id: 10,
          bookId: 1,
          bookTitle: 'Le Petit Prince',
          borrowerName: 'Karim Alaoui',
          borrowDate: '2026-11-01',
          dueDate: '2026-11-10',
          status: 'BORROWED',
          penaltyAmount: 15.0,
          penaltyPaid: false,
        },
      ],
      totalElements: 1,
    });
  });

  it('renders stats and book catalog by default', async () => {
    render(<LibraryManagerView />);

    await waitFor(() => {
      expect(screen.getByText('Le Petit Prince')).toBeInTheDocument();
      expect(screen.getByText('Antoine de Saint-Exupéry')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Livres')).toBeInTheDocument();
    expect(screen.getByText('Exemplaires Dispos')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
  });

  it('switches to loans tab and allows paying a penalty', async () => {
    addonService.payPenalty.mockResolvedValue({ id: 10, penaltyPaid: true });

    render(<LibraryManagerView />);

    await waitFor(() => {
      expect(screen.getByText(/Emprunts & Pénalités/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Emprunts & Pénalités/i));

    await waitFor(() => {
      expect(screen.getByText('Karim Alaoui')).toBeInTheDocument();
      expect(screen.getByText(/15\.00/)).toBeInTheDocument();
    });

    const payButton = screen.getByText('Régler');
    expect(payButton).toBeInTheDocument();
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(addonService.payPenalty).toHaveBeenCalledWith(10);
      expect(screen.getByText('Pénalité marquée comme réglée.')).toBeInTheDocument();
    });
  });
});
