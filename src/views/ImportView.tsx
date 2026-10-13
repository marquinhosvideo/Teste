import { useRef, useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import type { Trip } from '../types'
import { importTripFromFile } from '../lib/importExcel'
import { formatShortDate } from '../lib/format'

type Props = {
  trip: Trip
  onImported: (trip: Trip) => void
  onReset: () => void
}

export function ImportView({ trip, onImported, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('Roteiro_Orlando_2026.xlsx')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    setStatus(null)
    setFileName(file.name)
    try {
      const result = await importTripFromFile(file, trip)
      onImported(result.trip)
      setStatus(
        `Importado: ${result.stats.days} dias, ${result.stats.activities} períodos` +
          (result.stats.tips ? `, ${result.stats.tips} dicas` : '') +
          (result.stats.expenses ? `, ${result.stats.expenses} gastos` : '') +
          '.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao importar o arquivo.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section className="view">
      <section className="band band--parchment band--hero">
        <div className="band__inner">
          <FileSpreadsheet size={40} strokeWidth={1.5} className="import-icon" />
          <h1 className="display-lg">Planilha.</h1>
          <p className="lede">
            Importe o Excel do roteiro para atualizar dias e dicas. Gastos na planilha
            entram em US$ e são convertidos para reais. Marcações já feitas no app são
            mantidas quando possível.
          </p>
          <div className="import-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? 'Importando…' : 'Importar Excel'}
            </button>
            <button
              type="button"
              className="btn btn--ghost-pill"
              onClick={() => {
                if (
                  confirm(
                    'Restaurar o roteiro Orlando da planilha? Checks e gastos atuais serão apagados.',
                  )
                ) {
                  onReset()
                  setStatus('Roteiro Orlando restaurado.')
                  setError(null)
                }
              }}
            >
              Restaurar roteiro
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              hidden
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </div>
          {status ? <p className="status status--ok">{status}</p> : null}
          {error ? <p className="status status--err">{error}</p> : null}
        </div>
      </section>

      <section className="band">
        <div className="band__inner">
          <article className="utility-card utility-card--wide">
            <p className="utility-card__eyebrow">Arquivo atual</p>
            <h3 className="utility-card__title">{fileName}</h3>
            <p className="utility-card__footnote">
              {trip.days.length} dias · {(trip.tips || []).length} dicas ·{' '}
              {formatShortDate(trip.startDate)} a {formatShortDate(trip.endDate)}
            </p>
          </article>
        </div>
      </section>
    </section>
  )
}
