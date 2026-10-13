import type { Day } from '../types'
import { dayTitleParts } from '../lib/display'
import { photoForDay } from '../lib/dayPhotos'
import { formatDayLabel } from '../lib/format'

type Props = {
  day: Day
  dayIndex: number
  dayCount: number
  showPhoto?: boolean
}

export function DayHero({ day, dayIndex, dayCount, showPhoto = true }: Props) {
  const done = day.activities.filter((a) => a.done).length
  const total = day.activities.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const tags = dayTitleParts(day.label)
  const title = tags.map((t) => t.text).join(' + ')
  const photo = photoForDay(day.date)

  return (
    <section className="day-hero">
      {showPhoto && photo ? (
        <div className="day-hero__photo">
          <img src={photo} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="day-hero__body">
        <p className="day-hero__eyebrow">{formatDayLabel(day.date)}</p>
        <h1 className="day-hero__title">{title}</h1>
        <div className="day-hero__tags">
          {tags.map((tag) => {
            const Icon = tag.icon
            return (
              <span key={tag.text} className="day-hero__tag">
                <Icon size={16} aria-hidden />
                {tag.text}
              </span>
            )
          })}
        </div>
        <div className="day-hero__progress-row">
          <div>
            <p className="day-hero__pct">{pct}%</p>
            <p className="day-hero__progress-label">
              {done} de {total} períodos concluídos.
            </p>
          </div>
          <p className="day-hero__index">
            Dia {dayIndex + 1} de {dayCount}
          </p>
        </div>
        <div className="day-hero__track" aria-hidden>
          <div className="day-hero__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  )
}
