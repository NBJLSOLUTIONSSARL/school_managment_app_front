import { KpiExpectedEarningsCard } from './KpiExpectedEarningsCard'
import { KpiDailySalesCard } from './KpiDailySalesCard'
import { KpiOrdersGoalCard } from './KpiOrdersGoalCard'
import { KpiNewCustomersCard } from './KpiNewCustomersCard'

export function DarkKpiCardsGroup({
  earningsProps = {},
  dailySalesProps = {},
  ordersGoalProps = {},
  newCustomersProps = {},
  onEarningsClick,
  onDailySalesClick,
  onOrdersGoalClick,
  onNewCustomersClick,
  className = '',
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ${className}`}
    >
      <KpiExpectedEarningsCard
        onClick={onEarningsClick}
        {...earningsProps}
      />
      <KpiDailySalesCard
        onClick={onDailySalesClick}
        {...dailySalesProps}
      />
      <KpiOrdersGoalCard
        onClick={onOrdersGoalClick}
        {...ordersGoalProps}
      />
      <KpiNewCustomersCard
        onClick={onNewCustomersClick}
        {...newCustomersProps}
      />
    </div>
  )
}

export default DarkKpiCardsGroup
