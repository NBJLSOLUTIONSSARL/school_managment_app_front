import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth'
import { EventList } from '../EventList'
import { eventService } from '../../api/eventService'

vi.mock('../../api/eventService', () => ({
  eventService: {
    getEvents: vi.fn(),
    deleteEvent: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
  },
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}))

const sampleEvents = [
  {
    id: 1,
    title: 'Conseil de classe T1',
    location: 'Salle 102',
    startAt: '2026-11-20T14:00:00',
    endAt: '2026-11-20T16:00:00',
    description: 'Bilan pédagogique du premier trimestre.',
    organizerId: 2,
  },
  {
    id: 2,
    title: 'Fête de fin d’année',
    location: 'Cour principale',
    startAt: '2026-12-18T18:00:00',
    endAt: '2026-12-18T22:00:00',
    description: 'Spectacle des élèves et buffet.',
    organizerId: 1,
  },
]

function renderComponent({ roles = ['ROLE_ADMIN'] } = {}) {
  const authValue = {
    user: { id: 1, email: 'admin@edutrack.fr', roles },
    isAuthenticated: true,
    isLoading: false,
    hasRole: vi.fn((checkRoles) => {
      const arr = Array.isArray(checkRoles) ? checkRoles : [checkRoles]
      return arr.some((r) => roles.includes(r))
    }),
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('EventList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders events in list view with columns and details', async () => {
    eventService.getEvents.mockResolvedValue({
      success: true,
      data: {
        items: sampleEvents,
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_ADMIN'] })

    await waitFor(() => {
      expect(screen.getByText('Conseil de classe T1')).toBeInTheDocument()
      expect(screen.getByText('Fête de fin d’année')).toBeInTheDocument()
      expect(screen.getByText('Salle 102')).toBeInTheDocument()
    })
  })

  it('switches between List and Calendar view, requesting expanded page size for calendar', async () => {
    eventService.getEvents.mockResolvedValue({
      success: true,
      data: {
        items: sampleEvents,
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_TEACHER'] })

    await waitFor(() => {
      expect(screen.getByText('Conseil de classe T1')).toBeInTheDocument()
    })

    // Initial list call had size: 20
    expect(eventService.getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ size: 20 })
    )

    // Switch to Calendar
    const calendarTabBtn = screen.getByRole('button', { name: /calendrier/i })
    fireEvent.click(calendarTabBtn)

    await waitFor(() => {
      // Calendar view requested size 100 to show full month
      expect(eventService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({ size: 100 })
      )
    })

    // Switch back to List
    const listTabBtn = screen.getByRole('button', { name: /liste/i })
    fireEvent.click(listTabBtn)

    await waitFor(() => {
      expect(screen.getByText('Conseil de classe T1')).toBeInTheDocument()
    })
  })

  it('filters events by fromDate and toDate and clears filters', async () => {
    eventService.getEvents.mockResolvedValue({
      success: true,
      data: {
        items: [sampleEvents[0]],
        totalItems: 1,
        totalPages: 1,
      },
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Conseil de classe T1')).toBeInTheDocument()
    })

    const dateInputs = screen.getAllByDisplayValue('')
    const fromInput = dateInputs[0]
    fireEvent.change(fromInput, { target: { value: '2026-11-01' } })

    await waitFor(() => {
      expect(eventService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({ from: '2026-11-01T00:00:00' })
      )
    })

    // Clear dates button appears
    const clearBtn = screen.getByRole('button', { name: /effacer dates/i })
    fireEvent.click(clearBtn)

    await waitFor(() => {
      expect(eventService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({ from: undefined, to: undefined })
      )
    })
  })

  it('restricts management actions for non-admin users (ROLE_STUDENT)', async () => {
    eventService.getEvents.mockResolvedValue({
      success: true,
      data: {
        items: sampleEvents,
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_STUDENT'] })

    await waitFor(() => {
      expect(screen.getByText('Conseil de classe T1')).toBeInTheDocument()
    })

    // Should NOT see admin actions
    expect(screen.queryByRole('button', { name: /nouvel événement/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /modifier/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument()

    // Can still view details
    const viewButtons = screen.getAllByRole('button', { name: /voir/i })
    expect(viewButtons.length).toBeGreaterThan(0)
  })

  it('opens details modal when clicking event title', async () => {
    eventService.getEvents.mockResolvedValue({
      success: true,
      data: {
        items: sampleEvents,
        totalItems: 2,
        totalPages: 1,
      },
    })

    renderComponent({ roles: ['ROLE_TEACHER'] })

    await waitFor(() => {
      expect(screen.getByText('Conseil de classe T1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Conseil de classe T1'))

    await waitFor(() => {
      expect(screen.getByText('Bilan pédagogique du premier trimestre.')).toBeInTheDocument()
      expect(screen.getByText('Organisateur ID : #2')).toBeInTheDocument()
    })
  })
})
