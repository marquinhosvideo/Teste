import type { WorkSheet } from 'xlsx'
import type { Activity, Day, Expense, ExpenseCategory, Trip } from '../types'
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
  hospedagem: 'hospedagem',
  hotel: 'hospedagem',
  pousada: 'hospedagem',
  atividades: 'atividades',
  passeio: 'atividades',
  ingresso: 'atividades',
  turismo: 'atividades',
  compras: 'compras',
  souvenir: 'compras',
  lembranca: 'compras',
  lembrança: 'compras',
  outros: 'outros',
  outro: 'outros',
  misc: 'outros',
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function excelDateToIso(value: unknown, XLSX: XLSXModule): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null
    const mm = String(parsed.m).padStart(2, '0')
    const dd = String(parsed.d).padStart(2, '0')
    return `${parsed.y}-${mm}-${dd}`
  }
  const text = String(value).trim()
  const br = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (br) {
    const day = br[1].padStart(2, '0')
    const month = br[2].padStart(2, '0')
    const year = br[3].length === 2 ? `20${br[3]}` : br[3]
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

type Row = Record<string, unknown>

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

function buildDaysFromRows(rows: Row[], XLSX: XLSXModule): Day[] {
  const byDate = new Map<string, Day>()

  for (const row of rows) {
    const date = excelDateToIso(pick(row, ['data', 'date']), XLSX)
    const title = String(
      pick(row, [
        'atividade',
        'atividade/programacao',
        'programacao',
        'titulo',
        'title',
        'item',
      ]) ?? '',
    ).trim()
    if (!date || !title) continue

    if (!byDate.has(date)) {
      const label =
        String(
          pick(row, ['dia', 'label', 'titulo do dia', 'nome do dia']) ?? '',
        ).trim() || `Dia ${byDate.size + 1}`
      byDate.set(date, {
        id: uid('day'),
        date,
        label,
        activities: [],
      })
    }

    const day = byDate.get(date)!
    const maybeLabel = String(
      pick(row, ['label', 'titulo do dia', 'nome do dia']) ?? '',
    ).trim()
    if (maybeLabel) day.label = maybeLabel
    // If "Dia" column looks like a label (not a date), keep/update it
    const diaCol = String(pick(row, ['dia']) ?? '').trim()
    if (diaCol && !excelDateToIso(diaCol, XLSX)) day.label = diaCol

    const activity: Activity = {
      id: uid('act'),
      time: formatTime(pick(row, ['horario', 'hora', 'time'])),
      title,
      location:
        String(pick(row, ['local', 'lugar', 'location', 'endereco']) ?? '').trim() ||
        undefined,
      notes:
        String(
          pick(row, ['observacoes', 'obs', 'notas', 'notes', 'detalhes']) ?? '',
        ).trim() || undefined,
      done: false,
    }
    day.activities.push(activity)
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
      const description = String(
        pick(row, ['descricao', 'descrição', 'description', 'item', 'gasto']) ??
          '',
      ).trim()
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

export type ImportResult = {
  trip: Trip
  stats: { days: number; activities: number; expenses: number }
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
      /roteiro|itinerario|programacao|agenda|plano/i.test(n),
    ) ?? sheetNames[0]
  const gastosName = sheetNames.find((n) =>
    /gasto|despesa|expense|custo|financeiro/i.test(n),
  )
  const metaName = sheetNames.find((n) => /viagem|trip|info|geral/i.test(n))

  const roteiroSheet = roteiroName ? workbook.Sheets[roteiroName] : undefined
  const gastosSheet = gastosName ? workbook.Sheets[gastosName] : undefined
  const metaSheet = metaName ? workbook.Sheets[metaName] : undefined

  const roteiroRows = roteiroSheet ? sheetToRows(XLSX, roteiroSheet) : []
  const days = buildDaysFromRows(roteiroRows, XLSX)

  if (!days.length) {
    throw new Error(
      'Não encontrei atividades no arquivo. Use colunas: Data, Atividade (e opcionalmente Horário, Local, Observações).',
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

  const metaRows = metaSheet ? sheetToRows(XLSX, metaSheet) : []
  const meta = metaRows[0] ?? {}

  const trip: Trip = {
    name:
      String(pick(meta, ['nome', 'name', 'viagem']) || current.name).trim() ||
      current.name,
    destination:
      String(
        pick(meta, ['destino', 'destination', 'cidade']) || current.destination,
      ).trim() || current.destination,
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    currency: String(
      pick(meta, ['moeda', 'currency']) || current.currency || 'BRL',
    ),
    days,
    expenses,
  }

  return {
    trip,
    stats: {
      days: days.length,
      activities: days.reduce((sum, d) => sum + d.activities.length, 0),
      expenses: expenses.length,
    },
  }
}

export async function downloadTemplate(): Promise<void> {
  const XLSX = await loadXlsx()
  const wb = XLSX.utils.book_new()

  const roteiro = [
    ['Data', 'Dia', 'Horário', 'Atividade', 'Local', 'Observações'],
    ['10/07/2026', 'Chegada', '08:00', 'Saída de casa', 'Aeroporto', 'Documentos'],
    ['10/07/2026', 'Chegada', '16:00', 'Check-in', 'Pousada', ''],
    ['11/07/2026', 'Passeios', '10:00', 'Mini Mundo', 'Gramado', 'Ingressos online'],
    ['11/07/2026', 'Passeios', '19:00', 'Jantar', 'Centro', ''],
  ]
  const gastos = [
    ['Data', 'Categoria', 'Descrição', 'Valor'],
    ['10/07/2026', 'Transporte', 'Uber aeroporto', 85],
    ['10/07/2026', 'Alimentação', 'Almoço na estrada', 120],
    ['11/07/2026', 'Atividades', 'Ingressos Mini Mundo', 250],
  ]
  const info = [
    ['Nome', 'Destino', 'Moeda'],
    ['Férias em Família', 'Gramado & Canela', 'BRL'],
  ]

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(roteiro), 'Roteiro')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(gastos), 'Gastos')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(info), 'Viagem')
  XLSX.writeFile(wb, 'modelo-roteiro-familia.xlsx')
}
