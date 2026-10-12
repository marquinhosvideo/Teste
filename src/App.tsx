import { useState } from 'react'
import { CalendarDays, Home, Lightbulb, Receipt, Upload } from 'lucide-react'
import type { TabId } from './types'
import { useAuth } from './hooks/useAuth'
import { useTrip } from './hooks/useTrip'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthScreen } from './components/AuthScreen'
import { BudgetWidgets } from './components/BudgetWidgets'
import { SetupBanner } from './components/SetupBanner'
import { SyncBadge } from './components/SyncBadge'
import { UpdatePasswordScreen } from './components/UpdatePasswordScreen'
import { TodayView } from './views/TodayView'
import { ItineraryView } from './views/ItineraryView'
import { ExpensesView } from './views/ExpensesView'
import { TipsView } from './views/TipsView'
import { ImportView } from './views/ImportView'
import './App.css'

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'hoje', label: 'Hoje', icon: Home },
  { id: 'roteiro', label: 'Roteiro', icon: CalendarDays },
  { id: 'gastos', label: 'Gastos', icon: Receipt },
  { id: 'dicas', label: 'Dicas', icon: Lightbulb },
  { id: 'importar', label: 'Excel', icon: Upload },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('hoje')
  const auth = useAuth()
  const remoteEnabled = isSupabaseConfigured && Boolean(auth.session)
  const {
    trip,
    activeDay,
    syncState,
    syncError,
    replaceTrip,
    resetToSample,
    toggleActivity,
    addExpense,
    removeExpense,
  } = useTrip(remoteEnabled)

  if (isSupabaseConfigured && !auth.ready) {
    return (
      <div className="app-shell">
        <main className="app-main">
          <p className="muted">Carregando…</p>
        </main>
      </div>
    )
  }

  if (isSupabaseConfigured && !auth.session) {
    return (
      <div className="app-shell">
        <AuthScreen
          error={auth.error}
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
        />
      </div>
    )
  }

  if (isSupabaseConfigured && auth.session && auth.needsPasswordReset) {
    return (
      <div className="app-shell">
        <UpdatePasswordScreen
          email={auth.user?.email}
          onSubmit={auth.updatePassword}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {!isSupabaseConfigured ? <SetupBanner /> : null}

        <SyncBadge
          state={syncState}
          error={syncError}
          email={auth.user?.email}
          onSignOut={isSupabaseConfigured ? () => void auth.signOut() : undefined}
        />

        <BudgetWidgets trip={trip} />

        {tab === 'hoje' && activeDay ? (
          <TodayView trip={trip} day={activeDay} onToggle={toggleActivity} />
        ) : null}
        {tab === 'roteiro' ? (
          <ItineraryView
            trip={trip}
            initialDayId={activeDay?.id}
            onToggle={toggleActivity}
          />
        ) : null}
        {tab === 'gastos' && activeDay ? (
          <ExpensesView
            trip={trip}
            defaultDayId={activeDay.id}
            onAdd={addExpense}
            onRemove={removeExpense}
          />
        ) : null}
        {tab === 'dicas' ? <TipsView tips={trip.tips} /> : null}
        {tab === 'importar' ? (
          <ImportView
            trip={trip}
            onImported={(next) => {
              // Mantém gastos/checks já sincronizados na nuvem
              const checkMap = new Map<string, boolean>()
              for (const day of trip.days) {
                for (const act of day.activities) checkMap.set(act.id, act.done)
              }
              replaceTrip({
                ...next,
                expenses: trip.expenses,
                days: next.days.map((day) => ({
                  ...day,
                  activities: day.activities.map((act) => ({
                    ...act,
                    done: checkMap.get(act.id) ?? act.done,
                  })),
                })),
              })
            }}
            onReset={resetToSample}
          />
        ) : null}
      </main>

      <nav className="tab-bar" aria-label="Navegação principal">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`tab-bar__btn ${tab === id ? 'tab-bar__btn--active' : ''}`}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            aria-label={label}
            data-tab={id}
          >
            <Icon size={18} strokeWidth={tab === id ? 2.25 : 1.75} aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
