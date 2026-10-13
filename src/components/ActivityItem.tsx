import { useState } from 'react'
import { Check, MapPin } from 'lucide-react'
import type { Activity } from '../types'
import { copyText } from '../lib/addresses'
import { parseActivityLines, periodFromActivityId } from '../lib/display'

type Props = {
  activity: Activity
  onToggle: () => void
}

export function ActivityItem({ activity, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const period = periodFromActivityId(activity.id)
  const PeriodIcon = period.icon
  const source = activity.notes || activity.title
  const lines = parseActivityLines(source)
  const headline = lines[0]?.text || activity.title
  const cats = lines.filter((l) => l.cat)
  const hasDetails = lines.length > 1 || Boolean(activity.location)

  async function handleCopyAddress() {
    if (!activity.location) return
    const ok = await copyText(activity.location)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <article className={`activity ${activity.done ? 'activity--done' : ''}`}>
      <div className="activity__row">
        <button
          type="button"
          className="activity__check-btn"
          onClick={onToggle}
          aria-pressed={activity.done}
          aria-label="Concluir período"
        >
          <span className="activity__check" aria-hidden>
            <Check size={16} strokeWidth={2.5} />
          </span>
        </button>

        <div className="activity__body">
          <div className="activity__period">
            <PeriodIcon size={16} aria-hidden />
            <span>{period.label}</span>
            {activity.time ? <span className="activity__time">{activity.time}</span> : null}
          </div>
          <p className="activity__title">{headline}</p>
          {cats.length > 0 ? (
            <div className="activity__cats">
              {cats.map((cat) => {
                const Icon = cat.icon
                return (
                  <span key={`${cat.cat}-${cat.text.slice(0, 12)}`} className="activity__cat">
                    <Icon size={14} aria-hidden />
                    {cat.cat}
                  </span>
                )
              })}
            </div>
          ) : null}

          {hasDetails ? (
            <button
              type="button"
              className="text-link"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? 'Ocultar detalhes' : 'Detalhes ›'}
            </button>
          ) : null}

          {expanded ? (
            <div className="activity__details">
              {lines.map((line, i) => {
                const Icon = line.icon
                return (
                  <div key={`${i}-${line.text.slice(0, 20)}`} className="activity__detail-row">
                    <Icon size={18} aria-hidden />
                    <div>
                      {line.cat ? <p className="activity__detail-cat">{line.cat}</p> : null}
                      <p className="activity__detail-text">{line.text}</p>
                    </div>
                  </div>
                )
              })}
              {activity.location ? (
                <div className="activity__address">
                  <div className="activity__address-text">
                    <MapPin size={18} aria-hidden />
                    <p>{activity.location}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--pearl"
                    onClick={() => void handleCopyAddress()}
                  >
                    {copied ? 'Copiado.' : 'Copiar para o Waze'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
