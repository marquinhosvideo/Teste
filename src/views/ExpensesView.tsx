import { useMemo, useState } from 'react'
import type { BudgetId, Trip } from '../types'
import { BUDGET_LABELS, BUDGET_ORDER } from '../types'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseList } from '../components/ExpenseList'
import { DayChips } from '../components/DayChips'
import { formatMoney } from '../lib/format'
import { spentByBudget } from '../lib/budgets'

type Props = {
  trip: Trip
  defaultDayId: string
  onAdd: (data: {
    dayId: string
    budgetId: BudgetId
    description: string
    amount: number
  }) => void
  onRemove: (id: string) => void
}

export function ExpensesView({ trip, defaultDayId, onAdd, onRemove }: Props) {
  const [filterDayId, setFilterDayId] = useState<string | 'all'>('all')

  const filtered = useMemo(() => {
    if (filterDayId === 'all') return trip.expenses
    return trip.expenses.filter((e) => e.dayId === filterDayId)
  }, [trip.expenses, filterDayId])

  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const tripTotal = trip.expenses.reduce((s, e) => s + e.amount, 0)
  const byBudget = spentByBudget(filtered)

  const bars = BUDGET_ORDER.map((id) => ({
    id,
    amount: byBudget[id],
  })).filter((row) => row.amount > 0)

  const maxBar = Math.max(...bars.map((r) => r.amount), 1)

  return (
    <section className="view">
      <header className="view-header">
        <h1>Gastos</h1>
        <p className="muted">Lance em Marcos, Dielen, Helena, Alimentação ou Outros</p>
      </header>

      <div className="totals-row">
        <div>
          <p className="spend-strip__label">Total da viagem</p>
          <p className="totals-row__value">{formatMoney(tripTotal, trip.currency)}</p>
        </div>
        <div>
          <p className="spend-strip__label">Filtro atual</p>
          <p className="totals-row__value totals-row__value--sm">
            {formatMoney(total, trip.currency)}
          </p>
        </div>
      </div>

      <div className="filter-row">
        <button
          type="button"
          className={`day-chip ${filterDayId === 'all' ? 'day-chip--active' : ''}`}
          onClick={() => setFilterDayId('all')}
        >
          <span className="day-chip__index">Todos</span>
          <span className="day-chip__progress">{trip.expenses.length}</span>
        </button>
      </div>
      <DayChips
        days={trip.days}
        selectedId={filterDayId === 'all' ? '' : filterDayId}
        onSelect={(id) => setFilterDayId(id)}
      />

      {bars.length > 0 ? (
        <div className="cat-bars" aria-label="Gastos por orçamento">
          {bars.map(({ id, amount }) => (
            <div key={id} className="cat-bar">
              <div className="cat-bar__labels">
                <span>{BUDGET_LABELS[id]}</span>
                <span>{formatMoney(amount, trip.currency)}</span>
              </div>
              <div className="cat-bar__track">
                <div
                  className={`cat-bar__fill cat-bar__fill--${id}`}
                  style={{ width: `${(amount / maxBar) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <ExpenseForm
        days={trip.days}
        defaultDayId={defaultDayId}
        currency={trip.currency}
        onSubmit={onAdd}
      />

      <ExpenseList
        expenses={filtered}
        days={trip.days}
        currency={trip.currency}
        onRemove={onRemove}
      />
    </section>
  )
}
