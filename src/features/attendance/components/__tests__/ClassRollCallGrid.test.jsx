import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ClassRollCallGrid } from '../ClassRollCallGrid'

describe('ClassRollCallGrid', () => {
  const mockStudents = [
    {
      id: 9,
      studentNumber: 'STU2026001',
      user: { firstName: 'Léo', lastName: 'Leroy' },
    },
    {
      id: 10,
      studentNumber: 'STU2026002',
      user: { firstName: 'Emma', lastName: 'Moreau' },
    },
  ]

  it('renders student roster with initial status', () => {
    render(<ClassRollCallGrid students={mockStudents} />)

    expect(screen.getByText('Léo Leroy')).toBeInTheDocument()
    expect(screen.getByText('Emma Moreau')).toBeInTheDocument()
    expect(screen.getByText('STU2026001')).toBeInTheDocument()
    expect(screen.getByText('STU2026002')).toBeInTheDocument()
    expect(screen.getByText('2 Présents')).toBeInTheDocument()
  })

  it('updates student status when clicking quick toggle buttons', async () => {
    render(<ClassRollCallGrid students={mockStudents} />)

    // Mark Emma as Absent (second Absent button)
    const absentButtons = screen.getAllByRole('button', { name: 'Absent' })
    await act(async () => {
      fireEvent.click(absentButtons[1])
    })

    expect(screen.getByText('1 Présents')).toBeInTheDocument()
    expect(screen.getByText('1 Absents')).toBeInTheDocument()
  })

  it('sets all students to PRESENT when clicking Tous présents', async () => {
    render(<ClassRollCallGrid students={mockStudents} />)

    // Mark all absent first
    const absentButtons = screen.getAllByRole('button', { name: 'Absent' })
    await act(async () => {
      fireEvent.click(absentButtons[0])
      fireEvent.click(absentButtons[1])
    })
    expect(screen.getByText('2 Absents')).toBeInTheDocument()

    // Click Tous présents
    const allPresentBtn = screen.getByRole('button', { name: 'Tous présents' })
    await act(async () => {
      fireEvent.click(allPresentBtn)
    })

    expect(screen.getByText('2 Présents')).toBeInTheDocument()
    expect(screen.getByText('0 Absents')).toBeInTheDocument()
  })

  it('calls onSave with updated entries when clicking save button', async () => {
    const handleSave = vi.fn()
    render(<ClassRollCallGrid students={mockStudents} onSave={handleSave} />)

    // Change student 1 to Late
    const lateButtons = screen.getAllByRole('button', { name: 'Retard' })
    await act(async () => {
      fireEvent.click(lateButtons[0])
    })

    const saveButton = screen.getByRole('button', { name: "Enregistrer l'appel" })
    await act(async () => {
      fireEvent.click(saveButton)
    })

    expect(handleSave).toHaveBeenCalledTimes(1)
    const savedEntries = handleSave.mock.calls[0][0]
    expect(savedEntries).toHaveLength(2)
    expect(savedEntries[0].status).toBe('LATE')
    expect(savedEntries[1].status).toBe('PRESENT')
  })
})
