import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

import { HeroBanner } from '@/components/ui/HeroBanner'
import { StatCard } from '@/components/ui/StatCard'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { LineChart } from '@/components/ui/LineChart'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { EduTrackLogo } from '@/components/ui/EduTrackLogo'
import { DashboardView } from '../components/DashboardView'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, firstName: 'Jean', lastName: 'Dupont', roles: ['ROLE_ADMIN'] },
    hasRole: vi.fn((roles) => {
      const list = Array.isArray(roles) ? roles : [roles]
      return list.some((r) => r === 'ROLE_ADMIN' || r === 'admin')
    }),
  })),
}))

vi.mock('@/hooks/useI18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key) => key,
    language: 'fr',
  })),
}))

vi.mock('../api/statsService', () => ({
  statsService: {
    getAdminStats: vi.fn().mockResolvedValue({
      totalStudents: 1248,
      totalTeachers: 84,
      totalStaff: 32,
      totalDepartments: 12,
      totalApplications: 16,
      applicationsList: [],
      recentEvents: [],
      attendanceRate: 95.8,
    }),
    getTeacherStats: vi.fn().mockResolvedValue({
      totalClasses: 4,
      totalStudents: 142,
      totalExams: 6,
      upcomingExams: [],
      events: [],
      attendanceRate: 96.2,
    }),
    getStudentStats: vi.fn().mockResolvedValue({
      generalAverage: 15.4,
      termTitle: 'Semestre 1',
      pendingHomework: 3,
      submissionCount: 8,
      events: [],
      attendanceRate: 98.0,
    }),
    getParentStats: vi.fn().mockResolvedValue({
      children: [
        { id: 101, firstName: 'Thomas', lastName: 'Dupont', grade: 'Seconde A', average: 15.8, attendance: 97 },
      ],
      unpaidInvoices: 0,
      unpaidAmount: 0,
      events: [],
    }),
    getStaffStats: vi.fn().mockResolvedValue({
      totalApplications: 24,
      pendingApplications: 8,
      acceptedApplications: 14,
      recentApplications: [],
      totalStudents: 1248,
      recentStudents: [],
      unpaidInvoicesCount: 14,
      paidInvoicesCount: 186,
      totalUnpaidAmount: 14200,
      totalPaidAmount: 186000,
      recentEvents: [],
    }),
    getLibrarianStats: vi.fn().mockResolvedValue({
      totalBooks: 3450,
      activeLoans: 128,
      overdueLoans: 14,
      availableBooks: 3322,
    }),
  },
}))

describe('Dashboard and Figma Components', () => {
  let container = null
  let root = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    container = null
  })

  describe('HeroBanner', () => {
    it('renders title, description and triggers button click', () => {
      let clicked = false
      act(() => {
        root.render(
          <HeroBanner
            title="Bonjour Directeur"
            description="Bonne journée de rentrée"
            buttonText="Gérer"
            onButtonClick={() => { clicked = true }}
          />
        )
      })

      expect(container.textContent).toContain('Bonjour Directeur')
      expect(container.textContent).toContain('Bonne journée de rentrée')
      const btn = container.querySelector('button')
      expect(btn).not.toBeNull()
      act(() => {
        btn.click()
      })
      expect(clicked).toBe(true)
    })
  })

  describe('StatCard', () => {
    it('renders value and title', () => {
      act(() => {
        root.render(
          <StatCard
            title="Total Élèves"
            value="1 248"
            subtitle="+12 ce mois"
            progress={88}
          />
        )
      })

      expect(container.textContent).toContain('1 248')
      expect(container.textContent).toContain('Total Élèves')
      expect(container.textContent).toContain('88%')
    })
  })

  describe('CircularProgress', () => {
    it('renders SVG progress indicator with custom label', () => {
      act(() => {
        root.render(<CircularProgress value={75} label="75%" />)
      })

      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(container.textContent).toContain('75%')
    })
  })

  describe('LineChart', () => {
    it('renders SVG chart for numerical data', () => {
      const data = [
        { month: 'Sep', rate: 92 },
        { month: 'Oct', rate: 95 },
      ]
      act(() => {
        root.render(<LineChart data={data} dataKey="rate" labelKey="month" />)
      })

      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(container.textContent).toContain('Sep')
      expect(container.textContent).toContain('Oct')
    })
  })

  describe('MiniCalendar', () => {
    it('renders 7 days of the week header and day numbers', () => {
      act(() => {
        root.render(<MiniCalendar onSelectDate={() => {}} />)
      })

      expect(container.textContent).toContain('MON')
      expect(container.textContent).toContain('SUN')
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(10)
    })
  })

  describe('EduTrackLogo', () => {
    it('renders EduTrack brand name and SVG icon', () => {
      act(() => {
        root.render(<EduTrackLogo size="md" />)
      })

      expect(container.textContent).toContain('EduTrack')
      expect(container.querySelector('svg')).not.toBeNull()
    })
  })

  describe('DashboardView', () => {
    it('renders admin dashboard and allows role preview switching', async () => {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <DashboardView />
          </MemoryRouter>
        )
      })

      expect(container.textContent).toContain("Vue d'ensemble de l'établissement")
      expect(container.textContent).toContain("Aperçu Rôle")

      // Find teacher role preview button
      const buttons = Array.from(container.querySelectorAll('button'))
      const teacherBtn = buttons.find((b) => b.textContent.includes('Enseignant'))
      expect(teacherBtn).toBeDefined()

      await act(async () => {
        teacherBtn.click()
      })

      expect(container.textContent).toContain('Emploi du Temps Hebdomadaire')
    })
  })
})
