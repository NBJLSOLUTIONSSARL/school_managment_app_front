import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ParentTeacherMeetingsView } from '../ParentTeacherMeetingsView'

const mockService = vi.hoisted(() => ({
  createSlot: vi.fn(),
  getTeacherSlots: vi.fn(),
  deleteSlot: vi.fn(),
  bookMeeting: vi.fn(),
  updateBookingStatus: vi.fn(),
  getGuardianBookings: vi.fn(),
  cancelBooking: vi.fn(),
}))

vi.mock('../../api/meetingsAndTemplatesService', () => ({
  meetingsAndTemplatesService: mockService,
  default: mockService,
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}))

describe('ParentTeacherMeetingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders teacher slots mode and allows creating a slot', async () => {
    mockService.getTeacherSlots.mockResolvedValue({
      success: true,
      data: [
        {
          id: 5,
          startTime: '2026-11-20T14:00:00',
          endTime: '2026-11-20T14:30:00',
          roomOrLink: 'Salle 12',
          available: true,
        },
      ],
    })
    mockService.getGuardianBookings.mockResolvedValue({
      success: true,
      data: [],
    })
    mockService.createSlot.mockResolvedValue({
      success: true,
      data: {
        id: 6,
        startTime: '2026-11-21T10:00:00',
        endTime: '2026-11-21T10:30:00',
        roomOrLink: 'Salle 14',
      },
    })

    render(
      <ParentTeacherMeetingsView
        teacherId={12}
        guardianId={1}
        studentId={1}
        isTeacher={true}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Rendez-vous Parents – Professeurs/i)).toBeInTheDocument()
      expect(screen.getByText('Salle 12')).toBeInTheDocument()
    })

    // Click "Ouvrir un créneau"
    const openSlotBtn = screen.getByRole('button', { name: /Ouvrir un créneau/i })
    fireEvent.click(openSlotBtn)

    expect(screen.getByText(/Nouveau créneau de disponibilité/i)).toBeInTheDocument()

    // Fill form
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]')
    fireEvent.change(dateInputs[0], { target: { value: '2026-11-21T10:00' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-11-21T10:30' } })

    fireEvent.click(screen.getByRole('button', { name: /Créer/i }))

    await waitFor(() => {
      expect(mockService.createSlot).toHaveBeenCalledWith(
        expect.objectContaining({
          teacherId: 12,
          startTime: '2026-11-21T10:00',
          endTime: '2026-11-21T10:30',
        })
      )
    })
  })

  it('renders guardian view and shows booked appointments', async () => {
    mockService.getTeacherSlots.mockResolvedValue({
      success: true,
      data: [],
    })
    mockService.getGuardianBookings.mockResolvedValue({
      success: true,
      data: [
        {
          id: 50,
          status: 'CONFIRMED',
          teacherName: 'Mme. Dupont',
          studentName: 'Lucas Dupont',
          startTime: '2026-11-25T15:00:00',
          endTime: '2026-11-25T15:30:00',
          roomOrLink: 'Salle 4A',
        },
      ],
    })

    render(
      <ParentTeacherMeetingsView
        teacherId={12}
        guardianId={99}
        studentId={1}
        isTeacher={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Rendez-vous Parents – Professeurs/i)).toBeInTheDocument()
      expect(screen.getByText('Mme. Dupont')).toBeInTheDocument()
      expect(screen.getByText('Confirmé')).toBeInTheDocument()
    })
  })
})
