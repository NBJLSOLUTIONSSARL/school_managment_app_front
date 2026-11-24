import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryManagerView from '../InventoryManagerView';
import { addonService } from '../../api/addonService';

vi.mock('../../api/addonService', () => ({
  addonService: {
    getInventoryItems: vi.fn(),
    getInventoryStats: vi.fn(),
    createInventoryItem: vi.fn(),
    adjustStock: vi.fn(),
    deleteInventoryItem: vi.fn(),
  },
}));

describe('InventoryManagerView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addonService.getInventoryStats.mockResolvedValue({
      totalItems: 42,
      totalValuation: 125000.0,
      lowStockCount: 3,
      damagedCount: 1,
    });
    addonService.getInventoryItems.mockResolvedValue({
      content: [
        {
          id: 1,
          name: 'Microscope Optique Binoculaire',
          itemCode: 'LAB-MIC-01',
          category: 'LAB_MATERIAL',
          location: 'Labo SVT 1',
          quantity: 12,
          minQuantity: 5,
          unitPrice: 2500.0,
          itemCondition: 'GOOD',
          notes: 'Grossissement x1000',
        },
      ],
      totalElements: 1,
    });
  });

  it('renders inventory valuation and item listing', async () => {
    render(<InventoryManagerView />);

    await waitFor(() => {
      expect(screen.getByText('Microscope Optique Binoculaire')).toBeInTheDocument();
      expect(screen.getByText('LAB-MIC-01')).toBeInTheDocument();
      expect(screen.getByText('Labo SVT 1')).toBeInTheDocument();
      expect(screen.getAllByText('Laboratoire & Sciences')[0]).toBeInTheDocument();
    });

    expect(screen.getByText('Total Références')).toBeInTheDocument();
    expect(screen.getByText('125 000,00 MAD')).toBeInTheDocument();
  });

  it('opens adjust stock modal and submits adjustment', async () => {
    addonService.adjustStock.mockResolvedValue({ id: 1, quantity: 15 });

    render(<InventoryManagerView />);

    await waitFor(() => {
      expect(screen.getByTitle('Ajuster le stock (+/-)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Ajuster le stock (+/-)'));

    await waitFor(() => {
      expect(screen.getByText('Ajustement de Stock')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Ex: Réception livraison/i), {
      target: { value: 'Donation laboratoire' },
    });

    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(addonService.adjustStock).toHaveBeenCalledWith(1, 1, 'Donation laboratoire');
      expect(screen.getByText('Stock ajusté avec succès.')).toBeInTheDocument();
    });
  });
});
