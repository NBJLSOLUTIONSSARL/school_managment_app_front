import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsAnalyticsView } from '../components/ReportsAnalyticsView';
import { reportService } from '../api/reportService';

vi.mock('../api/reportService', () => ({
  reportService: {
    getEnrollmentReport: vi.fn(),
    getAttendanceReport: vi.fn(),
    getAcademicReport: vi.fn(),
    getFinanceReport: vi.fn(),
    getStaffReport: vi.fn(),
    exportReport: vi.fn(),
  },
}));

describe('ReportsAnalyticsView', () => {
  const mockEnrollment = {
    totalEnrolled: 420,
    activeStudents: 410,
    inactiveStudents: 5,
    graduatedStudents: 5,
  };

  const mockAttendance = {
    totalRecords: 1200,
    presentCount: 1100,
    absentCount: 50,
    lateCount: 30,
    excusedCount: 20,
    overallAssiduityRate: 95.8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders enrollment report by default', async () => {
    reportService.getEnrollmentReport.mockResolvedValueOnce(mockEnrollment);

    render(<ReportsAnalyticsView />);

    await waitFor(() => {
      expect(screen.getByText('Moteur de Rapports & Analyses Multi-Critères (Spec 4.16)')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Élèves')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('410')).toBeInTheDocument();
  });

  it('switches to attendance report tab', async () => {
    reportService.getEnrollmentReport.mockResolvedValueOnce(mockEnrollment);
    reportService.getAttendanceReport.mockResolvedValueOnce(mockAttendance);

    render(<ReportsAnalyticsView />);

    await waitFor(() => {
      expect(screen.getByText('Effectifs & Inscriptions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Assiduité & Présences'));

    await waitFor(() => {
      expect(reportService.getAttendanceReport).toHaveBeenCalled();
      expect(screen.getByText("Taux d'Assiduité")).toBeInTheDocument();
      expect(screen.getByText('95.8%')).toBeInTheDocument();
    });
  });
});
