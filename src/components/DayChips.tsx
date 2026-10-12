import type { Day } from '../types'
import { formatShortDate } from '../lib/format'

type Props = {
  days: Day[]
  selectedId: string
  onSelect: (id: string) => void
}

export function DayChips({ days, selectedId, onSelect }: Props) {
  return (
    <div className="day-chips" role="tablist" aria-label="Dias da viagem">
      {days.map((day, index) => {
        const done = day.activities.filter((a) => a.done).length
        const total = day.activities.length
        const selected = day.id === selectedId
        return (
          <button
            key={day.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`day-chip ${selected ? 'day-chip--active' : ''}`}
            onClick={() => onSelect(day.id)}
          >
            <span className="day-chip__index">D{index + 1}</span>
            <span className="day-chip__date">{formatShortDate(day.date)}</span>
            <span className="day-chip__progress">
              {done}/{total}
            </span>
          </button>
        )
      })}
    </div>
  )
}
