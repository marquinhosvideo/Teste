import type { Trip } from '../types'
import { formatMoney, formatMoneyPair } from '../lib/format'
import { budgetPercent, getBudgets, spentByBudget } from '../lib/budgets'
import { MoneyPair } from './MoneyPair'

type Props = {
  trip: Trip
}

export function BudgetWidgets({ trip }: Props) {
  const budgets = getBudgets(trip)
  const spent = spentByBudget(trip.expenses)
  const tripTotal = trip.expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <section className="band band--parchment">
      <div className="band__inner">
        <div className="budget-widgets__head">
          <h2 className="section-title">Orçamentos.</h2>
          <p className="section-sub">{formatMoneyPair(tripTotal)} gastos</p>
        </div>
        <div className="budget-widgets__grid">
          {budgets.map((budget) => {
            const value = spent[budget.id] ?? 0
            const pct = budgetPercent(value, budget.limit)
            const over = value > budget.limit
            return (
              <article
                key={budget.id}
                className={`utility-card ${over ? 'utility-card--over' : ''}`}
              >
                <p className="utility-card__eyebrow">{Math.round(pct)}%</p>
                <h3 className="utility-card__title">{budget.label}</h3>
                <p className="utility-card__price">
                  <MoneyPair amountBrl={value} layout="stack" />
                </p>
                <p className="utility-card__footnote">
                  de {formatMoney(budget.limit, 'BRL')}
                </p>
                <div className="utility-card__track" aria-hidden>
                  <div
                    className="utility-card__fill"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      background: over ? 'var(--color-ink)' : 'var(--color-primary)',
                    }}
                  />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
