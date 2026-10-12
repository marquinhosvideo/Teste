import { useState } from 'react'
import { CalendarDays, Home, Receipt, Upload } from 'lucide-react'
import type { TabId } from './types'
import { useTrip } from './hooks/useTrip'
import { TodayView } from './views/TodayView'
import { ItineraryView } from './views/ItineraryView'
import { ExpensesView } from './views/ExpensesView'
import { ImportView } from './views/ImportView'
import './App.css'

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'hoje', label: 'Hoje', icon: Home },
  { id: 'roteiro', label: 'Roteiro', icon: CalendarDays },
  { id: 'gastos', label: 'Gastos', icon: Receipt },
  { id: 'importar', label: 'Importar', icon: Upload },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('hoje')
  const {
    trip,
    activeDay,
    replaceTrip,
    resetToSample,
    toggleActivity,
    addExpense,
    removeExpense,
  } = useTrip()

  return (
    <div className="app-shell">
      <main className="app-main">
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
        {tab === 'importar' ? (
          <ImportView trip={trip} onImported={replaceTrip} onReset={resetToSample} />
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
          >
            <Icon size={20} strokeWidth={tab === id ? 2.25 : 1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
