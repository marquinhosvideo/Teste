import type { LucideIcon } from 'lucide-react'
import type { DayNoteItem } from '../lib/dayMeta'

type Props = {
  notes: DayNoteItem[]
}

export function DayInfo({ notes }: Props) {
  if (!notes.length) return null

  return (
    <section className="band band--parchment">
      <div className="band__inner">
        <h2 className="section-title">Para o dia.</h2>
        <div className="day-info">
          {notes.map((note) => {
            const Icon = note.icon as LucideIcon
            return (
              <div key={`${note.label}-${note.text.slice(0, 24)}`} className="day-info__row">
                <span className="day-info__icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <div>
                  <p className="day-info__label">{note.label}</p>
                  <p className="day-info__text">{note.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
