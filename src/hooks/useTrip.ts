import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BudgetId, Expense, Trip } from '../types'
import { loadTrip, resetTrip, saveTrip } from '../lib/storage'
import { uid } from '../lib/format'

export function useTrip() {
  const [trip, setTrip] = useState<Trip>(() => loadTrip())

  useEffect(() => {
    saveTrip(trip)
  }, [trip])

  const replaceTrip = useCallback((next: Trip) => {
    setTrip(next)
  }, [])

  const resetToSample = useCallback(() => {
    setTrip(resetTrip())
  }, [])

  const toggleActivity = useCallback((dayId: string, activityId: string) => {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              activities: day.activities.map((act) =>
                act.id === activityId ? { ...act, done: !act.done } : act,
              ),
            },
      ),
    }))
  }, [])

  const addExpense = useCallback(
    (input: {
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
    },
    [],
  )

  const removeExpense = useCallback((expenseId: string) => {
    setTrip((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }))
  }, [])

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
    replaceTrip,
    resetToSample,
    toggleActivity,
    addExpense,
    removeExpense,
  }
}
