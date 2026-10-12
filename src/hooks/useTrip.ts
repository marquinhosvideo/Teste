import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BudgetId, Expense, Trip } from '../types'
import { loadTrip, resetTrip, saveTrip } from '../lib/storage'
import { uid } from '../lib/format'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  applyRemoteToTrip,
  deleteExpenseRemote,
  fetchRemoteState,
  subscribeRemote,
  upsertCheck,
  upsertExpense,
} from '../lib/remoteSync'

export type SyncState = 'local' | 'loading' | 'synced' | 'saving' | 'error'

export function useTrip(enabled = true) {
  const [trip, setTrip] = useState<Trip>(() => loadTrip())
  const [syncState, setSyncState] = useState<SyncState>(
    isSupabaseConfigured ? 'loading' : 'local',
  )
  const [syncError, setSyncError] = useState<string | null>(null)
  const tripRef = useRef(trip)
  tripRef.current = trip

  useEffect(() => {
    saveTrip(trip)
  }, [trip])

  // Pull + realtime when logged in / enabled
  useEffect(() => {
    if (!enabled || !isSupabaseConfigured) {
      setSyncState(isSupabaseConfigured ? 'loading' : 'local')
      return
    }

    let cancelled = false
    setSyncState('loading')

    void (async () => {
      try {
        const remote = await fetchRemoteState()
        if (cancelled) return
        setTrip((prev) => applyRemoteToTrip(prev, remote.checks, remote.expenses))
        setSyncState('synced')
        setSyncError(null)
      } catch (err) {
        if (cancelled) return
        setSyncState('error')
        setSyncError(err instanceof Error ? err.message : 'Falha ao sincronizar')
      }
    })()

    const unsubscribe = subscribeRemote((change) => {
      setTrip((prev) => {
        if (change.type === 'check') {
          return {
            ...prev,
            days: prev.days.map((day) => ({
              ...day,
              activities: day.activities.map((act) =>
                act.id === change.activityId ? { ...act, done: change.done } : act,
              ),
            })),
          }
        }
        if (change.type === 'expense_delete') {
          return {
            ...prev,
            expenses: prev.expenses.filter((e) => e.id !== change.expenseId),
          }
        }
        const others = prev.expenses.filter((e) => e.id !== change.expense.id)
        return { ...prev, expenses: [change.expense, ...others] }
      })
      setSyncState('synced')
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [enabled])

  const replaceTrip = useCallback((next: Trip) => {
    setTrip(next)
  }, [])

  const resetToSample = useCallback(() => {
    setTrip(resetTrip())
  }, [])

  const toggleActivity = useCallback(async (dayId: string, activityId: string) => {
    const current = tripRef.current.days
      .find((d) => d.id === dayId)
      ?.activities.find((a) => a.id === activityId)
    if (!current) return
    const nextDone = !current.done

    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              activities: day.activities.map((act) =>
                act.id === activityId ? { ...act, done: nextDone } : act,
              ),
            },
      ),
    }))

    if (!isSupabaseConfigured || !enabled) return
    setSyncState('saving')
    try {
      await upsertCheck(activityId, nextDone)
      setSyncState('synced')
      setSyncError(null)
    } catch (err) {
      setSyncState('error')
      setSyncError(err instanceof Error ? err.message : 'Falha ao salvar check')
    }
  }, [enabled])

  const addExpense = useCallback(
    async (input: {
      dayId: string
      budgetId: BudgetId
      description: string
      amount: number
    }) => {
      const expense: Expense = {
        id: uid('exp'),
        dayId: input.dayId,
        budgetId: input.budgetId,
        description: input.description.trim(),
        amount: input.amount,
        createdAt: new Date().toISOString(),
      }
      setTrip((prev) => ({
        ...prev,
        expenses: [expense, ...prev.expenses],
      }))

      if (!isSupabaseConfigured || !enabled) return
      setSyncState('saving')
      try {
        await upsertExpense(expense)
        setSyncState('synced')
        setSyncError(null)
      } catch (err) {
        setSyncState('error')
        setSyncError(err instanceof Error ? err.message : 'Falha ao salvar gasto')
      }
    },
    [enabled],
  )

  const removeExpense = useCallback(async (expenseId: string) => {
    setTrip((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }))

    if (!isSupabaseConfigured || !enabled) return
    setSyncState('saving')
    try {
      await deleteExpenseRemote(expenseId)
      setSyncState('synced')
      setSyncError(null)
    } catch (err) {
      setSyncState('error')
      setSyncError(err instanceof Error ? err.message : 'Falha ao remover gasto')
    }
  }, [enabled])

  const todayIso = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [])

  const activeDay = useMemo(() => {
    const match = trip.days.find((d) => d.date === todayIso)
    if (match) return match
    const unfinished = trip.days.find((d) => d.activities.some((a) => !a.done))
    return unfinished ?? trip.days[0]
  }, [trip.days, todayIso])

  return {
    trip,
    activeDay,
    todayIso,
    syncState,
    syncError,
    replaceTrip,
    resetToSample,
    toggleActivity,
    addExpense,
    removeExpense,
  }
}
