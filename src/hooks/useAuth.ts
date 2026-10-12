import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isEmailAllowed } from '../lib/allowedEmails'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AuthState = {
  ready: boolean
  session: Session | null
  user: User | null
  error: string | null
}

const DENIED = 'Este e-mail não está autorizado. Peça ao administrador da viagem.'

function friendlyAuthError(err: unknown): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err || 'Erro desconhecido')
  const lower = message.toLowerCase()

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower === 'fetch failed' ||
    lower.includes('load failed')
  ) {
    return (
      'Não consegui falar com o Supabase (Failed to fetch). ' +
      'Confira o .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY), salve, pare o npm run dev (Ctrl+C) e suba de novo. ' +
      'A URL deve ser https://xxxx.supabase.co — sem aspas e sem barra no final.'
    )
  }
  if (lower.includes('user_already_exists') || lower.includes('already registered')) {
    return 'Este e-mail já tem conta. Use “Entrar” em vez de criar conta.'
  }
  if (lower.includes('email_nao_autorizado') || lower.includes('não pode se cadastrar')) {
    return DENIED
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  // evita reprocessar mensagem já traduzida
  if (message.startsWith('Não consegui falar') || message.startsWith('Este e-mail já')) {
    return message
  }
  return message
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    ready: !isSupabaseConfigured,
    session: null,
    user: null,
    error: null,
  })

  useEffect(() => {
    if (!supabase) return

    let mounted = true

    async function applySession(session: Session | null) {
      if (!mounted) return
      const email = session?.user?.email ?? ''
      if (session && email && !isEmailAllowed(email)) {
        await supabase!.auth.signOut()
        setState({
          ready: true,
          session: null,
          user: null,
          error: DENIED,
        })
        return
      }
      setState({
        ready: true,
        session,
        user: session?.user ?? null,
        error: null,
      })
    }

    void supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    if (!isEmailAllowed(email)) {
      setState((p) => ({ ...p, error: DENIED }))
      throw new Error(DENIED)
    }
    setState((p) => ({ ...p, error: null }))
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
    } catch (err) {
      const msg = friendlyAuthError(err)
      setState((p) => ({ ...p, error: msg }))
      throw new Error(msg)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    if (!isEmailAllowed(email)) {
      setState((p) => ({ ...p, error: DENIED }))
      throw new Error(DENIED)
    }
    setState((p) => ({ ...p, error: null }))
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (error) throw error
    } catch (err) {
      const msg = friendlyAuthError(err)
      setState((p) => ({ ...p, error: msg }))
      throw new Error(msg)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  return {
    configured: isSupabaseConfigured,
    ready: state.ready,
    session: state.session,
    user: state.user,
    error: state.error,
    signIn,
    signUp,
    signOut,
  }
}
