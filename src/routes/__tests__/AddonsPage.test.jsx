import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AddonsPage } from '../AddonsPage';
import { addonService } from '@/features/addons/api/addonService';
import * as authHook from '@/hooks/useAuth';

vi.mock('@/features/addons/api/addonService', () => ({
  addonService: {
    getFeatureStatus: vi.fn(),
    getLibraryStats: vi.fn().mockResolvedValue(null),
    getBooks: vi.fn().mockResolvedValue({ content: [] }),
    getLoans: vi.fn().mockResolvedValue({ content: [] }),
    getRoutes: vi.fn().mockResolvedValue([]),
    getVehicles: vi.fn().mockResolvedValue([]),
    getAllocations: vi.fn().mockResolvedValue([]),
    getMenus: vi.fn().mockResolvedValue([]),
    getSubscriptions: vi.fn().mockResolvedValue([]),
    getInventoryItems: vi.fn().mockResolvedValue({ content: [] }),
    getInventoryStats: vi.fn().mockResolvedValue(null),
    getInfirmaryVisits: vi.fn().mockResolvedValue({ content: [] }),
    getVaccinations: vi.fn().mockResolvedValue([]),
    getHealthStats: vi.fn().mockResolvedValue(null),
    getClubs: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/hooks/useAuth');

describe('AddonsPage Integration Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authHook.useAuth.mockReturnValue({
      user: { id: 1, email: 'admin@school.com', role: 'ADMIN' },
      hasRole: vi.fn().mockReturnValue(false),
    });
    addonService.getFeatureStatus.mockResolvedValue({
      library: true,
      transport: true,
      canteen: true,
      inventory: true,
      health: true,
      clubs: true,
    });
  });

  const renderWithRouter = (initialEntry = '/addons') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AddonsPage />
      </MemoryRouter>
    );
  };

  it('renders all module selector buttons', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Bibliothèque')).toBeInTheDocument();
      expect(screen.getByText('Transport Scolaire')).toBeInTheDocument();
      expect(screen.getByText('Cantine Scolaire')).toBeInTheDocument();
      expect(screen.getByText('Inventaire & Actifs')).toBeInTheDocument();
      expect(screen.getByText('Santé & Infirmerie')).toBeInTheDocument();
      expect(screen.getByText('Clubs & Périscolaire')).toBeInTheDocument();
    });
  });

  it('navigates to transport module when clicking Transport button', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Transport Scolaire')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transport Scolaire'));

    await waitFor(() => {
      expect(screen.getByText(/Lignes & Itinéraires/i)).toBeInTheDocument();
    });
  });

  it('navigates to canteen module when clicking Cantine button', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Cantine Scolaire')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cantine Scolaire'));

    await waitFor(() => {
      expect(screen.getByText('Restauration Scolaire & Cantine')).toBeInTheDocument();
    });
  });

  it('shows disabled module notice when feature is turned off in settings', async () => {
    addonService.getFeatureStatus.mockResolvedValue({
      library: true,
      transport: false, // transport is disabled!
      canteen: true,
      inventory: true,
      health: true,
      clubs: true,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Transport Scolaire')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transport Scolaire'));

    await waitFor(() => {
      expect(screen.getByText(/Module Désactivé \(Transport Scolaire\)/i)).toBeInTheDocument();
      expect(screen.getByText(/app\.features\.transport\.enabled=false/i)).toBeInTheDocument();
    });
  });
});
