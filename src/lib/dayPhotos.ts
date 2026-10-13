/** Fotos de referência por data do roteiro (Wikimedia Commons). */
export const DAY_PHOTOS: Record<string, string> = {
  '2026-11-27':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Riodejaneiro_aerea_aeroportogaleao-131756%28cut%29.jpg/1280px-Riodejaneiro_aerea_aeroportogaleao-131756%28cut%29.jpg',
  '2026-11-28':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Aerial_view_of_Miami_International_Airport_in_2026.jpg/1280px-Aerial_view_of_Miami_International_Airport_in_2026.jpg',
  '2026-11-29':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Disney_Springs_Ariel_View.jpg/1280px-Disney_Springs_Ariel_View.jpg',
  '2026-11-30':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Cinderella_Castle%2C_Magic_Kingdom_%282026%29.jpg/1280px-Cinderella_Castle%2C_Magic_Kingdom_%282026%29.jpg',
  '2026-12-01':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Orlando_Premium_Outlets_-_panoramio_%285%29.jpg/1280px-Orlando_Premium_Outlets_-_panoramio_%285%29.jpg',
  '2026-12-02':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Tree_of_Life%2C_Disney%27s_Animal_Kingdom.jpg/1280px-Tree_of_Life%2C_Disney%27s_Animal_Kingdom.jpg',
  '2026-12-03':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Twilight_Zone_Tower_of_Terror%2C_2024.jpg/1280px-The_Twilight_Zone_Tower_of_Terror%2C_2024.jpg',
  '2026-12-04':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/ICON_Park_green_overview.jpg/1280px-ICON_Park_green_overview.jpg',
  '2026-12-05':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/The_Florida_Mall_west_entrance_near_Macy%27s.jpg/1280px-The_Florida_Mall_west_entrance_near_Macy%27s.jpg',
  '2026-12-06':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Cinderella_Castle%2C_Magic_Kingdom_%282026%29.jpg/1280px-Cinderella_Castle%2C_Magic_Kingdom_%282026%29.jpg',
  '2026-12-07':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Orlando_Mizell-Leu_House_Hist_Dist01.jpg/1280px-Orlando_Mizell-Leu_House_Hist_Dist01.jpg',
  '2026-12-08':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Orlando%2C_Florida_%28cropped%29.jpg/1280px-Orlando%2C_Florida_%28cropped%29.jpg',
  '2026-12-09':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Chronos_Tower_Front_Epic_Universe.jpg/1280px-Chronos_Tower_Front_Epic_Universe.jpg',
  '2026-12-10':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Disney%27s_Contemporary_Resort_Arriving_Monorail_Teal.jpg/1280px-Disney%27s_Contemporary_Resort_Arriving_Monorail_Teal.jpg',
  '2026-12-11':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Orlando_Premium_Outlets_-_panoramio_%285%29.jpg/1280px-Orlando_Premium_Outlets_-_panoramio_%285%29.jpg',
  '2026-12-12':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Downtown_Winter_Garden_%28Plant_Street_-_June_10%2C_2024%29.jpg/1280px-Downtown_Winter_Garden_%28Plant_Street_-_June_10%2C_2024%29.jpg',
  '2026-12-13':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Aerial_view_of_Miami_International_Airport_in_2026.jpg/1280px-Aerial_view_of_Miami_International_Airport_in_2026.jpg',
  '2026-12-14':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Riodejaneiro_aerea_aeroportogaleao-131756%28cut%29.jpg/1280px-Riodejaneiro_aerea_aeroportogaleao-131756%28cut%29.jpg',
}

export function photoForDay(dateIso: string): string | undefined {
  return DAY_PHOTOS[dateIso]
}
