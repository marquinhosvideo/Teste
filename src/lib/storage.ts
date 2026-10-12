import type { Trip } from '../types'
import { sampleTrip } from '../data/sampleTrip'

const STORAGE_KEY = 'roteiro-orlando-2026-v2'

export function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(sampleTrip)
    const parsed = JSON.parse(raw) as Trip
    if (!parsed?.days?.length) return structuredClone(sampleTrip)
    return parsed
  } catch {
    return structuredClone(sampleTrip)
  }
}

export function saveTrip(trip: Trip): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip))
}

export function resetTrip(): Trip {
  const trip = structuredClone(sampleTrip)
  saveTrip(trip)
  return trip
}
