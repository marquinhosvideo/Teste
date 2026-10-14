import { useEffect, useRef, useState } from 'react'
import { Cloud, FileSpreadsheet, History, RotateCcw } from 'lucide-react'
import type { Trip } from '../types'
import { importTripFromFile } from '../lib/importExcel'
import { formatShortDate } from '../lib/format'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  listTripVersions,
  loadTripVersion,
  MAX_TRIP_VERSIONS,
  pushTripVersion,
  type TripVersion,
} from '../lib/tripVersions'

type Props = {
  trip: Trip
  onImported: (trip: Trip) => void | Promise<void>
  onReset: () => void | Promise<void>
  onRestore: (trip: Trip) => void | Promise<void>
}

function formatVersionWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function ImportView({ trip, onImported, onReset, onRestore }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('Roteiro_Orlando_2026.xlsx')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [versions, setVersions] = useState<TripVersion[]>([])
  const [versionsLoading, setVersionsLoading] = useState(isSupabaseConfigured)

  async function refreshVersions() {
    if (!isSupabaseConfigured) {
      setVersions([])
      setVersionsLoading(false)
      return
    }
    setVersionsLoading(true)
    try {
      setVersions(await listTripVersions())
      setError(null)
    } catch (err) {
      setVersions([])
      setError(err instanceof Error ? err.message : 'Falha ao carregar histórico.')
    } finally {
      setVersionsLoading(false)
    }
  }

  useEffect(() => {
    void refreshVersions()
    // Só na montagem / quando sync fica disponível
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!isSupabaseConfigured) {
      setError(
        'Para guardar histórico no banco e usar em qualquer aparelho, configure o sync da família (Supabase).',
      )
      return
    }
    setBusy(true)
    setError(null)
    setStatus(null)
    setFileName(file.name)
    try {
      const result = await importTripFromFile(file, trip)
      await pushTripVersion(trip, { reason: 'import', fileName: file.name })
      await onImported(result.trip)
      await refreshVersions()
      setStatus(
        `Importado: ${result.stats.days} dias, ${result.stats.activities} períodos` +
          (result.stats.tips ? `, ${result.stats.tips} dicas` : '') +
          (result.stats.expenses ? `, ${result.stats.expenses} gastos` : '') +
          '. Versão anterior salva no banco.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao importar o arquivo.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleReset() {
    if (!isSupabaseConfigured) {
      setError(
        'Para guardar histórico no banco e usar em qualquer aparelho, configure o sync da família (Supabase).',
      )
      return
    }
    if (
      !confirm(
        'Restaurar o roteiro Orlando da planilha? Checks e gastos atuais serão apagados. O estado atual será guardado no histórico do banco.',
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await pushTripVersion(trip, { reason: 'reset' })
      await onReset()
      await refreshVersions()
      setStatus('Roteiro Orlando restaurado. Versão anterior salva no banco.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao restaurar o roteiro.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRestore(version: TripVersion) {
    if (
      !confirm(
        `Restaurar o banco de dados para a versão de ${formatVersionWhen(version.createdAt)}?\n\n${version.label}\n\nO estado atual será guardado no histórico (até ${MAX_TRIP_VERSIONS} versões no Supabase).`,
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const snapshot = await loadTripVersion(version.id)
      if (!snapshot) {
        setError('Essa versão não foi encontrada no banco. Atualize a página e tente de novo.')
        return
      }
      await pushTripVersion(trip, { reason: 'manual' })
      await onRestore(snapshot)
      await refreshVersions()
      setStatus(`Banco restaurado em todos os aparelhos: ${version.label}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao restaurar a versão.')
    } finally {
      setBusy(false)
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
            mantidas quando possível. Até {MAX_TRIP_VERSIONS} versões ficam no banco
            (Supabase) para recuperar de qualquer aparelho.
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
              disabled={busy}
              onClick={() => void handleReset()}
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

      <section className="band">
        <div className="band__inner">
          <div className="version-history__head">
            <History size={22} strokeWidth={1.75} aria-hidden />
            <div>
              <h2 className="section-title">Histórico de versões</h2>
              <p className="muted version-history__lede">
                Até {MAX_TRIP_VERSIONS} estados do roteiro no banco da família. Restaurar
                volta o roteiro, checks e gastos em todos os dispositivos.
              </p>
              <p className="version-history__cloud">
                <Cloud size={14} strokeWidth={2} aria-hidden />
                {isSupabaseConfigured
                  ? 'Salvo no Supabase — independente do aparelho'
                  : 'Sync não configurado — histórico indisponível'}
              </p>
            </div>
          </div>

          {!isSupabaseConfigured ? (
            <p className="empty-hint">
              Configure o sync da família (Supabase) e rode o SQL
              <code> supabase/trip_versions.sql</code> para ativar o histórico na nuvem.
            </p>
          ) : versionsLoading ? (
            <p className="empty-hint">Carregando histórico do banco…</p>
          ) : versions.length === 0 ? (
            <p className="empty-hint">
              Ainda não há versões. Ao importar ou restaurar o roteiro, o estado atual
              entra no histórico do banco automaticamente.
            </p>
          ) : (
            <ul className="version-list">
              {versions.map((version, index) => (
                <li key={version.id} className="version-item">
                  <div className="version-item__body">
                    <p className="version-item__meta">
                      Versão {index + 1} · {formatVersionWhen(version.createdAt)}
                    </p>
                    <h3 className="version-item__title">{version.label}</h3>
                    <p className="version-item__stats">
                      {version.stats.days} dias · {version.stats.activities} períodos ·{' '}
                      {version.stats.tips} dicas · {version.stats.expenses} gastos
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost-pill version-item__restore"
                    disabled={busy}
                    onClick={() => void handleRestore(version)}
                  >
                    <RotateCcw size={16} strokeWidth={2} aria-hidden />
                    Restaurar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  )
}
