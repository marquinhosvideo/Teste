import type { WorkSheet } from 'xlsx'
import type { Activity, Day, Expense, ExpenseCategory, Tip, Trip } from '../types'
import { parseAmount, uid } from './format'

type XLSXModule = typeof import('xlsx')

async function loadXlsx(): Promise<XLSXModule> {
  return import('xlsx')
}

const CATEGORY_MAP: Record<string, ExpenseCategory> = {
  alimentacao: 'alimentacao',
  alimentação: 'alimentacao',
  comida: 'alimentacao',
  refeicao: 'alimentacao',
  refeição: 'alimentacao',
  transporte: 'transporte',
  uber: 'transporte',
  taxi: 'transporte',
  táxi: 'transporte',
  combustivel: 'transporte',
  combustível: 'transporte',
  carro: 'transporte',
  pedágio: 'transporte',
  pedagio: 'transporte',
  hospedagem: 'hospedagem',
  hotel: 'hospedagem',
  pousada: 'hospedagem',
  atividades: 'atividades',
  passeio: 'atividades',
  ingresso: 'atividades',
  turismo: 'atividades',
  parque: 'atividades',
  disney: 'atividades',
  compras: 'compras',
  souvenir: 'compras',
  lembranca: 'compras',
  lembrança: 'compras',
  outlet: 'compras',
  outros: 'outros',
  outro: 'outros',
  misc: 'outros',
}

type Row = Record<string, unknown>

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function clean(value: unknown): string {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function isEmptyPeriod(value: unknown): boolean {
  const t = clean(value)
  return !t || t === '—' || t === '-'
}

function excelDateToIso(value: unknown, XLSX: XLSXModule, defaultYear = 2026): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null
    const mm = String(parsed.m).padStart(2, '0')
    const dd = String(parsed.d).padStart(2, '0')
    return `${parsed.y}-${mm}-${dd}`
  }
  const text = String(value).trim()
  const br = text.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/)
  if (br) {
    const day = br[1].padStart(2, '0')
    const month = br[2].padStart(2, '0')
    const year = br[3]
      ? br[3].length === 2
        ? `20${br[3]}`
        : br[3]
      : String(defaultYear)
    return `${year}-${month}-${day}`
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  return null
}

function mapCategory(value: unknown): ExpenseCategory {
  const key = normalizeHeader(value)
  return CATEGORY_MAP[key] ?? 'outros'
}

function formatTime(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 24 * 60)
    const h = Math.floor(totalMinutes / 60) % 24
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const text = String(value).trim()
  const match = text.match(/^(\d{1,2}):(\d{2})/)
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`
  return text
}

function sheetToRows(XLSX: XLSXModule, sheet: WorkSheet): Row[] {
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })
}

function pick(row: Row, keys: string[]): unknown {
  const entries = Object.entries(row)
  for (const key of keys) {
    const found = entries.find(([k]) => normalizeHeader(k) === key)
    if (found && found[1] !== '') return found[1]
  }
  return ''
}

function hasOrlandoColumns(rows: Row[]): boolean {
  if (!rows.length) return false
  const headers = Object.keys(rows[0]).map(normalizeHeader)
  return headers.includes('manha') && headers.includes('tarde') && headers.includes('noite')
}

function periodTitle(period: string, text: string): string {
  const line = text.split('\n')[0]
  const body = line.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s⭐]*\s*/u, '')
  const short = body.length > 100 ? `${body.slice(0, 97)}…` : body
  return `${period} — ${short}`
}

function buildOrlandoDays(rows: Row[], XLSX: XLSXModule): Day[] {
  const days: Day[] = []

  for (const row of rows) {
    const date = excelDateToIso(pick(row, ['data', 'date']), XLSX, 2026)
    if (!date) continue

    const label =
      clean(pick(row, ['tipo do dia', 'tipo'])) ||
      clean(pick(row, ['dia', 'label'])) ||
      `Dia ${days.length + 1}`

    const location = clean(
      pick(row, ['lugares e enderecos', 'lugares e endereços', 'local', 'endereco']),
    )
    const drive = clean(
      Object.entries(row).find(([k]) => normalizeHeader(k).includes('carro'))?.[1],
    )
    const kid = clean(
      Object.entries(row).find(([k]) => normalizeHeader(k).includes('crianca'))?.[1],
    )
    const obs = clean(
      pick(row, ['observacoes / horarios', 'observacoes', 'obs', 'notas']),
    )

    const dayNotes = [
      location && location !== '—' ? `📍 ${location}` : '',
      drive && drive !== '—' ? `🚗 ${drive}` : '',
      kid && kid !== '—' ? `👶 ${kid}` : '',
      obs && obs !== '—' ? `📝 ${obs}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    const periods: { key: string; time: string; keys: string[] }[] = [
      { key: 'Manhã', time: '09:00', keys: ['manha', 'manhã'] },
      { key: 'Tarde', time: '14:00', keys: ['tarde'] },
      { key: 'Noite', time: '19:00', keys: ['noite'] },
    ]

    const activities: Activity[] = []
    for (const period of periods) {
      const raw = pick(row, period.keys)
      if (isEmptyPeriod(raw)) continue
      const text = clean(raw)
      activities.push({
        id: uid('act'),
        time: period.time,
        title: periodTitle(period.key, text),
        location:
          location && location !== '—'
            ? location.split('|')[0].trim()
            : undefined,
        notes: text,
        done: false,
      })
    }

    if (!activities.length) continue

    days.push({
      id: uid('day'),
      date,
      label,
      dayNotes: dayNotes || undefined,
      activities,
    })
  }

  return days.sort((a, b) => a.date.localeCompare(b.date))
}

