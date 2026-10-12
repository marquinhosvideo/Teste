import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = {
  notes?: string
}

export function DayNotes({ notes }: Props) {
  const [open, setOpen] = useState(false)
  if (!notes) return null

  return (
    <div className="day-notes">
      <button
        type="button"
        className={`day-notes__toggle ${open ? 'day-notes__toggle--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Endereços, carro e dicas do dia
        <ChevronDown size={16} />
      </button>
      {open ? <pre className="day-notes__body">{notes}</pre> : null}
    </div>
  )
}
