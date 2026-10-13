import { useMemo, useState } from 'react'
import type { BudgetId, Trip } from '../types'
import { BUDGET_LABELS, BUDGET_ORDER } from '../types'
import { DayChips } from '../components/DayChips'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseList } from '../components/ExpenseList'
import { ReceiptScanButton } from '../components/ReceiptScanButton'
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
  }) => void | Promise<void>
  onRemove: (id: string) => void
}

export function ExpensesView({ trip, defaultDayId, onAdd, onRemove }: Props) {
  const [filterDayId, setFilterDayId] = useState<string>('all')

  const filtered = useMemo(() => {
    if (filterDayId === 'all') return trip.expenses
    return trip.expenses.filter((e) => e.dayId === filterDayId)
  }, [trip.expenses, filterDayId])

  const filterTotal = filtered.reduce((s, e) => s + e.amount, 0)
  const tripTotal = trip.expenses.reduce((s, e) => s + e.amount, 0)
  const byBudget = spentByBudget(filtered)

  const bars = BUDGET_ORDER.map((id) => ({
    id,
    amount: byBudget[id],
  })).filter((row) => row.amount > 0)

  const maxBar = Math.max(...bars.map((r) => r.amount), 1)

  return (
    <section className="view">
      <section className="band band--dark band--hero">
        <div className="band__inner">
          <p className="eyebrow eyebrow--on-dark">Gastos</p>
          <p className="display-hero">{formatMoney(tripTotal, trip.currency)}</p>
          <p className="lede lede--on-dark">
            Total da viagem.
            {filterDayId !== 'all'
              ? ` Filtro: ${formatMoney(filterTotal, trip.currency)}.`
              : ''}
          </p>
        </div>
      </section>

      <section className="band band--parchment band--chips">
        <DayChips
          days={trip.days}
          selectedId={filterDayId}
          onSelect={setFilterDayId}
          includeAll
          allMeta={`${trip.expenses.length} gastos`}
          metaForDay={(day) =>
            formatMoney(
              trip.expenses
                .filter((e) => e.dayId === day.id)
                .reduce((s, e) => s + e.amount, 0),
              trip.currency,
            )
          }
        />
      </section>

      <section className="band">
        <div className="band__inner band__inner--stack">
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
                      className="cat-bar__fill"
                      style={{ width: `${(amount / maxBar) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="expense-actions">
            <ExpenseForm
              days={trip.days}
              defaultDayId={defaultDayId}
              currency={trip.currency}
              onSubmit={onAdd}
            />
            <ReceiptScanButton
              days={trip.days}
              defaultDayId={defaultDayId}
              currency={trip.currency}
              onConfirm={async (items) => {
                for (const item of items) {
                  await onAdd(item)
                }
              }}
            />
          </div>

          <ExpenseList
            expenses={filtered}
            days={trip.days}
            currency={trip.currency}
            onRemove={onRemove}
          />
        </div>
      </section>
    </section>
  )
}
