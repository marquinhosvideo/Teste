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
        `Importado: ${result.stats.days} dias, ${result.stats.activities} atividades` +
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
        <h1>Importar</h1>
        <p className="muted">Traga o planejamento do Excel para o celular</p>
      </header>

      <div className="import-hero">
        <FileSpreadsheet size={28} strokeWidth={1.75} />
        <h2>Seu Excel vira roteiro online</h2>
        <p>
          Baixe o modelo, cole suas abas de programação e gastos, e envie o arquivo. Os checks e
          valores ficam salvos neste aparelho.
        </p>
      </div>

      <ol className="steps">
        <li>
          <strong>Aba Roteiro</strong> — colunas: Data, Dia, Horário, Atividade, Local, Observações
        </li>
        <li>
          <strong>Aba Gastos</strong> — colunas: Data, Categoria, Descrição, Valor
        </li>
        <li>
          <strong>Aba Viagem</strong> (opcional) — Nome, Destino, Moeda
        </li>
      </ol>

      <div className="import-actions">
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => void downloadTemplate()}
        >
          <Download size={18} />
          Baixar modelo Excel
        </button>

        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={18} />
          {busy ? 'Importando…' : 'Enviar Excel / CSV'}
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
        <p className="eyebrow">Viagem atual neste aparelho</p>
        <p className="current-trip__name">{trip.name}</p>
        <p className="muted">
          {trip.destination} · {trip.days.length} dias · {trip.expenses.length} gastos
        </p>
      </div>

      <button
        type="button"
        className="btn btn--ghost btn--block"
        onClick={() => {
          if (confirm('Restaurar o roteiro de exemplo? Checks e gastos atuais serão apagados.')) {
            onReset()
            setStatus('Roteiro de exemplo restaurado.')
            setError(null)
          }
        }}
      >
        <RotateCcw size={18} />
        Restaurar exemplo
      </button>
    </section>
  )
}
