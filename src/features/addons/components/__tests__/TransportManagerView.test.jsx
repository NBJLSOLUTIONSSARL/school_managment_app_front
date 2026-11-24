import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransportManagerView from '../TransportManagerView';
import { addonService } from '../../api/addonService';

vi.mock('../../api/addonService', () => ({
  addonService: {
    getRoutes: vi.fn(),
    getVehicles: vi.fn(),
    getAllocations: vi.fn(),
    createRoute: vi.fn(),
    createVehicle: vi.fn(),
    deleteRoute: vi.fn(),
    createAllocation: vi.fn(),
  },
}));

describe('TransportManagerView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addonService.getRoutes.mockResolvedValue([
      {
        id: 1,
        name: 'Ligne A - Centre Ville',
        description: 'Arrêt Gare puis Lycée',
        departureTime: '07:30',
        arrivalTime: '08:15',
        vehicleModel: 'Mercedes Sprinter',
        vehiclePlate: '12345-A-1',
        driverName: 'Mohammed Alami',
        driverPhone: '0612345678',
        assignedStudentsCount: 15,
        vehicleCapacity: 30,
      },
    ]);
    addonService.getVehicles.mockResolvedValue([
      {
        id: 1,
        plateNumber: '12345-A-1',
        model: 'Mercedes Sprinter',
        capacity: 30,
        driverName: 'Mohammed Alami',
        status: 'AVAILABLE',
      },
    ]);
    addonService.getAllocations.mockResolvedValue([
      {
        id: 101,
        studentId: 1,
        studentName: 'Yassine Berrada',
        routeId: 1,
        routeName: 'Ligne A - Centre Ville',
        pickupStop: 'Place Mohammed V',
        status: 'CONFIRMED',
      },
    ]);
  });

  it('renders routes list by default', async () => {
    render(<TransportManagerView />);

    await waitFor(() => {
      expect(screen.getByText('Ligne A - Centre Ville')).toBeInTheDocument();
      expect(screen.getByText(/12345-A-1/)).toBeInTheDocument();
      expect(screen.getByText(/Mohammed Alami/)).toBeInTheDocument();
    });
  });

  it('switches to vehicles tab and displays fleet list', async () => {
    render(<TransportManagerView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Flotte de Véhicules/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Flotte de Véhicules/i }));

    await waitFor(() => {
      expect(screen.getByText('12345-A-1')).toBeInTheDocument();
      expect(screen.getByText(/30 places/i)).toBeInTheDocument();
    });
  });

  it('switches to allocations tab and displays assigned students', async () => {
    render(<TransportManagerView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Élèves Affectés/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Élèves Affectés/i }));

    await waitFor(() => {
      expect(screen.getByText('Yassine Berrada')).toBeInTheDocument();
      expect(screen.getByText('Place Mohammed V')).toBeInTheDocument();
    });
  });
});
