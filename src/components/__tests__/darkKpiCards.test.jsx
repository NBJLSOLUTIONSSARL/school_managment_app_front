import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import {
  KpiExpectedEarningsCard,
  KpiDailySalesCard,
  KpiOrdersGoalCard,
  KpiNewCustomersCard,
  DarkKpiCardsGroup,
} from '@/components/ui'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Dark KPI Cards Suite', () => {
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

  describe('KpiExpectedEarningsCard', () => {
    it('renders expected earnings value, trend pill, and default breakdown items', () => {
      let clicked = false
      act(() => {
        root.render(
          <KpiExpectedEarningsCard
            onClick={() => {
              clicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('69.24k')
      expect(container.textContent).toContain('Expected Earnings')
      expect(container.textContent).toContain('↑ 2.2%')
      expect(container.textContent).toContain('Shoes')
      expect(container.textContent).toContain('$7,660')
      expect(container.textContent).toContain('Gaming')
      expect(container.textContent).toContain('$2,820')
      expect(container.textContent).toContain('Others')
      expect(container.textContent).toContain('$45,257')

      const card = container.querySelector('[role="button"]')
      expect(card).not.toBeNull()
      act(() => {
        card.click()
      })
      expect(clicked).toBe(true)
    })

    it('renders custom breakdown items and values when passed', () => {
      act(() => {
        root.render(
          <KpiExpectedEarningsCard
            value="85.40k"
            title="Scolarité attendue"
            breakdown={[
              { label: 'Inscriptions', value: '$12,000' },
              { label: 'Cantine', value: '$5,400' },
            ]}
          />
        )
      })

      expect(container.textContent).toContain('85.40k')
      expect(container.textContent).toContain('Scolarité attendue')
      expect(container.textContent).toContain('Inscriptions')
      expect(container.textContent).toContain('$12,000')
      expect(container.textContent).toContain('Cantine')
      expect(container.textContent).toContain('$5,400')
    })
  })

  describe('KpiDailySalesCard', () => {
    it('renders average daily sales, 10 vertical bars, and gradient on the last bar', () => {
      let clicked = false
      act(() => {
        root.render(
          <KpiDailySalesCard
            onClick={() => {
              clicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('2,420')
      expect(container.textContent).toContain('Average Daily Sales')
      expect(container.textContent).toContain('↑ 2.2%')

      // Check vertical bars
      const barElements = container.querySelectorAll('.group\\/bar')
      expect(barElements.length).toBe(10)

      const card = container.querySelector('[role="button"]')
      act(() => {
        card.click()
      })
      expect(clicked).toBe(true)
    })
  })

  describe('KpiOrdersGoalCard', () => {
    it('renders orders count, negative trend badge, wireframe graphic, and progress goal', () => {
      let clicked = false
      act(() => {
        root.render(
          <KpiOrdersGoalCard
            onClick={() => {
              clicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('1,836')
      expect(container.textContent).toContain('Orders This Month')
      expect(container.textContent).toContain('↓ 2.2%')
      expect(container.textContent).toContain('1,048 to Goal')

      // Wireframe SVG
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()

      const card = container.querySelector('[role="button"]')
      act(() => {
        card.click()
      })
      expect(clicked).toBe(true)
    })
  })

  describe('KpiNewCustomersCard', () => {
    it('renders customer count, Today Heroes section, 4 avatars, and +26 counter', () => {
      let clicked = false
      act(() => {
        root.render(
          <KpiNewCustomersCard
            onClick={() => {
              clicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('6,345')
      expect(container.textContent).toContain('New Customers This Month')
      expect(container.textContent).toContain("Today's Heroes")
      expect(container.textContent).toContain('+26')

      const card = container.querySelector('[role="button"]')
      act(() => {
        card.click()
      })
      expect(clicked).toBe(true)
    })
  })

  describe('DarkKpiCardsGroup', () => {
    it('renders all 4 cards together in a responsive grid', () => {
      let earningsClicked = false
      let salesClicked = false
      let ordersClicked = false
      let customersClicked = false

      act(() => {
        root.render(
          <DarkKpiCardsGroup
            onEarningsClick={() => {
              earningsClicked = true
            }}
            onDailySalesClick={() => {
              salesClicked = true
            }}
            onOrdersGoalClick={() => {
              ordersClicked = true
            }}
            onNewCustomersClick={() => {
              customersClicked = true
            }}
          />
        )
      })

      expect(container.textContent).toContain('Expected Earnings')
      expect(container.textContent).toContain('Average Daily Sales')
      expect(container.textContent).toContain('Orders This Month')
      expect(container.textContent).toContain('New Customers This Month')

      const buttons = container.querySelectorAll('[role="button"]')
      expect(buttons.length).toBe(4)

      act(() => {
        buttons[0].click()
        buttons[1].click()
        buttons[2].click()
        buttons[3].click()
      })

      expect(earningsClicked).toBe(true)
      expect(salesClicked).toBe(true)
      expect(ordersClicked).toBe(true)
      expect(customersClicked).toBe(true)
    })
  })
})
