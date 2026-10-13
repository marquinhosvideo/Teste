import { useMemo, useState } from 'react'
import type { Trip } from '../types'
import { ActivityItem } from '../components/ActivityItem'
import { AddressCopyList } from '../components/AddressCopyList'
import { DayChips } from '../components/DayChips'
import { DayHero } from '../components/DayHero'
import { DayInfo } from '../components/DayInfo'
import { parseDayMeta } from '../lib/dayMeta'

type Props = {
  trip: Trip
  initialDayId?: string
  onToggle: (dayId: string, activityId: string) => void
}

export function ItineraryView({ trip, initialDayId, onToggle }: Props) {
  const [selectedId, setSelectedId] = useState(initialDayId ?? trip.days[0]?.id)
  const dayIndex = Math.max(
    0,
    trip.days.findIndex((d) => d.id === selectedId),
  )
  const day = trip.days[dayIndex] ?? trip.days[0]
  const { notes, places } = useMemo(
    () => parseDayMeta(day?.dayNotes),
    [day?.dayNotes],
  )

  if (!day) {
    return <p className="empty-hint">Nenhum dia no roteiro. Importe seu Excel.</p>
  }

  return (
    <section className="view">
      <section className="band band--parchment band--hero">
        <div className="band__inner">
          <p className="eyebrow">Roteiro</p>
          <h1 className="display-lg">{trip.days.length} dias em Orlando.</h1>
          <p className="lede">Marque manhã, tarde e noite.</p>
        </div>
        <DayChips days={trip.days} selectedId={day.id} onSelect={setSelectedId} />
      </section>

      <DayHero day={day} dayIndex={dayIndex} dayCount={trip.days.length} />

      <section className="band">
        <div className="band__inner">
          <h2 className="section-title">Programação.</h2>
          <div className="activity-stack">
            {day.activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onToggle={() => onToggle(day.id, activity.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <DayInfo notes={notes} />
      <AddressCopyList places={places} />
    </section>
  )
}
