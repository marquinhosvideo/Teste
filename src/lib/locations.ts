import type { Day, SavedPlace, Trip } from '../types'
import { parseDayMeta } from './dayMeta'

const CATEGORY_RULES: Array<[string, RegExp]> = [
  ['Alimentação', /\b(caf[eé]|chef|restaurant|dining|food|refei[cç][aã]o)\b/i],
  [
    'Parques',
    /\b(magic kingdom|animal kingdom|hollywood studios|epic universe|universal|gatorland|crayola)\b/i,
  ],
  [
    'Compras',
    /\b(outlet|mall|walmart|target|ross|burlington|best buy|ulta|marshalls|tj maxx|t\.j\. maxx|five below|world of disney|beauty master|nordstrom|factory stores?)\b/i,
  ],
  ['Aeroportos', /\b(aeroporto|airport|\bGIG\b|\bMIA\b)\b/i],
  [
    'Passeios',
    /\b(disney springs|icon park|winter garden|leu gardens|lake eola|celebration|plant st|farmers market)\b/i,
  ],
  ['Hospedagem', /\b(hotel|resort)\b/i],
]

function clean(value: string): string {
  return value
    .replace(/[⭐*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function inferPlaceCategory(name: string, context = ''): string {
  if (
    /refei[cç][aã]o|alimenta|chef|caf[eé]|jantar|almo[cç]o/i.test(context) &&
    /resort|hotel|chef|caf[eé]|restaurant/i.test(name)
  ) {
    return 'Alimentação'
  }

  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(name)) return category
  }

  if (/compras|mercado|beleza/i.test(context)) return 'Compras'
  if (/parque/i.test(context)) return 'Parques'
  if (/refei[cç][aã]o|alimenta/i.test(context)) return 'Alimentação'
  if (/passeio/i.test(context)) return 'Passeios'
  if (/viagem/i.test(context)) return 'Aeroportos'
  return 'Outros'
}

function placesFromDay(day: Day): SavedPlace[] {
  const { places } = parseDayMeta(day.dayNotes)
  const context = [
    day.label,
    ...day.activities.flatMap((activity) => [
      activity.title,
      activity.notes ?? '',
    ]),
  ].join(' ')

  return places.map((place) => ({
    name: clean(place.name),
    address: clean(place.addr),
    category: inferPlaceCategory(place.name, context),
  }))
}

export function normalizePlace(place: SavedPlace): SavedPlace | null {
  const name = clean(place.name).slice(0, 160)
  const address = clean(place.address).slice(0, 300)
  const category = clean(place.category).slice(0, 80) || 'Outros'
  if (!name || !address || /^buscar pelo nome$/i.test(address)) return null
  return { name, address, category }
}

export function collectTripLocations(trip: Trip): SavedPlace[] {
  const candidates = [
    ...(trip.locations ?? []),
    ...trip.days.flatMap(placesFromDay),
  ]
  const deduped = new Map<string, SavedPlace>()

  for (const candidate of candidates) {
    const place = normalizePlace(candidate)
    if (!place) continue
    const key = `${place.name}|${place.address}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
    if (!deduped.has(key)) deduped.set(key, place)
  }

  return [...deduped.values()].sort((a, b) => {
    const category = a.category.localeCompare(b.category, 'pt-BR')
    return category || a.name.localeCompare(b.name, 'pt-BR')
  })
}

export type PlaceGroup = {
  category: string
  places: SavedPlace[]
}

export function groupTripLocations(trip: Trip): PlaceGroup[] {
  const groups = new Map<string, SavedPlace[]>()
  for (const place of collectTripLocations(trip)) {
    const group = groups.get(place.category) ?? []
    group.push(place)
    groups.set(place.category, group)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([category, places]) => ({
      category,
      places: places.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    }))
}
