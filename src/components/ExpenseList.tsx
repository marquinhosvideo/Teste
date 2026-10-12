import { Trash2 } from 'lucide-react'
import type { Day, Expense } from '../types'
import { BUDGET_LABELS } from '../types'
import { formatMoney, formatShortDate } from '../lib/format'

type Props = {
  expenses: Expense[]
  days: Day[]
  currency: string
  onRemove: (id: string) => void
}

export function ExpenseList({ expenses, days, currency, onRemove }: Props) {
  if (!expenses.length) {
    return (
      <p className="empty-hint">Nenhum gasto registrado ainda. Toque em “Registrar gasto”.</p>
    )
  }

  const dayMap = new Map(days.map((d) => [d.id, d]))

  return (
    <ul className="expense-list">
      {expenses.map((expense) => {
        const day = dayMap.get(expense.dayId)
        return (
          <li key={expense.id} className="expense-item">
            <div className="expense-item__main">
              <span className={`cat-dot cat-dot--${expense.budgetId}`} aria-hidden />
              <div>
                <p className="expense-item__title">{expense.description}</p>
                <p className="expense-item__meta">
                  {BUDGET_LABELS[expense.budgetId]}
                  {day ? ` · ${formatShortDate(day.date)}` : ''}
                </p>
              </div>
            </div>
            <div className="expense-item__side">
              <span className="expense-item__amount">{formatMoney(expense.amount, currency)}</span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Remover gasto"
                onClick={() => onRemove(expense.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
