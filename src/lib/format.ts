import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatMoney(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDayLabel(dateIso: string): string {
  const date = parseISO(dateIso)
  if (!isValid(date)) return dateIso
  return format(date, "EEE, d 'de' MMM", { locale: ptBR })
}

export function formatShortDate(dateIso: string): string {
  const date = parseISO(dateIso)
  if (!isValid(date)) return dateIso
  return format(date, 'dd/MM', { locale: ptBR })
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function parseAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return 0
  const cleaned = value
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
