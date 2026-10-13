import { useState, type FormEvent } from 'react'
import { Cloud, LogIn, ShieldCheck, Wifi } from 'lucide-react'
import { allowedEmailsHint, getAllowedEmails } from '../lib/allowedEmails'
import {
  supabaseKeyPrefix,
  supabaseUrl,
  testSupabaseConnection,
} from '../lib/supabase'

type Props = {
  error: string | null
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
}

export function AuthScreen({ error, onSignIn, onSignUp }: Props) {
  const allowed = getAllowedEmails()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState(allowed[0] ?? '')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [diag, setDiag] = useState<string | null>(null)
  const [diagOk, setDiagOk] = useState<boolean | null>(null)

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

  async function handleTest() {
    setDiag('Testando conexão…')
    setDiagOk(null)
    const result = await testSupabaseConnection()
    setDiagOk(result.ok)
    setDiag(result.detail)
  }

  return (
    <div className="auth-screen">
      <header className="global-nav">
        <p className="global-nav__brand">Orlando 2026</p>
      </header>
      <div className="auth-card">
        <p className="eyebrow">Família</p>
        <h1 className="display-lg">Entrar.</h1>
        <p className="lede">
          Acesso restrito. Só e-mails autorizados podem sincronizar o roteiro.
        </p>

        {allowed.length > 0 ? (
          <p className="auth-allowlist">
            <ShieldCheck size={16} />
            Liberados: {allowedEmailsHint()}
          </p>
        ) : null}

        <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="field">
            <label htmlFor="auth-email">E-mail</label>
            {allowed.length > 0 && allowed.length <= 3 ? (
              <select
                id="auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              >
                {allowed.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="familia@email.com"
                required
              />
            )}
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
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn--ghost-pill btn--block"
          onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
        >
          {mode === 'login' ? 'Primeira vez? Criar conta' : 'Já tem conta? Entrar'}
        </button>

        <button
          type="button"
          className="btn btn--ghost-pill btn--block"
          onClick={() => void handleTest()}
        >
          <Wifi size={18} />
          Testar conexão com Supabase
        </button>

        {diag ? (
          <p className={`status ${diagOk ? 'status--ok' : 'status--err'}`}>{diag}</p>
        ) : null}

        <p className="auth-hint">
          <Cloud size={14} /> Projeto: {supabaseUrl || '(sem URL)'} · chave:{' '}
          {supabaseKeyPrefix || '(vazia)'}…
        </p>
      </div>
    </div>
  )
}
