import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CanteenManagerView from '../CanteenManagerView';
import { addonService } from '../../api/addonService';

vi.mock('../../api/addonService', () => ({
  addonService: {
    getMenus: vi.fn(),
    getSubscriptions: vi.fn(),
    createMenu: vi.fn(),
    deleteMenu: vi.fn(),
    createSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
  },
}));

describe('CanteenManagerView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addonService.getMenus.mockResolvedValue([
      {
        id: 1,
        menuDate: '2026-11-16',
        mealType: 'LUNCH',
        title: 'Couscous Royal aux sept légumes',
        description: 'Semoule bio, légumes de saison',
        allergens: 'Gluten, Céleri',
        calories: 620,
        isVegetarian: false,
      },
    ]);
    addonService.getSubscriptions.mockResolvedValue([
      {
        id: 10,
        studentId: 1,
        studentName: 'Salma Tazi',
        planType: 'MONTHLY',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        dietaryRestrictions: 'Sans arachides',
        status: 'ACTIVE',
      },
    ]);
  });

  it('renders menu items and meal details by default', async () => {
    render(<CanteenManagerView />);

    await waitFor(() => {
      expect(screen.getByText('Couscous Royal aux sept légumes')).toBeInTheDocument();
      expect(screen.getByText('Semoule bio, légumes de saison')).toBeInTheDocument();
      expect(screen.getByText('620 kcal')).toBeInTheDocument();
    });

    expect(screen.getByText('Gluten')).toBeInTheDocument();
  });

  it('switches to subscriptions tab and displays student plans', async () => {
    render(<CanteenManagerView />);

    await waitFor(() => {
      expect(screen.getByText(/Inscriptions & Forfaits/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Inscriptions & Forfaits/));

    await waitFor(() => {
      expect(screen.getByText('Salma Tazi')).toBeInTheDocument();
      expect(screen.getByText('Mensuel')).toBeInTheDocument();
      expect(screen.getByText('Sans arachides')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });
});
