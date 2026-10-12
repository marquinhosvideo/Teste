import { useState, type FormEvent } from 'react'
import { Cloud, LogIn } from 'lucide-react'

type Props = {
  error: string | null
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
}

export function AuthScreen({ error, onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setLocalError(null)
    try {
      if (mode === 'login') await onSignIn(email.trim(), password)
      else await onSignUp(email.trim(), password)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Falha na autenticação')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="brand">Roteiro</p>
        <h1>Orlando 2026</h1>
        <p className="muted">
          Entre para ver e atualizar checks e gastos em tempo real com a família.
        </p>

        <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="field">
            <label htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="familia@email.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="auth-pass">Senha</label>
            <input
              id="auth-pass"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mín. 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {(localError || error) && (
            <p className="status status--err">{localError || error}</p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            <LogIn size={18} />
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta da família'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
        >
          {mode === 'login' ? 'Primeira vez? Criar conta' : 'Já tem conta? Entrar'}
        </button>

        <p className="auth-hint">
          <Cloud size={14} /> Dica: a família pode usar o mesmo e-mail/senha compartilhado.
        </p>
      </div>
    </div>
  )
}
