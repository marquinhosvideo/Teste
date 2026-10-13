import type { Budget, BudgetId, Expense, Trip } from '../types'
import { BUDGETS } from '../types'

export function getBudgets(trip: Trip): Budget[] {
  return BUDGETS.map((b) => ({
    ...b,
    limit: trip.budgetLimits?.[b.id] ?? b.limit,
  }))
}

export function spentByBudget(expenses: Expense[]): Record<BudgetId, number> {
  const map = Object.fromEntries(BUDGETS.map((b) => [b.id, 0])) as Record<
    BudgetId,
    number
  >
  for (const e of expenses) {
    const key = normalizeBudgetId(e.budgetId ?? (e as { category?: string }).category)
    if (key) map[key] += e.amount
  }
  return map
}

export function budgetPercent(spent: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(999, (spent / limit) * 100)
}

/** Aceita ids novos e categorias antigas do localStorage */
export function normalizeBudgetId(value: unknown): BudgetId | null {
  const key = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const map: Record<string, BudgetId> = {
    marcos: 'marcos',
    dielen: 'dielen',
    helena: 'helena',
    alimentacao: 'alimentacao',
    outros: 'outros',
    // legado
    transporte: 'outros',
    hospedagem: 'outros',
    atividades: 'outros',
    compras: 'outros',
  }
  return map[key] ?? null
}
