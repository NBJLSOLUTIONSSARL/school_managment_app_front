import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscountRulesManager } from '../components/DiscountRulesManager';
import { discountRuleService } from '../api/discountRuleService';

vi.mock('../api/discountRuleService', () => ({
  discountRuleService: {
    getAll: vi.fn(),
    create: vi.fn(),
    toggle: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('DiscountRulesManager', () => {
  const mockRules = [
    {
      id: 1,
      ruleType: 'SIBLING_DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      description: 'Remise fratrie standard 10%',
      active: true,
    },
    {
      id: 2,
      ruleType: 'SCHOLARSHIP',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      description: 'Bourse au mérite',
      studentName: 'Yassine Alami',
      active: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rules list and active status', async () => {
    discountRuleService.getAll.mockResolvedValueOnce(mockRules);

    render(<DiscountRulesManager isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Règles de Réduction, Bourses & Exonérations')).toBeInTheDocument();
    });

    expect(screen.getByText('Remise fratrie standard 10%')).toBeInTheDocument();
    expect(screen.getByText('10 %')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByText('Inactif')).toBeInTheDocument();
  });

  it('allows creating a new discount rule', async () => {
    discountRuleService.getAll.mockResolvedValue(mockRules);
    discountRuleService.create.mockResolvedValueOnce({ id: 3 });

    render(<DiscountRulesManager isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('ex: 15')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('ex: 15'), { target: { value: '25' } });
    fireEvent.change(screen.getByPlaceholderText('ex: Bourse au mérite académique 2026'), {
      target: { value: 'Exonération partielle' },
    });

    fireEvent.click(screen.getByText('+ Ajouter la Règle'));

    await waitFor(() => {
      expect(discountRuleService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discountValue: 25,
          description: 'Exonération partielle',
        })
      );
    });
  });
});
