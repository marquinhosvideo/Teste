import { Trash2 } from 'lucide-react'
import type { Day, Expense } from '../types'
import { BUDGET_LABELS } from '../types'
import { formatShortDate } from '../lib/format'
import { MoneyPair } from './MoneyPair'

type Props = {
  expenses: Expense[]
  days: Day[]
  currency: string
  onRemove: (id: string) => void
}

export function ExpenseList({ expenses, days, onRemove }: Props) {
  if (!expenses.length) {
    return <p className="empty-hint">Nenhum gasto neste filtro.</p>
  }

  const dayMap = new Map(days.map((d, i) => [d.id, { day: d, index: i }]))

  return (
    <ul className="expense-list">
      {expenses.map((expense) => {
        const entry = dayMap.get(expense.dayId)
        return (
          <li key={expense.id} className="expense-item">
            <div className="expense-item__main">
              <p className="expense-item__title">{expense.description}</p>
              <p className="expense-item__meta">
                {BUDGET_LABELS[expense.budgetId]}
                {entry
                  ? ` · D${entry.index + 1} · ${formatShortDate(entry.day.date)}`
                  : ''}
              </p>
            </div>
            <p className="expense-item__amount">
              <MoneyPair amountBrl={expense.amount} layout="stack" />
            </p>
            <button
              type="button"
              className="icon-btn"
              aria-label="Remover gasto"
              onClick={() => onRemove(expense.id)}
            >
              <Trash2 size={18} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
