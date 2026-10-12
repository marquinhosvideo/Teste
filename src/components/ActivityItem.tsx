import { Check, MapPin } from 'lucide-react'
import type { Activity } from '../types'

type Props = {
  activity: Activity
  onToggle: () => void
}

export function ActivityItem({ activity, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`activity ${activity.done ? 'activity--done' : ''}`}
      onClick={onToggle}
      aria-pressed={activity.done}
    >
      <span className="activity__check" aria-hidden>
        {activity.done ? <Check size={16} strokeWidth={2.5} /> : null}
      </span>
      <span className="activity__body">
        <span className="activity__meta">
          {activity.time ? <span className="activity__time">{activity.time}</span> : null}
          {activity.location ? (
            <span className="activity__location">
              <MapPin size={12} />
              {activity.location}
            </span>
          ) : null}
        </span>
        <span className="activity__title">{activity.title}</span>
        {activity.notes ? <span className="activity__notes">{activity.notes}</span> : null}
      </span>
    </button>
  )
}
