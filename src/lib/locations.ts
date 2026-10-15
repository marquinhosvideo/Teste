import type { Day, SavedPlace, Trip } from '../types'
import { parseDayMeta } from './dayMeta'

export const PLACE_SECTIONS = ['Alimentação', 'Compras', 'Lazer'] as const
export type PlaceSection = (typeof PLACE_SECTIONS)[number]

const FOOD_NAME = /\b(caf[eé]|chef|restaurant|dining)\b/i
const LEISURE_BEFORE_STORE = /\b(play park|ticket center|crayola experience)\b/i
const LEISURE_OVERRIDE =
  /\b(disney springs|icon park|magic kingdom|animal kingdom|hollywood studios|epic universe|gatorland|peppa|theme park)\b/i
const STORE_NAME =
  /\b(best buy|apple store|micro center|walmart|target|five below|burlington|marshalls|nordstrom|ross|t\.?\s*j\.?\s*maxx|ulta|beauty|outlets?|factory stores?|sawgrass|dolphin mall|buybuy|baby|mall|crayola store|old town|world of disney)\b/i
const LEISURE_NAME =
  /\b(universal|leu gardens|lake eola|celebration|winter garden|plant st|farmers market|science center|sea life|kennedy|cocoa beach|gaylord|now snowing|splash|boat tour|aquarium|gingerbread|resort hopping|aeroporto|airport)\b/i

function clean(value: string): string {
  return value
    .replace(/[⭐*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function isFood(name: string, category: string, context: string): boolean {
  if (/^aliment/.test(fold(category))) return true
  if (FOOD_NAME.test(name)) return true
  return (
    /refei[cç][aã]o|alimenta|chef|caf[eé]|jantar|almo[cç]o/i.test(context) &&
    /\b(resort|hotel|chef|caf[eé]|restaurant)\b/i.test(name)
  )
}

function isLeisureCategory(category: string): boolean {
  return /^(parque|passeio|centrinho|hospedagem|aeroporto|lazer|outros)\b/.test(fold(category))
}

function isShoppingCategory(category: string): boolean {
  return /(compra|shopping|beleza|bebe|loja|off-price|outlet|variedade|rua de loja|moda|eletronico)/.test(
    fold(category),
  )
}

export function classifyPlace(
  name: string,
  category = '',
  context = '',
): PlaceSection {
  if (isFood(name, category, context)) return 'Alimentação'
  if (LEISURE_BEFORE_STORE.test(name)) return 'Lazer'
  if (STORE_NAME.test(name)) return 'Compras'
  if (LEISURE_OVERRIDE.test(name) || LEISURE_NAME.test(name) || isLeisureCategory(category)) {
    return 'Lazer'
  }
  if (isShoppingCategory(category)) return 'Compras'
  if (/\b(compras|mercado|beleza|outlet)\b/i.test(context) && context.length <= 40) {
    return 'Compras'
  }
  return 'Lazer'
}

export function inferPlaceCategory(name: string, context = ''): string {
  const category = context.length <= 40 ? context : ''
  const dayContext = category ? '' : context
  return classifyPlace(name, category, dayContext)
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
  category: PlaceSection
  places: SavedPlace[]
}

export function groupTripLocations(trip: Trip): PlaceGroup[] {
  const sections = new Map<PlaceSection, SavedPlace[]>()

  for (const place of collectTripLocations(trip)) {
    const section = classifyPlace(place.name, place.category)
    const sectionPlaces = sections.get(section) ?? []
    sectionPlaces.push(place)
    sections.set(section, sectionPlaces)
  }

  return PLACE_SECTIONS.flatMap((category) => {
    const places = sections.get(category)
    if (!places?.length) return []
    return [
      {
        category,
        places: places.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
      },
    ]
  })
}
