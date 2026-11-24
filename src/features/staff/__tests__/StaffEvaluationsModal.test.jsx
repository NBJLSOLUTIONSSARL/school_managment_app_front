import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffEvaluationsModal } from '../components/StaffEvaluationsModal';
import { staffEvaluationService } from '../api/staffEvaluationService';

vi.mock('../api/staffEvaluationService', () => ({
  staffEvaluationService: {
    getByStaff: vi.fn(),
    create: vi.fn(),
  },
}));

describe('StaffEvaluationsModal', () => {
  const mockStaff = {
    id: 1,
    position: 'Professeur Principal',
    user: { firstName: 'Claire', lastName: 'Martin' },
    department: { name: 'Sciences' },
  };

  const mockEvaluations = [
    {
      id: 1,
      period: '2026-T1',
      evaluationDate: '2026-10-15',
      overallRating: 5,
      strengths: 'Rigueur et dynamisme',
      evaluatorName: 'Directeur',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders staff evaluations list', async () => {
    staffEvaluationService.getByStaff.mockResolvedValueOnce(mockEvaluations);

    render(<StaffEvaluationsModal isOpen={true} onClose={() => {}} staff={mockStaff} />);

    await waitFor(() => {
      expect(screen.getByText('Évaluations de Performance — Claire Martin')).toBeInTheDocument();
    });

    expect(screen.getByText('2026-T1')).toBeInTheDocument();
    expect(screen.getByText('Note : 5/5')).toBeInTheDocument();
    expect(screen.getByText('Rigueur et dynamisme')).toBeInTheDocument();
  });

  it('creates a new staff evaluation', async () => {
    staffEvaluationService.getByStaff.mockResolvedValue(mockEvaluations);
    staffEvaluationService.create.mockResolvedValueOnce({ id: 2 });

    render(<StaffEvaluationsModal isOpen={true} onClose={() => {}} staff={mockStaff} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Points forts observés...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Points forts observés...'), {
      target: { value: 'Excellente gestion de classe' },
    });

    fireEvent.click(screen.getByText("+ Enregistrer l'Évaluation"));

    await waitFor(() => {
      expect(staffEvaluationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          staffId: 1,
          strengths: 'Excellente gestion de classe',
        })
      );
    });
  });
});
