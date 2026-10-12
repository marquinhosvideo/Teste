export type ExpenseCategory =
  | 'alimentacao'
  | 'transporte'
  | 'hospedagem'
  | 'atividades'
  | 'compras'
  | 'outros'

export type Activity = {
  id: string
  time?: string
  title: string
  location?: string
  notes?: string
  done: boolean
}

export type Day = {
  id: string
  date: string
  label: string
  activities: Activity[]
}

export type Expense = {
  id: string
  dayId: string
  category: ExpenseCategory
  description: string
  amount: number
  createdAt: string
}

export type Trip = {
  name: string
  destination: string
  startDate: string
  endDate: string
  currency: string
  days: Day[]
  expenses: Expense[]
}

export type TabId = 'hoje' | 'roteiro' | 'gastos' | 'importar'

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  hospedagem: 'Hospedagem',
  atividades: 'Atividades',
  compras: 'Compras',
  outros: 'Outros',
}

export const CATEGORY_ORDER: ExpenseCategory[] = [
  'alimentacao',
  'transporte',
  'hospedagem',
  'atividades',
  'compras',
  'outros',
]
