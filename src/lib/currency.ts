/** Taxa fixa usada na viagem (USD → BRL). */
export const USD_BRL_RATE = 5.15

export function usdToBrl(usd: number): number {
  return Math.round(usd * USD_BRL_RATE * 100) / 100
}

export function brlToUsd(brl: number): number {
  return Math.round((brl / USD_BRL_RATE) * 100) / 100
}
