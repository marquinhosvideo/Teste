import type { Day, Expense, Trip } from '../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types'
import { ActivityItem } from '../components/ActivityItem'
import { ProgressRing } from '../components/ProgressRing'
import { formatDayLabel, formatMoney } from '../lib/format'

type Props = {
  trip: Trip
  day: Day
  onToggle: (dayId: string, activityId: string) => void
}

export function TodayView({ trip, day, onToggle }: Props) {
  const done = day.activities.filter((a) => a.done).length
  const total = day.activities.length
  const pct = total ? (done / total) * 100 : 0
  const dayExpenses = trip.expenses.filter((e) => e.dayId === day.id)
  const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0)
  const byCategory = summarizeCategories(dayExpenses)

  return (
    <section className="view today-view">
      <header className="brand-header">
        <p className="brand">Roteiro</p>
        <h1>{trip.name}</h1>
        <p className="brand-header__sub">{trip.destination}</p>
      </header>

      <div className="today-panel">
        <div className="today-panel__top">
          <div>
            <p className="eyebrow">{formatDayLabel(day.date)}</p>
            <h2>{day.label}</h2>
            <p className="muted">
              {done} de {total} concluídos
            </p>
          </div>
          <ProgressRing value={pct} />
        </div>

        <div className="spend-strip" aria-label="Gastos do dia">
          <div>
            <p className="spend-strip__label">Gasto do dia</p>
            <p className="spend-strip__value">{formatMoney(dayTotal, trip.currency)}</p>
          </div>
          <div className="spend-strip__cats">
            {CATEGORY_ORDER.filter((c) => byCategory[c] > 0).map((cat) => (
              <span key={cat} className={`pill pill--${cat}`}>
                {CATEGORY_LABELS[cat]} {formatMoney(byCategory[cat], trip.currency)}
              </span>
            ))}
            {!dayExpenses.length ? <span className="muted">Sem gastos ainda</span> : null}
          </div>
        </div>
      </div>

      <div className="section-head">
        <h3>Programação</h3>
      </div>
      <div className="activity-stack">
        {day.activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onToggle={() => onToggle(day.id, activity.id)}
          />
        ))}
      </div>
    </section>
  )
}

function summarizeCategories(expenses: Expense[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const e of expenses) {
    map[e.category] = (map[e.category] ?? 0) + e.amount
  }
  return map
}
