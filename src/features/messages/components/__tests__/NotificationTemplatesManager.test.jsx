import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationTemplatesManager } from '../NotificationTemplatesManager'

const mockService = vi.hoisted(() => ({
  getTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}))

vi.mock('../../api/meetingsAndTemplatesService', () => ({
  meetingsAndTemplatesService: mockService,
  default: mockService,
}))

describe('NotificationTemplatesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders templates list and allows filtering and creating', async () => {
    mockService.getTemplates.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 1,
          code: 'ADMISSION_ACCEPTED',
          name: 'Admission Acceptance Letter',
          channel: 'EMAIL',
          subject: 'Admission Confirmation for {{student_name}}',
          body: 'Congratulations!',
          active: true,
        },
        {
          id: 2,
          code: 'HOMEWORK_REMINDER',
          name: 'Homework Due Tomorrow',
          channel: 'SMS',
          subject: 'Reminder',
          body: 'Homework due tomorrow',
          active: false,
        },
      ],
    })

    mockService.createTemplate.mockResolvedValueOnce({
      success: true,
      data: {
        id: 3,
        code: 'MEETING_CONFIRMED',
        name: 'Meeting Confirmation',
        channel: 'IN_APP',
        subject: 'Meeting Scheduled',
        body: 'Your meeting is booked',
        active: true,
      },
    })

    render(<NotificationTemplatesManager />)

    await waitFor(() => {
      expect(screen.getByText('ADMISSION_ACCEPTED')).toBeInTheDocument()
      expect(screen.getByText('HOMEWORK_REMINDER')).toBeInTheDocument()
    })

    // Click "New Template"
    fireEvent.click(screen.getByRole('button', { name: /New Template/i }))
    expect(screen.getByText('Create Notification Template')).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/e.g. ADMISSION_OFFER/i), {
      target: { value: 'MEETING_CONFIRMED' },
    })
    fireEvent.change(screen.getByPlaceholderText(/e.g. Admission Acceptance Notification/i), {
      target: { value: 'Meeting Confirmation' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Template text with placeholders/i), {
      target: { value: 'Your meeting is booked' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Create Template/i }))

    await waitFor(() => {
      expect(mockService.createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'MEETING_CONFIRMED',
          name: 'Meeting Confirmation',
        })
      )
    })
  })
})
