import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClubsActivitiesView from '../ClubsActivitiesView';
import { addonService } from '../../api/addonService';

vi.mock('../../api/addonService', () => ({
  addonService: {
    getClubs: vi.fn(),
    createClub: vi.fn(),
    deleteClub: vi.fn(),
    getClubMembers: vi.fn(),
    enrollStudent: vi.fn(),
    updateEnrollmentStatus: vi.fn(),
  },
}));

describe('ClubsActivitiesView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addonService.getClubs.mockResolvedValue([
      {
        id: 1,
        name: 'Club Robotique & IA',
        description: 'Conception de robots et initiation à Python',
        category: 'ROBOTICS',
        schedule: 'Mercredi 14h00 - 16h00',
        roomLocation: 'FabLab Sciences',
        maxCapacity: 15,
        currentEnrollmentCount: 12,
        supervisorTeacherName: 'M. Turing',
      },
    ]);
    addonService.getClubMembers.mockResolvedValue([
      {
        id: 50,
        clubId: 1,
        studentId: 3,
        studentName: 'Omar Benjelloun',
        status: 'APPROVED',
        enrolledAt: '2026-11-05T14:00',
      },
    ]);
  });

  it('renders clubs list with capacity bar and details', async () => {
    render(<ClubsActivitiesView />);

    await waitFor(() => {
      expect(screen.getByText('Club Robotique & IA')).toBeInTheDocument();
      expect(screen.getByText('Conception de robots et initiation à Python')).toBeInTheDocument();
      expect(screen.getAllByText('Robotique & Coding')[0]).toBeInTheDocument();
      expect(screen.getByText('Inscrits : 12 / 15')).toBeInTheDocument();
      expect(screen.getByText('FabLab Sciences')).toBeInTheDocument();
      expect(screen.getByText('Resp: M. Turing')).toBeInTheDocument();
    });
  });

  it('clicks a club card and loads its members in the side panel', async () => {
    render(<ClubsActivitiesView />);

    await waitFor(() => {
      expect(screen.getByText('Club Robotique & IA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Club Robotique & IA'));

    await waitFor(() => {
      expect(addonService.getClubMembers).toHaveBeenCalledWith(1);
      expect(screen.getByText('Omar Benjelloun')).toBeInTheDocument();
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });
  });
});
