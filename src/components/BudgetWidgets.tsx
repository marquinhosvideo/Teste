import type { Trip } from '../types'
import { formatMoney } from '../lib/format'
import { budgetPercent, getBudgets, spentByBudget } from '../lib/budgets'

type Props = {
  trip: Trip
}

export function BudgetWidgets({ trip }: Props) {
  const budgets = getBudgets(trip)
  const spent = spentByBudget(trip.expenses)
  const currency = trip.currency || 'BRL'

  return (
    <section className="budget-widgets" aria-label="Orçamentos da viagem">
      <div className="budget-widgets__head">
        <p className="eyebrow">Orçamentos</p>
        <p className="budget-widgets__hint">Teto provisório R$ 5.000 cada</p>
      </div>
      <div className="budget-widgets__grid">
        {budgets.map((budget) => {
          const value = spent[budget.id] ?? 0
          const pct = budgetPercent(value, budget.limit)
          const over = value > budget.limit
          return (
            <article
              key={budget.id}
              className={`budget-chip budget-chip--${budget.id} ${over ? 'budget-chip--over' : ''}`}
            >
              <div className="budget-chip__top">
                <h3>{budget.label}</h3>
                <span className="budget-chip__pct">{Math.round(pct)}%</span>
              </div>
              <p className="budget-chip__spent">{formatMoney(value, currency)}</p>
              <p className="budget-chip__limit">
                de {formatMoney(budget.limit, currency)}
              </p>
              <div className="budget-chip__track" aria-hidden>
                <div
                  className="budget-chip__fill"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
