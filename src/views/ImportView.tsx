import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, RotateCcw, Upload } from 'lucide-react'
import type { Trip } from '../types'
import { downloadTemplate, importTripFromFile } from '../lib/importExcel'

type Props = {
  trip: Trip
  onImported: (trip: Trip) => void
  onReset: () => void
}

export function ImportView({ trip, onImported, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    setStatus(null)
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
      <header className="view-header">
        <h1>Excel</h1>
        <p className="muted">Atualize o app com a planilha da família</p>
      </header>

      <div className="import-hero">
        <FileSpreadsheet size={28} strokeWidth={1.75} />
        <h2>Roteiro Orlando 2026</h2>
        <p>
          O app já vem com a planilha <strong>Roteiro_Orlando_2026</strong>. Se você
          alterar o Excel, envie de novo aqui — Manhã, Tarde e Noite viram checks no
          celular.
        </p>
      </div>

      <ol className="steps">
        <li>
          <strong>Roteiro completo</strong> — Data, Tipo do dia, Manhã, Tarde, Noite,
          Lugares, Observações
        </li>
        <li>
          <strong>Dicas e ressalvas</strong> — entram na aba Dicas
        </li>
        <li>
          Gastos você registra no app (por categoria e por dia)
        </li>
      </ol>

      <div className="import-actions">
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => void downloadTemplate()}
        >
          <Download size={18} />
          Baixar planilha Orlando
        </button>

        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={18} />
          {busy ? 'Importando…' : 'Enviar Excel atualizado'}
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

      <div className="current-trip">
        <p className="eyebrow">Viagem neste aparelho</p>
        <p className="current-trip__name">{trip.name}</p>
        <p className="muted">
          {trip.destination} · {trip.days.length} dias · {trip.expenses.length} gastos
        </p>
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--block"
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
        <RotateCcw size={18} />
        Restaurar Orlando da planilha
      </button>
    </section>
  )
}
