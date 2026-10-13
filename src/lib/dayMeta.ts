import type { LucideIcon } from 'lucide-react'
import { MapPin, NotebookPen } from 'lucide-react'
import { iconFromEmoji, noteLabelForIcon, stripEmoji } from './display'

export type DayNoteItem = {
  icon: LucideIcon
  label: string
  text: string
}

export type DayPlace = {
  name: string
  addr: string
  copyText: string
}

export function parseDayMeta(dayNotes?: string): {
  notes: DayNoteItem[]
  places: DayPlace[]
} {
  const notes: DayNoteItem[] = []
  const places: DayPlace[] = []
  if (!dayNotes?.trim()) return { notes, places }

  const paras = dayNotes.split(/\n\n+/).filter((p) => p.trim())
  for (const para of paras) {
    const icon = iconFromEmoji(para, NotebookPen)
    if (icon === MapPin || para.trim().startsWith('📍')) {
      const raw = stripEmoji(para)
      raw.split('|').forEach((seg) => {
        const piece = seg.trim()
        if (!piece) return
        const [name, ...rest] = piece.split(/\s+[–—-]\s+/)
        places.push({
          name: name.trim(),
          addr: rest.join(' – ').trim() || 'Buscar pelo nome',
          copyText: piece,
        })
      })
    } else {
      notes.push({
        icon,
        label: noteLabelForIcon(icon),
        text: stripEmoji(para),
      })
    }
  }

  return { notes, places }
}
