import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AttendanceStatsCard } from '../AttendanceStatsCard'

describe('AttendanceStatsCard', () => {
  const mockStats = {
    attendanceRate: 92.5,
    presentCount: 25,
    lateCount: 3,
    absentCount: 1,
    unexcusedCount: 1,
    excusedCount: 4,
    unexcusedAlertTriggered: false,
  }

  it('renders title and attendance rate percentage', () => {
    render(<AttendanceStatsCard stats={mockStats} title="Bilan Classe 1A" />)

    expect(screen.getByText('Bilan Classe 1A')).toBeInTheDocument()
    expect(screen.getByText('92.5%')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('displays warning alert when unexcusedAlertTriggered is true', () => {
    const alertStats = {
      ...mockStats,
      attendanceRate: 68.0,
      unexcusedAlertTriggered: true,
    }

    render(<AttendanceStatsCard stats={alertStats} />)

    expect(
      screen.getByText(/Seuil critique d'absences non justifiées dépassé/i)
    ).toBeInTheDocument()
  })
})
