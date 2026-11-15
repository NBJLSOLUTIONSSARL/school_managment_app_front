import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdmissionInterviewModal } from '../AdmissionInterviewModal'

const mockService = vi.hoisted(() => ({
  getInterviews: vi.fn(),
  scheduleInterview: vi.fn(),
  recordInterviewResult: vi.fn(),
}))

vi.mock('../../api/admissionWave7Service', () => ({
  admissionWave7Service: mockService,
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

describe('AdmissionInterviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockService.getInterviews.mockResolvedValue({
      success: true,
      data: [],
    })
  })

  it('renders interview list and schedules a new interview session', async () => {
    mockService.scheduleInterview.mockResolvedValueOnce({
      success: true,
      data: { id: 99, interviewType: 'INTERVIEW', interviewerName: 'Prof. Xavier' },
    })

    const onClose = vi.fn()

    render(
      <AdmissionInterviewModal
        isOpen={true}
        onClose={onClose}
        applicationId={42}
        candidateName="Sophie Martin"
      />
    )

    expect(screen.getByText(/Entretiens & Tests d'Admission/i)).toBeInTheDocument()
    expect(screen.getByText(/Sophie Martin/i)).toBeInTheDocument()

    // Open schedule form
    const planBtn = screen.getByRole('button', { name: /Planifier une session/i })
    fireEvent.click(planBtn)

    expect(screen.getByText(/Planifier un entretien ou test/i)).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/ex: M. Dupont/i), {
      target: { value: 'Prof. Xavier' },
    })
    // DateTime input
    const dateInput = document.querySelector('input[type="datetime-local"]')
    fireEvent.change(dateInput, { target: { value: '2026-11-20T14:30' } })

    const confirmBtn = screen.getByRole('button', { name: /Confirmer/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockService.scheduleInterview).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          interviewerName: 'Prof. Xavier',
          interviewDate: '2026-11-20T14:30',
          interviewType: 'INTERVIEW',
        })
      )
    })
  })

  it('records score and grade for an existing interview', async () => {
    const existingInterview = {
      id: 99,
      interviewType: 'WRITTEN_TEST',
      interviewDate: '2026-11-20T10:00:00',
      interviewerName: 'Prof. Xavier',
      maxScore: 20,
      score: null,
      status: 'SCHEDULED',
      comments: 'Entrance math test',
    }

    mockService.getInterviews.mockResolvedValue({
      success: true,
      data: [existingInterview],
    })
    mockService.recordInterviewResult.mockResolvedValueOnce({
      success: true,
      data: { id: 99, score: 17, status: 'COMPLETED' },
    })

    render(
      <AdmissionInterviewModal
        isOpen={true}
        onClose={vi.fn()}
        applicationId={42}
        candidateName="Sophie Martin"
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Prof. Xavier/i)).toBeInTheDocument()
      expect(screen.getByText(/Épreuve écrite/i)).toBeInTheDocument()
    })

    // Click grade button (it has text "Noter")
    const gradeBtn = screen.getByRole('button', { name: /Noter/i })
    fireEvent.click(gradeBtn)

    expect(screen.getByText(/Saisir les résultats pour la session/i)).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/ex: 16.5/i), {
      target: { value: '17' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Commentaires sur la prestation/i), {
      target: { value: 'Très bonne copie' },
    })

    const saveBtn = screen.getByRole('button', { name: /Valider la note/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockService.recordInterviewResult).toHaveBeenCalledWith(
        99,
        expect.objectContaining({
          score: 17,
          comments: 'Très bonne copie',
          status: 'COMPLETED',
        })
      )
    })
  })
})
