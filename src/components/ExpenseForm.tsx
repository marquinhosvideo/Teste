import { useState, type FormEvent } from 'react'
import type { BudgetId, Day } from '../types'
import { BUDGET_LABELS, BUDGET_ORDER } from '../types'
import { formatShortDate } from '../lib/format'

type Props = {
  days: Day[]
  defaultDayId: string
  currency: string
  onSubmit: (data: {
    dayId: string
    budgetId: BudgetId
    description: string
    amount: number
  }) => void
}

export function ExpenseForm({ days, defaultDayId, onSubmit }: Props) {
  const [dayId, setDayId] = useState(defaultDayId)
  const [budgetId, setBudgetId] = useState<BudgetId>('marcos')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [open, setOpen] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount.replace(',', '.'))
    if (!description.trim() || !Number.isFinite(value) || value <= 0) return
    onSubmit({ dayId, budgetId, description, amount: value })
    setDescription('')
    setAmount('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" className="btn btn--primary btn--block" onClick={() => setOpen(true)}>
        Registrar gasto
      </button>
    )
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="exp-day">Dia</label>
        <select id="exp-day" value={dayId} onChange={(e) => setDayId(e.target.value)}>
          {days.map((day, i) => (
            <option key={day.id} value={day.id}>
              D{i + 1} · {formatShortDate(day.date)} · {day.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="exp-budget">Orçamento</label>
        <select
          id="exp-budget"
          value={budgetId}
          onChange={(e) => setBudgetId(e.target.value as BudgetId)}
        >
          {BUDGET_ORDER.map((id) => (
            <option key={id} value={id}>
              {BUDGET_LABELS[id]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="exp-desc">Descrição</label>
        <input
          id="exp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: almoço, ingressos, Uber"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="exp-amount">Valor (R$)</label>
        <input
          id="exp-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      <div className="expense-form__actions">
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary">
          Salvar
        </button>
      </div>
    </form>
  )
}
