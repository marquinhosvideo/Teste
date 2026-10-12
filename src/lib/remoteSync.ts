import type { BudgetId, Expense, Trip } from '../types'
import { normalizeBudgetId } from './budgets'
import { supabase } from './supabase'

type CheckRow = {
  activity_id: string
  done: boolean
  updated_at: string
}

type ExpenseRow = {
  id: string
  day_id: string
  budget_id: string
  description: string
  amount: number | string
  created_at: string
}

export async function fetchRemoteState(): Promise<{
  checks: Record<string, boolean>
  expenses: Expense[]
}> {
  if (!supabase) return { checks: {}, expenses: [] }

  const [checksRes, expensesRes] = await Promise.all([
    supabase.from('activity_checks').select('activity_id, done'),
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
  ])

  if (checksRes.error) throw checksRes.error
  if (expensesRes.error) throw expensesRes.error

  const checks: Record<string, boolean> = {}
  for (const row of (checksRes.data ?? []) as CheckRow[]) {
    checks[row.activity_id] = Boolean(row.done)
  }

  const expenses = ((expensesRes.data ?? []) as ExpenseRow[])
    .map(rowToExpense)
    .filter((e): e is Expense => e != null)

  return { checks, expenses }
}

export function applyRemoteToTrip(
  trip: Trip,
  checks: Record<string, boolean>,
  expenses: Expense[],
): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => ({
      ...day,
      activities: day.activities.map((act) => ({
        ...act,
        done: checks[act.id] ?? act.done,
      })),
    })),
    expenses,
  }
}

export async function upsertCheck(activityId: string, done: boolean): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('activity_checks').upsert({
    activity_id: activityId,
    done,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function upsertExpense(expense: Expense): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('expenses').upsert({
    id: expense.id,
    day_id: expense.dayId,
    budget_id: expense.budgetId,
    description: expense.description,
    amount: expense.amount,
    created_at: expense.createdAt,
  })
  if (error) throw error
}

export async function deleteExpenseRemote(expenseId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
  if (error) throw error
}

function rowToExpense(row: ExpenseRow): Expense | null {
  const budgetId = normalizeBudgetId(row.budget_id)
  const amount = Number(row.amount)
  if (!budgetId || !Number.isFinite(amount)) return null
  return {
    id: row.id,
    dayId: row.day_id,
    budgetId: budgetId as BudgetId,
    description: row.description,
    amount,
    createdAt: row.created_at,
  }
}

export type RemoteChange =
  | { type: 'check'; activityId: string; done: boolean }
  | { type: 'expense_upsert'; expense: Expense }
  | { type: 'expense_delete'; expenseId: string }

export function subscribeRemote(
  onChange: (change: RemoteChange) => void,
): () => void {
  if (!supabase) return () => undefined

  const channel = supabase
    .channel('roteiro-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'activity_checks' },
      (payload) => {
        const row = (payload.new ?? payload.old) as CheckRow | undefined
        if (!row?.activity_id) return
        if (payload.eventType === 'DELETE') {
          onChange({ type: 'check', activityId: row.activity_id, done: false })
          return
        }
        onChange({
          type: 'check',
          activityId: row.activity_id,
          done: Boolean((payload.new as CheckRow).done),
        })
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'expenses' },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          const old = payload.old as ExpenseRow
          if (old?.id) onChange({ type: 'expense_delete', expenseId: old.id })
          return
        }
        const expense = rowToExpense(payload.new as ExpenseRow)
        if (expense) onChange({ type: 'expense_upsert', expense })
      },
    )
    .subscribe()

  return () => {
    void supabase?.removeChannel(channel)
  }
}
