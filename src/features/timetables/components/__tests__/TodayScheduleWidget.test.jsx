import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TodayScheduleWidget } from '../TodayScheduleWidget'
import { timetableService } from '../../api/timetableService'

vi.mock('../../api/timetableService', () => ({
  timetableService: {
    getTodaySlots: vi.fn(),
  },
}))

describe('TodayScheduleWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders today classes when returned by API', async () => {
    timetableService.getTodaySlots.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 1,
          startTime: '08:00',
          endTime: '09:00',
          subject: 'Mathématiques',
          teacherName: 'Claire Martin',
          classroomName: 'Salle 101',
          className: '1ère A',
        },
      ],
      error: null,
    })

    render(
      <MemoryRouter>
        <TodayScheduleWidget title="Cours du jour" />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Mathématiques')).toBeInTheDocument()
      expect(screen.getByText('Claire Martin')).toBeInTheDocument()
      expect(screen.getByText('Salle 101')).toBeInTheDocument()
    })
  })

  it('renders empty message when no classes are scheduled today', async () => {
    timetableService.getTodaySlots.mockResolvedValueOnce({
      success: true,
      data: [],
      error: null,
    })

    render(
      <MemoryRouter>
        <TodayScheduleWidget />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Aucun cours prévu aujourd’hui')).toBeInTheDocument()
    })
  })
})
