import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import {
  FigmaRevenueCard,
  FigmaOrderTimeCard,
  FigmaRatingCard,
  FigmaTopListCard,
  FigmaProgressionCard,
} from '@/components/ui'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Figma Community Dashboard Components', () => {
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

  describe('FigmaRevenueCard', () => {
    it('renders revenue metric, dual bars, and triggers onViewReport', () => {
      let reportClicked = false
      act(() => {
        root.render(
          <FigmaRevenueCard
            title="Revenue"
            value="IDR 7.852.000"
            change="+ 2.1% vs last week"
            dateRange="Select from 1-12 Dec, 2026"
            onViewReport={() => {
              reportClicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('Revenue')
      expect(container.textContent).toContain('IDR 7.852.000')
      expect(container.textContent).toContain('+ 2.1% vs last week')
      expect(container.textContent).toContain('Select from 1-12 Dec, 2026')
      expect(container.textContent).toContain('Last 6 days')
      expect(container.textContent).toContain('Last Week')

      // Check bar labels 01 and 12
      expect(container.textContent).toContain('01')
      expect(container.textContent).toContain('12')

      const viewReportBtn = container.querySelector('button')
      expect(viewReportBtn).not.toBeNull()
      act(() => {
        viewReportBtn.click()
      })
      expect(reportClicked).toBe(true)
    })
  })

  describe('FigmaOrderTimeCard', () => {
    it('renders donut chart with floating callout tooltip and legend', () => {
      let reportClicked = false
      act(() => {
        root.render(
          <FigmaOrderTimeCard
            title="Order Time"
            dateRange="From 1-6 Dec, 2026"
            onViewReport={() => {
              reportClicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('Order Time')
      expect(container.textContent).toContain('From 1-6 Dec, 2026')
      expect(container.textContent).toContain('Afternoon')
      expect(container.textContent).toContain('1,890 orders')
      expect(container.textContent).toContain('40%')
      expect(container.textContent).toContain('Evening')
      expect(container.textContent).toContain('32%')
      expect(container.textContent).toContain('Morning')
      expect(container.textContent).toContain('28%')

      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()

      const viewReportBtn = container.querySelector('button')
      expect(viewReportBtn).not.toBeNull()
      act(() => {
        viewReportBtn.click()
      })
      expect(reportClicked).toBe(true)
    })
  })

  describe('FigmaRatingCard', () => {
    it('renders 3 overlapping percentage bubbles', () => {
      act(() => {
        root.render(
          <FigmaRatingCard
            title="Your Rating"
            subtitle="Taux de satisfaction global"
            ratings={[
              { label: 'Hygiene', percent: '85%', color: 'purple' },
              { label: 'Food Taste', percent: '85%', color: 'orange' },
              { label: 'Packaging', percent: '92%', color: 'cyan' },
            ]}
          />
        )
      })

      expect(container.textContent).toContain('Your Rating')
      expect(container.textContent).toContain('Taux de satisfaction global')
      expect(container.textContent).toContain('Hygiene')
      expect(container.textContent).toContain('Food Taste')
      expect(container.textContent).toContain('Packaging')
      expect(container.textContent).toContain('92%')
      expect(container.textContent).toContain('4.8 / 5.0')
    })
  })

  describe('FigmaTopListCard', () => {
    it('renders list items with names, categories and prices', () => {
      act(() => {
        root.render(
          <FigmaTopListCard
            title="Most Ordered Food"
            subtitle="Adipiscing elit, sed do eiusmod"
          />
        )
      })

      expect(container.textContent).toContain('Most Ordered Food')
      expect(container.textContent).toContain('Fresh Salad Bowl')
      expect(container.textContent).toContain('Chicken Noodles')
      expect(container.textContent).toContain('Smoothie Fruits')
      expect(container.textContent).toContain('Hot Chicken Wings')
      expect(container.textContent).toContain('IDR 45.000')
      expect(container.textContent).toContain('IDR 75.000')
    })
  })

  describe('FigmaProgressionCard', () => {
    it('renders order count, spline wave, and change badge', () => {
      let reportClicked = false
      act(() => {
        root.render(
          <FigmaProgressionCard
            title="Order"
            value="2.568"
            change="- 2.1% vs last week"
            dateRange="Sales from 1-6 Dec, 2026"
            onViewReport={() => {
              reportClicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('Order')
      expect(container.textContent).toContain('2.568')
      expect(container.textContent).toContain('- 2.1% vs last week')
      expect(container.textContent).toContain('Sales from 1-6 Dec, 2026')
      expect(container.textContent).toContain('Last 6 days')
      expect(container.textContent).toContain('Last Week')

      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      const path = container.querySelector('path')
      expect(path).not.toBeNull()

      const viewReportBtn = container.querySelector('button')
      expect(viewReportBtn).not.toBeNull()
      act(() => {
        viewReportBtn.click()
      })
      expect(reportClicked).toBe(true)
    })
  })
})
