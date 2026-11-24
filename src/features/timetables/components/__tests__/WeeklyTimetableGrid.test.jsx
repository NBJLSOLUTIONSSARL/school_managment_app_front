import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WeeklyTimetableGrid } from '../WeeklyTimetableGrid'

describe('WeeklyTimetableGrid', () => {
  const sampleSlots = [
    {
      id: 1,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:00',
      subject: 'Mathématiques',
      teacherName: 'Claire Martin',
      classroomName: 'Salle 101',
      colorKey: 'blue',
    },
    {
      id: 2,
      dayOfWeek: 'Mardi',
      startTime: '10:00',
      endTime: '11:00',
      subject: '[ANNULÉ] Français',
      teacherName: 'Thomas Bernard',
      classroomName: 'Salle 102',
      colorKey: 'peach',
    },
  ]

  it('renders days columns and time slots', () => {
    render(<WeeklyTimetableGrid slots={sampleSlots} />)

    expect(screen.getByText('Lundi')).toBeInTheDocument()
    expect(screen.getByText('Mardi')).toBeInTheDocument()
    expect(screen.getByText('Vendredi')).toBeInTheDocument()
    expect(screen.queryByText('Samedi')).not.toBeInTheDocument()

    expect(screen.getByText('Mathématiques')).toBeInTheDocument()
    expect(screen.getByText('Claire Martin')).toBeInTheDocument()
    expect(screen.getByText('Salle 101')).toBeInTheDocument()
  })

  it('renders Saturday column when includeSaturday is true', () => {
    render(<WeeklyTimetableGrid slots={[]} includeSaturday />)
    expect(screen.getByText('Samedi')).toBeInTheDocument()
  })

  it('triggers onSlotClick when a slot is clicked', () => {
    const handleSlotClick = vi.fn()
    render(<WeeklyTimetableGrid slots={sampleSlots} onSlotClick={handleSlotClick} canEdit />)

    fireEvent.click(screen.getByText('Mathématiques'))
    expect(handleSlotClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1, subject: 'Mathématiques' }))
  })

  it('triggers onCellClick when an empty cell is clicked with canEdit', () => {
    const handleCellClick = vi.fn()
    render(<WeeklyTimetableGrid slots={[]} onCellClick={handleCellClick} canEdit />)

    const addButtons = screen.getAllByText('+ Ajouter')
    expect(addButtons.length).toBeGreaterThan(0)
    fireEvent.click(addButtons[0])

    expect(handleCellClick).toHaveBeenCalled()
  })
})
