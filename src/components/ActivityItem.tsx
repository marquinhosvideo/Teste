import { useState } from 'react'
import { Check, ChevronDown, MapPin } from 'lucide-react'
import type { Activity } from '../types'

type Props = {
  activity: Activity
  onToggle: () => void
}

export function ActivityItem({ activity, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hasNotes = Boolean(activity.notes && activity.notes !== activity.title)

  return (
    <div className={`activity ${activity.done ? 'activity--done' : ''}`}>
      <button
        type="button"
        className="activity__main"
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
        </span>
      </button>

      {hasNotes ? (
        <>
          <button
            type="button"
            className={`activity__expand ${expanded ? 'activity__expand--open' : ''}`}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            Detalhes
            <ChevronDown size={16} />
          </button>
          {expanded ? (
            <div className="activity__notes">{activity.notes}</div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
