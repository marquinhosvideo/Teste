import { useState, type FormEvent } from 'react'
import type { Day, ExpenseCategory } from '../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types'
import { formatShortDate } from '../lib/format'

type Props = {
  days: Day[]
  defaultDayId: string
  currency: string
  onSubmit: (data: {
    dayId: string
    category: ExpenseCategory
    description: string
    amount: number
  }) => void
}

export function ExpenseForm({ days, defaultDayId, currency, onSubmit }: Props) {
  const [dayId, setDayId] = useState(defaultDayId)
  const [category, setCategory] = useState<ExpenseCategory>('alimentacao')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [open, setOpen] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount.replace(',', '.'))
    if (!description.trim() || !Number.isFinite(value) || value <= 0) return
    onSubmit({ dayId, category, description, amount: value })
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
        <label htmlFor="exp-cat">Categoria</label>
        <select
          id="exp-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        >
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
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
        <label htmlFor="exp-amount">Valor ({currency === 'USD' ? 'US$' : currency})</label>
        <input
          id="exp-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
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
