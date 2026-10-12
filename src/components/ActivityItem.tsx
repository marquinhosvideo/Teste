import { useState } from 'react'
import { Check, ChevronDown, Copy, MapPin } from 'lucide-react'
import type { Activity } from '../types'
import { copyText } from '../lib/addresses'

type Props = {
  activity: Activity
  onToggle: () => void
}

export function ActivityItem({ activity, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasNotes = Boolean(activity.notes && activity.notes !== activity.title)
  const hasLocation = Boolean(activity.location)

  async function handleCopyAddress() {
    if (!activity.location) return
    const ok = await copyText(activity.location)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

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
          </span>
          <span className="activity__title">{activity.title}</span>
        </span>
      </button>

      {(hasNotes || hasLocation) && (
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
            <div className="activity__details">
              {hasNotes ? <div className="activity__notes">{activity.notes}</div> : null}
              {hasLocation ? (
                <div className="activity__address">
                  <div className="activity__address-text">
                    <MapPin size={15} aria-hidden />
                    <p>{activity.location}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost address-card__copy"
                    onClick={() => void handleCopyAddress()}
                  >
                    <Copy size={15} />
                    {copied ? 'Copiado' : 'Copiar p/ Waze'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
