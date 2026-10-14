/** Fotos de referência por data do roteiro (Unsplash). */
const DAY_PHOTO_IDS: Record<string, string> = {
  // Viagem — Rio
  '2026-11-27': 'photo-1772603503638-74ca65f96589',
  // Viagem + Miami
  '2026-11-28': 'photo-1748380868700-b2a0db629701',
  // Disney Springs / compras
  '2026-11-29': 'photo-1441986300917-64674bd600d8',
  // Parque — Magic Kingdom
  '2026-11-30': 'photo-1620055155785-2fc4acd747cb',
  // Outlets / beleza
  '2026-12-01': 'photo-1483985988355-763728e1935b',
  // Parque — Animal Kingdom
  '2026-12-02': 'photo-1661738600957-3c84dfe7a517',
  // Parque — Hollywood Studios / Tower of Terror
  '2026-12-03': 'photo-1489368066883-369c64aa01bd',
  // ICON Park / roda-gigante
  '2026-12-04': 'photo-1667135550738-d6159a4b402a',
  // Florida Mall / compras
  '2026-12-05': 'photo-1555529669-e69e7aa0ba9a',
  // Parque (festa) — castelo + fogos
  '2026-12-06': 'photo-1551454211-35c47de27645',
  // Descanso — resort
  '2026-12-07': 'photo-1540541338287-41700207dee6',
  // Compras + mercado + beleza
  '2026-12-08': 'photo-1542838132-92c53300491e',
  // Parque — Universal / Epic vibe
  '2026-12-09': 'photo-1616097970275-1e187b4ce59f',
  // Chef Mickey's / refeição especial
  '2026-12-10': 'photo-1414235077428-338989a2e8c0',
  // Outlets
  '2026-12-11': 'photo-1445205170230-053b83016050',
  // Winter Garden / passeio
  '2026-12-12': 'photo-1449824913935-59a10b8d2000',
  // Viagem — avião
  '2026-12-13': 'photo-1436491865332-7a61a109cc05',
  // Viagem — Rio
  '2026-12-14': 'photo-1758358042850-b5422ce2b661',
}

export type PhotoCrop = 'portrait' | 'landscape'

function unsplashUrl(id: string, crop: PhotoCrop = 'landscape'): string {
  const size =
    crop === 'portrait'
      ? 'w=1200&h=1500&fit=crop'
      : 'w=2000&h=1125&fit=crop'
  return `https://images.unsplash.com/${id}?auto=format&${size}&q=80`
}

/** Mapa estático (landscape) — útil para pré-visualização / fallback. */
export const DAY_PHOTOS: Record<string, string> = Object.fromEntries(
  Object.entries(DAY_PHOTO_IDS).map(([date, id]) => [date, unsplashUrl(id, 'landscape')]),
)

export function photoForDay(dateIso: string, crop: PhotoCrop = 'landscape'): string | undefined {
  const id = DAY_PHOTO_IDS[dateIso]
  return id ? unsplashUrl(id, crop) : undefined
}
