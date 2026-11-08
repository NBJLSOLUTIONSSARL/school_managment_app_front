import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { GraduationCap } from 'lucide-react'
import {
  StatCard,
  ExamResultsWaveChart,
  RadialDistributionCard,
  StarStudentsCard,
  RecentActivityFeedCard,
} from '@/components/ui'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Dashboard Redesign Components', () => {
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

  describe('StatCard Pastel Variants', () => {
    it('renders pastel purple variant matching reference design', () => {
      act(() => {
        root.render(
          <StatCard
            variant="purple"
            title="Students"
            value="15.00K"
            icon={GraduationCap}
          />
        )
      })

      expect(container.textContent).toContain('Students')
      expect(container.textContent).toContain('15.00K')
      expect(container.querySelector('svg')).not.toBeNull()
    })

    it('renders pastel blue, orange, and green variants correctly', () => {
      act(() => {
        root.render(
          <div>
            <StatCard variant="blue" title="Teachers" value="2.00K" />
            <StatCard variant="orange" title="Parents" value="5.6K" />
            <StatCard variant="green" title="Earnings" value="$19.3K" />
          </div>
        )
      })

      expect(container.textContent).toContain('Teachers')
      expect(container.textContent).toContain('2.00K')
      expect(container.textContent).toContain('Parents')
      expect(container.textContent).toContain('5.6K')
      expect(container.textContent).toContain('Earnings')
      expect(container.textContent).toContain('$19.3K')
    })
  })

  describe('ExamResultsWaveChart', () => {
    it('renders wave chart with dual curves and legend', () => {
      act(() => {
        root.render(<ExamResultsWaveChart title="All Exam Results" />)
      })

      expect(container.textContent).toContain('All Exam Results')
      expect(container.textContent).toContain('Teacher')
      expect(container.textContent).toContain('Students')
      expect(container.textContent).toContain('Monthly')
      expect(container.textContent).toContain('Mon')
      expect(container.textContent).toContain('Sun')

      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('RadialDistributionCard', () => {
    it('renders radial concentric rings with total value in center', () => {
      act(() => {
        root.render(
          <RadialDistributionCard
            title="Students"
            totalLabel="Total"
            totalValue="15000"
            outerLabel="Male"
            innerLabel="Female"
          />
        )
      })

      expect(container.textContent).toContain('Students')
      expect(container.textContent).toContain('Total')
      expect(container.textContent).toContain('15000')
      expect(container.textContent).toContain('Male')
      expect(container.textContent).toContain('Female')

      const chartSvg = container.querySelector('svg.transform')
      expect(chartSvg).not.toBeNull()
      const circles = chartSvg.querySelectorAll('circle')
      expect(circles.length).toBe(4) // 2 tracks + 2 progress rings
    })
  })

  describe('StarStudentsCard', () => {
    it('renders student table and handles selection', () => {
      act(() => {
        root.render(<StarStudentsCard title="Star Students" />)
      })

      expect(container.textContent).toContain('Star Students')
      expect(container.textContent).toContain('Evelyn Harper')
      expect(container.textContent).toContain('Diana Plenty')
      expect(container.textContent).toContain('PRE43178')
      expect(container.textContent).toContain('98%')

      const checkboxes = container.querySelectorAll('button[aria-label^="Select"]')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Toggle first student checkbox
      act(() => {
        checkboxes[1]?.click()
      })
    })
  })

  describe('RecentActivityFeedCard', () => {
    it('renders activity feed items with badges and timestamps', () => {
      act(() => {
        root.render(<RecentActivityFeedCard title="All Exam Results" />)
      })

      expect(container.textContent).toContain('All Exam Results')
      expect(container.textContent).toContain('New Teacher')
      expect(container.textContent).toContain('Fees Structure')
      expect(container.textContent).toContain('New Course')
      expect(container.textContent).toContain('Just now')
      expect(container.textContent).toContain('Today')
      expect(container.textContent).toContain('24 Sep 2023')
    })
  })
})
