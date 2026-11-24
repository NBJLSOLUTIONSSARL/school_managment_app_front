import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import {
  WhiteThemeKpiCards,
  RevenueAssistedLineChartCard,
  TeamUtilizationBarChartCard,
  ProjectHealthSegmentedCard,
  UpcomingMeetingsCards,
  CompanyDetailsTableCard,
  WhiteThemeDashboardHeader,
  SpecialOfferCard,
} from '@/components/ui'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('White Theme Dashboard Components', () => {
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

  describe('WhiteThemeKpiCards', () => {
    it('renders all 6 signature KPI cards with values, labels and badges', () => {
      let clickedCard = null
      act(() => {
        root.render(
          <WhiteThemeKpiCards
            onCardClick={(card) => {
              clickedCard = card
            }}
          />
        )
      })

      expect(container.textContent).toContain('$842,310')
      expect(container.textContent).toContain('Revenue')
      expect(container.textContent).toContain('+12.4%')

      expect(container.textContent).toContain('47')
      expect(container.textContent).toContain('Active Projects')
      expect(container.textContent).toContain('+6')

      expect(container.textContent).toContain('312')
      expect(container.textContent).toContain('Open Tasks')
      expect(container.textContent).toContain('-18')

      expect(container.textContent).toContain('28')
      expect(container.textContent).toContain('Meetings')
      expect(container.textContent).toContain('This Week')

      expect(container.textContent).toContain('94%')
      expect(container.textContent).toContain('Client Health')
      expect(container.textContent).toContain('+2.1%')

      expect(container.textContent).toContain('8.7x')
      expect(container.textContent).toContain('Ai Productivity')
      expect(container.textContent).toContain('Vs Baseline')

      // Click card
      const firstCard = container.querySelector('.group')
      expect(firstCard).not.toBeNull()
      act(() => {
        firstCard.click()
      })
      expect(clickedCard).not.toBeNull()
      expect(clickedCard.id).toBe('revenue')
    })
  })

  describe('RevenueAssistedLineChartCard', () => {
    it('renders wave line chart with dual curves, legend, and April tooltip', () => {
      act(() => {
        root.render(<RevenueAssistedLineChartCard pinnedMonthIndex={3} />)
      })

      expect(container.textContent).toContain('REVENUE & AI-ASSISTED REVENUE')
      expect(container.textContent).toContain('Revenue')
      expect(container.textContent).toContain('AI')

      // Check months on X axis
      expect(container.textContent).toContain('Jan')
      expect(container.textContent).toContain('Apr')
      expect(container.textContent).toContain('Dec')

      // Check April tooltip
      expect(container.textContent).toContain('April')
      expect(container.textContent).toContain('V:')
      expect(container.textContent).toContain('65')
      expect(container.textContent).toContain('AI:')
      expect(container.textContent).toContain('20')

      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('TeamUtilizationBarChartCard', () => {
    it('renders bars for 7 days, period selector, and Friday highlighted badge', () => {
      act(() => {
        root.render(<TeamUtilizationBarChartCard initialPeriod="Last Week" />)
      })

      expect(container.textContent).toContain('TEAM UTILIZATION')
      expect(container.textContent).toContain('Last Week')
      expect(container.textContent).toContain('Mon')
      expect(container.textContent).toContain('Fri')
      expect(container.textContent).toContain('Sun')

      // Check Fri-75 badge
      expect(container.textContent).toContain('Fri-75')

      // Check clicking dropdown opens options
      const periodBtn = container.querySelector('button')
      expect(periodBtn).not.toBeNull()
      act(() => {
        periodBtn.click()
      })
      expect(container.textContent).toContain('This Week')
      expect(container.textContent).toContain('Last Month')
    })
  })

  describe('ProjectHealthSegmentedCard', () => {
    it('renders project list with segmented progress bars and status badges', () => {
      let clickedProject = null
      act(() => {
        root.render(
          <ProjectHealthSegmentedCard
            onProjectClick={(p) => {
              clickedProject = p
            }}
          />
        )
      })

      expect(container.textContent).toContain('PROJECT HEALTH')
      expect(container.textContent).toContain('Atlas Rebrand')
      expect(container.textContent).toContain('Nordwind')
      expect(container.textContent).toContain('82%')
      expect(container.textContent).toContain('On Track')

      expect(container.textContent).toContain('Vertex Mobile App')
      expect(container.textContent).toContain('Helix Labs')
      expect(container.textContent).toContain('54%')
      expect(container.textContent).toContain('At Risk')

      expect(container.textContent).toContain('Quantum Migration')
      expect(container.textContent).toContain('38%')
      expect(container.textContent).toContain('Critical')

      expect(container.textContent).toContain('Solaris Dashboard')
      expect(container.textContent).toContain('96%')

      expect(container.textContent).toContain('Lunar Payment Gateway')
      expect(container.textContent).toContain('67%')

      // Click first project
      const row = container.querySelector('.group')
      expect(row).not.toBeNull()
      act(() => {
        row.click()
      })
      expect(clickedProject).not.toBeNull()
      expect(clickedProject.name).toBe('Atlas Rebrand')
    })
  })

  describe('UpcomingMeetingsCards', () => {
    it('renders stack of tinted meeting cards with times and action buttons', () => {
      let clickedMeeting = null
      let actionClicked = false

      act(() => {
        root.render(
          <UpcomingMeetingsCards
            onMeetingClick={(m) => {
              clickedMeeting = m
            }}
            onActionClick={() => {
              actionClicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('UPCOMING MEETINGS')
      expect(container.textContent).toContain('Q4 Sales Strategy')
      expect(container.textContent).toContain('10:30, Sales Pod')

      expect(container.textContent).toContain('Northwind Sprint Review')
      expect(container.textContent).toContain('10:30, Alas Team')

      expect(container.textContent).toContain('Helix Labs Discovery')
      expect(container.textContent).toContain('15:30, Sarah Chen')

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(5)
      expect(buttons[0].textContent).toContain('All')

      act(() => {
        buttons[0].click()
      })
      expect(actionClicked).toBe(true)

      const card = container.querySelector('.cursor-pointer')
      expect(card).not.toBeNull()
      act(() => {
        card.click()
      })
      expect(clickedMeeting).not.toBeNull()
    })
  })

  describe('CompanyDetailsTableCard', () => {
    it('renders companies table with contacts, revenues, project counts, health bars and tiers', () => {
      let clickedRow = null
      act(() => {
        root.render(
          <CompanyDetailsTableCard
            onRowClick={(c) => {
              clickedRow = c
            }}
          />
        )
      })

      expect(container.textContent).toContain('COMPANY DETAILS')
      expect(container.textContent).toContain('Company')
      expect(container.textContent).toContain('Primary Contact')
      expect(container.textContent).toContain('Revenue')
      expect(container.textContent).toContain('Projects')
      expect(container.textContent).toContain('Health')
      expect(container.textContent).toContain('Tier')

      expect(container.textContent).toContain('Northwind Logistics')
      expect(container.textContent).toContain('Sarah Chen')
      expect(container.textContent).toContain('$184K')
      expect(container.textContent).toContain('04')
      expect(container.textContent).toContain('96')
      expect(container.textContent).toContain('Enterprise')

      expect(container.textContent).toContain('Helix Labs')
      expect(container.textContent).toContain('Daniel Park')
      expect(container.textContent).toContain('$92K')
      expect(container.textContent).toContain('Growth')

      expect(container.textContent).toContain('Orion Labs')
      expect(container.textContent).toContain('$248K')

      expect(container.textContent).toContain('Synthesis')
      expect(container.textContent).toContain('Mid-Market')

      expect(container.textContent).toContain('Atlas Group')
      expect(container.textContent).toContain('Yuna Park')

      const tr = container.querySelector('tbody tr')
      expect(tr).not.toBeNull()
      act(() => {
        tr.click()
      })
      expect(clickedRow).not.toBeNull()
      expect(clickedRow.name).toBe('Northwind Logistics')
    })
  })

  describe('WhiteThemeDashboardHeader', () => {
    it('renders greeting, name, waving hand and Ask AI button', () => {
      let askedAi = false
      let searched = false

      act(() => {
        root.render(
          <WhiteThemeDashboardHeader
            name="Alex"
            greeting="Good morning"
            subtitle="Today's workspace updates."
            onAskAi={() => {
              askedAi = true
            }}
            onSearch={() => {
              searched = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('Good morning, Alex')
      expect(container.textContent).toContain("Today's workspace updates.")
      expect(container.textContent).toContain('Ask AI')

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(2)

      // Search button
      act(() => {
        buttons[0].click()
      })
      expect(searched).toBe(true)

      // Ask AI button
      act(() => {
        buttons[1].click()
      })
      expect(askedAi).toBe(true)
    })
  })

  describe('SpecialOfferCard', () => {
    it('renders special offer title, description and triggers claim button', () => {
      let claimed = false
      act(() => {
        root.render(
          <SpecialOfferCard
            title="Special Offer"
            description="Get 20% off for the first 3 month"
            buttonText="Claim Now"
            onClaim={() => {
              claimed = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('Special Offer')
      expect(container.textContent).toContain('Get 20% off for the first 3 month')
      expect(container.textContent).toContain('Claim Now')

      const btn = container.querySelector('button')
      expect(btn).not.toBeNull()
      act(() => {
        btn.click()
      })
      expect(claimed).toBe(true)
    })
  })
})
