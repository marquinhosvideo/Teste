import { useMemo, useState } from 'react'
import type { Trip } from '../types'
import { DayChips } from '../components/DayChips'
import { DayNotes } from '../components/DayNotes'
import { AddressCopyList } from '../components/AddressCopyList'
import { ActivityItem } from '../components/ActivityItem'
import { extractDayAddresses } from '../lib/addresses'
import { formatDayLabel } from '../lib/format'

type Props = {
  trip: Trip
  initialDayId?: string
  onToggle: (dayId: string, activityId: string) => void
}

export function ItineraryView({ trip, initialDayId, onToggle }: Props) {
  const [selectedId, setSelectedId] = useState(initialDayId ?? trip.days[0]?.id)
  const day = trip.days.find((d) => d.id === selectedId) ?? trip.days[0]
  const addresses = useMemo(
    () =>
      day
        ? extractDayAddresses({
            dayNotes: day.dayNotes,
            activityLocations: day.activities.map((a) => a.location),
          })
        : [],
    [day],
  )

  if (!day) {
    return <p className="empty-hint">Nenhum dia no roteiro. Importe seu Excel.</p>
  }

  const done = day.activities.filter((a) => a.done).length

  return (
    <section className="view">
      <header className="view-header">
        <h1>Roteiro</h1>
        <p className="muted">
          {trip.days.length} dias em Orlando · marque Manhã, Tarde e Noite
        </p>
      </header>

      <DayChips days={trip.days} selectedId={day.id} onSelect={setSelectedId} />

      <div className="day-detail">
        <p className="eyebrow">{formatDayLabel(day.date)}</p>
        <h2>{day.label}</h2>
        <p className="muted">
          {done}/{day.activities.length} períodos
        </p>
      </div>

      <DayNotes notes={day.dayNotes} />

      <div className="activity-stack">
        {day.activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onToggle={() => onToggle(day.id, activity.id)}
          />
        ))}
      </div>

      <AddressCopyList addresses={addresses} />
    </section>
  )
}
