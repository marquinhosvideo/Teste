import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'

type Props = {
  email?: string | null
  onSubmit: (password: string) => Promise<void>
}

export function UpdatePasswordScreen({ email, onSubmit }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSubmit(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a senha.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <header className="global-nav">
        <p className="global-nav__brand">Orlando 2026</p>
      </header>
      <div className="auth-card">
        <p className="eyebrow">Conta</p>
        <h1 className="display-lg">Nova senha.</h1>
        <p className="lede">
          Defina uma senha para {email || 'sua conta'} e entre no roteiro da família.
        </p>

        <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="field">
            <label htmlFor="new-pass">Nova senha</label>
            <input
              id="new-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="new-pass-2">Confirmar senha</label>
            <input
              id="new-pass-2"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error ? <p className="status status--err">{error}</p> : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            <KeyRound size={18} />
            {busy ? 'Salvando…' : 'Salvar senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
