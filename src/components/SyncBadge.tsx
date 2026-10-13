import { Cloud, CloudOff, LoaderCircle, RefreshCw } from 'lucide-react'
import type { SyncState } from '../hooks/useTrip'

type Props = {
  state: SyncState
  error?: string | null
  email?: string | null
  onSignOut?: () => void
}

export function SyncBadge({ state, error, email, onSignOut }: Props) {
  const label =
    state === 'local'
      ? 'Só neste aparelho'
      : state === 'loading'
        ? 'Sincronizando…'
        : state === 'saving'
          ? 'Salvando…'
          : state === 'error'
            ? 'Erro no sync'
            : 'Nuvem ao vivo'

  const Icon =
    state === 'local'
      ? CloudOff
      : state === 'loading' || state === 'saving'
        ? LoaderCircle
        : state === 'error'
          ? RefreshCw
          : Cloud

  return (
    <div className={`sync-badge sync-badge--${state}`} title={error ?? label}>
      <Icon size={14} className={state === 'loading' || state === 'saving' ? 'spin' : undefined} />
      <span>{label}</span>
      {email ? <span className="sync-badge__email">{email}</span> : null}
      {onSignOut ? (
        <button type="button" className="sync-badge__out" onClick={onSignOut}>
          Sair
        </button>
      ) : null}
    </div>
  )
}
