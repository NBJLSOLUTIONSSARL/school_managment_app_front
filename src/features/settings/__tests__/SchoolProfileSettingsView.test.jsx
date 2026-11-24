import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchoolProfileSettingsView } from '../components/SchoolProfileSettingsView';
import { schoolProfileService } from '../api/schoolProfileService';

vi.mock('../api/schoolProfileService', () => ({
  schoolProfileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

describe('SchoolProfileSettingsView', () => {
  const mockProfile = {
    id: 1,
    name: 'Établissement Scolaire Excellence',
    address: '123 Avenue de Paris',
    phone: '+33 1 23 45 67 89',
    email: 'contact@excellence.edu',
    currency: 'EUR',
    gradingScaleMax: 20,
    passingGrade: 10,
    reportCardTemplate: 'CLASSIC',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders school profile fields', async () => {
    schoolProfileService.getProfile.mockResolvedValueOnce(mockProfile);

    render(<SchoolProfileSettingsView />);

    await waitFor(() => {
      expect(screen.getByText("Paramètres de l'Établissement & Barèmes")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Établissement Scolaire Excellence')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Avenue de Paris')).toBeInTheDocument();
  });

  it('submits updated profile', async () => {
    schoolProfileService.getProfile.mockResolvedValue(mockProfile);
    schoolProfileService.updateProfile.mockResolvedValueOnce({
      ...mockProfile,
      name: 'Académie Internationale',
    });

    render(<SchoolProfileSettingsView />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Établissement Scolaire Excellence')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue('Établissement Scolaire Excellence'), {
      target: { value: 'Académie Internationale' },
    });

    fireEvent.click(screen.getByText('Enregistrer les modifications'));

    await waitFor(() => {
      expect(schoolProfileService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Académie Internationale' })
      );
    });
  });
});
