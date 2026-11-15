import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HealthCenterView from '../HealthCenterView';
import { addonService } from '../../api/addonService';

vi.mock('../../api/addonService', () => ({
  addonService: {
    getInfirmaryVisits: vi.fn(),
    getVaccinations: vi.fn(),
    getHealthStats: vi.fn(),
    getStudentHealthDossier: vi.fn(),
    createInfirmaryVisit: vi.fn(),
    createVaccination: vi.fn(),
  },
}));

describe('HealthCenterView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addonService.getHealthStats.mockResolvedValue({
      totalVisits: 84,
      monthlyVisits: 12,
      emergencyTransfers: 1,
      upToDateVaccinations: 250,
    });
    addonService.getInfirmaryVisits.mockResolvedValue({
      content: [
        {
          id: 1,
          studentId: 5,
          studentName: 'Nadia Idrissi',
          visitDateTime: '2026-11-15T10:30',
          symptoms: 'Fièvre modérée et maux de gorge',
          treatment: 'Repos 30 minutes, température 38.1°C',
          disposition: 'RETURNED_TO_CLASS',
          parentNotified: true,
          nurseNotes: 'Boire beaucoup d’eau',
        },
      ],
      totalElements: 1,
    });
    addonService.getVaccinations.mockResolvedValue([
      {
        id: 1,
        studentId: 5,
        studentName: 'Nadia Idrissi',
        vaccineName: 'Hépatite B',
        doseNumber: 2,
        dateAdministered: '2026-10-12',
        nextDueDate: '2027-10-12',
        administeredBy: 'Dr. Bennani',
      },
    ]);
  });

  it('renders security banner, stats and visit log by default', async () => {
    render(<HealthCenterView />);

    await waitFor(() => {
      expect(screen.getByText('Fièvre modérée et maux de gorge')).toBeInTheDocument();
      expect(screen.getByText('Nadia Idrissi')).toBeInTheDocument();
      expect(screen.getByText('Retour en classe')).toBeInTheDocument();
    });

    expect(screen.getByText(/Espace Médical Confidentiel/i)).toBeInTheDocument();
    expect(screen.getByText('Passages Infirmerie')).toBeInTheDocument();
  });

  it('switches to vaccination tracking tab', async () => {
    render(<HealthCenterView />);

    await waitFor(() => {
      expect(screen.getByText(/Suivi Vaccinal/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Suivi Vaccinal/i));

    await waitFor(() => {
      expect(screen.getByText('Hépatite B')).toBeInTheDocument();
      expect(screen.getByText('Dose 2')).toBeInTheDocument();
      expect(screen.getByText('Dr. Bennani')).toBeInTheDocument();
    });
  });

  it('looks up individual student medical dossier', async () => {
    addonService.getStudentHealthDossier.mockResolvedValue({
      studentId: 5,
      studentName: 'Nadia Idrissi',
      bloodGroup: 'O+',
      allergies: 'Pénicilline',
      chronicConditions: 'Asthme léger d’effort',
      emergencyContactName: 'Mme Idrissi',
      emergencyContactPhone: '0661223344',
      visits: [
        {
          id: 1,
          visitDateTime: '2026-11-15T10:30',
          symptoms: 'Fièvre modérée',
          treatment: 'Repos',
          disposition: 'RETURNED_TO_CLASS',
        },
      ],
      vaccinations: [],
    });

    render(<HealthCenterView />);

    await waitFor(() => {
      expect(screen.getByText('Dossier Médical Individuel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Dossier Médical Individuel'));

    const searchInput = screen.getByPlaceholderText(/Entrez l’ID de l’élève/i);
    fireEvent.change(searchInput, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Consulter Dossier'));

    await waitFor(() => {
      expect(addonService.getStudentHealthDossier).toHaveBeenCalledWith('5');
      expect(screen.getByText(/Dossier Médical : Nadia Idrissi/i)).toBeInTheDocument();
      expect(screen.getByText('Pénicilline')).toBeInTheDocument();
      expect(screen.getByText('Asthme léger d’effort')).toBeInTheDocument();
      expect(screen.getByText('Groupe Sanguin : O+')).toBeInTheDocument();
    });
  });
});