function buildDaysFromRows(rows: Row[], XLSX: XLSXModule): Day[] {
  if (hasOrlandoColumns(rows)) return buildOrlandoDays(rows, XLSX)

  const byDate = new Map<string, Day>()

  for (const row of rows) {
    const date = excelDateToIso(pick(row, ['data', 'date']), XLSX)
    const title = clean(
      pick(row, [
        'atividade',
        'atividade/programacao',
        'programacao',
        'titulo',
        'title',
        'item',
      ]),
    )
    if (!date || !title) continue

    if (!byDate.has(date)) {
      const label =
        clean(pick(row, ['dia', 'label', 'titulo do dia', 'nome do dia', 'tipo do dia'])) ||
        `Dia ${byDate.size + 1}`
      byDate.set(date, {
        id: uid('day'),
        date,
        label,
        activities: [],
      })
    }

    const day = byDate.get(date)!
    const diaCol = clean(pick(row, ['dia']))
    if (diaCol && !excelDateToIso(diaCol, XLSX)) day.label = diaCol
    const maybeLabel = clean(pick(row, ['label', 'titulo do dia', 'nome do dia', 'tipo do dia']))
    if (maybeLabel) day.label = maybeLabel

    day.activities.push({
      id: uid('act'),
      time: formatTime(pick(row, ['horario', 'hora', 'time'])),
      title,
      location: clean(pick(row, ['local', 'lugar', 'location', 'endereco'])) || undefined,
      notes: clean(pick(row, ['observacoes', 'obs', 'notas', 'notes', 'detalhes'])) || undefined,
      done: false,
    })
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function buildExpensesFromRows(
  rows: Row[],
  days: Day[],
  XLSX: XLSXModule,
): Expense[] {
  const dayByDate = new Map(days.map((d) => [d.date, d.id]))

  return rows
    .map((row) => {
      const date = excelDateToIso(pick(row, ['data', 'date']), XLSX)
      const description = clean(
        pick(row, ['descricao', 'descrição', 'description', 'item', 'gasto']),
      )
      const amount = parseAmount(
        pick(row, ['valor', 'amount', 'preco', 'preço', 'custo']),
      )
      if (!date || !description || amount <= 0) return null

      let dayId = dayByDate.get(date)
      if (!dayId) {
        const newDay: Day = {
          id: uid('day'),
          date,
          label: `Dia ${days.length + 1}`,
          activities: [],
        }
        days.push(newDay)
        dayByDate.set(date, newDay.id)
        dayId = newDay.id
      }

      return {
        id: uid('exp'),
        dayId,
        category: mapCategory(pick(row, ['categoria', 'category', 'tipo'])),
        description,
        amount,
        createdAt: new Date().toISOString(),
      } satisfies Expense
    })
    .filter((e): e is Expense => e != null)
}

function buildTips(rows: Row[]): Tip[] {
  return rows
    .map((row) => ({
      tema: clean(pick(row, ['tema', 'titulo', 'title'])),
      texto: clean(pick(row, ['dica / ressalva', 'dica', 'ressalva', 'texto', 'nota'])),
    }))
    .filter((t) => t.tema && t.texto)
}

export type ImportResult = {
  trip: Trip
  stats: { days: number; activities: number; expenses: number; tips: number }
}

export async function importTripFromFile(
  file: File,
  current: Trip,
): Promise<ImportResult> {
  const XLSX = await loadXlsx()
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })

  const sheetNames = workbook.SheetNames
  const roteiroName =
    sheetNames.find((n) =>
      /roteiro|itinerario|programacao|agenda|plano|completo/i.test(n),
    ) ?? sheetNames[0]
  const gastosName = sheetNames.find((n) =>
    /gasto|despesa|expense|custo|financeiro/i.test(n),
  )
  const tipsName = sheetNames.find((n) => /dica|ressalva/i.test(n))
  const metaName = sheetNames.find((n) => /viagem|trip|info|geral/i.test(n))

  const roteiroSheet = roteiroName ? workbook.Sheets[roteiroName] : undefined
  const gastosSheet = gastosName ? workbook.Sheets[gastosName] : undefined
  const tipsSheet = tipsName ? workbook.Sheets[tipsName] : undefined
  const metaSheet = metaName ? workbook.Sheets[metaName] : undefined

  const roteiroRows = roteiroSheet ? sheetToRows(XLSX, roteiroSheet) : []
  const days = buildDaysFromRows(roteiroRows, XLSX)

  if (!days.length) {
    throw new Error(
      'Não encontrei o roteiro. Na planilha Orlando use a aba “Roteiro completo” (Data, Manhã, Tarde, Noite).',
    )
  }

  const expenseRows = gastosSheet
    ? sheetToRows(XLSX, gastosSheet)
    : roteiroRows.filter((row) => {
        const valor = pick(row, ['valor', 'amount', 'preco', 'preço', 'custo'])
        const desc = pick(row, ['descricao', 'descrição', 'gasto'])
        return valor !== '' && desc !== ''
      })

  const expenses = buildExpensesFromRows(expenseRows, days, XLSX)
  const tips = tipsSheet ? buildTips(sheetToRows(XLSX, tipsSheet)) : current.tips

  const metaRows = metaSheet ? sheetToRows(XLSX, metaSheet) : []
  const meta = metaRows[0] ?? {}
  const looksOrlando = hasOrlandoColumns(roteiroRows)

  const trip: Trip = {
    name: looksOrlando
      ? 'Orlando 2026'
      : clean(pick(meta, ['nome', 'name', 'viagem'])) || current.name,
    destination: looksOrlando
      ? 'Orlando, Flórida · família'
      : clean(pick(meta, ['destino', 'destination', 'cidade'])) ||
        current.destination,
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    currency: looksOrlando
      ? 'USD'
      : clean(pick(meta, ['moeda', 'currency'])) || current.currency || 'BRL',
    days,
    expenses,
    tips,
  }

  return {
    trip,
    stats: {
      days: days.length,
      activities: days.reduce((sum, d) => sum + d.activities.length, 0),
      expenses: expenses.length,
      tips: tips?.length ?? 0,
    },
  }
}

export async function downloadTemplate(): Promise<void> {
  // Prefer the family's real Orlando workbook when available
  try {
    const res = await fetch('/Roteiro_Orlando_2026.xlsx')
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Roteiro_Orlando_2026.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      return
    }
  } catch {
    // fall through to generated template
  }

  const XLSX = await loadXlsx()
  const wb = XLSX.utils.book_new()
  const roteiro = [
    ['Data', 'Dia', 'Tipo do dia', 'Manhã', 'Tarde', 'Noite', 'Lugares e endereços', 'Observações / horários'],
    [
      '27/11',
      'Sex',
      '✈️ Viagem',
      '—',
      '—',
      '✈️ VIAGEM — Embarque',
      'Aeroporto',
      'Levar documentos',
    ],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(roteiro), 'Roteiro completo')
  XLSX.writeFile(wb, 'modelo-roteiro-familia.xlsx')
}
