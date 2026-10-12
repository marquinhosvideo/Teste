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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      setState((p) => ({ ...p, error: error.message }))
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    if (!isEmailAllowed(email)) {
      setState((p) => ({ ...p, error: DENIED }))
      throw new Error(DENIED)
    }
    setState((p) => ({ ...p, error: null }))
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    if (error) {
      const msg = error.message.includes('EMAIL_NAO_AUTORIZADO')
        ? DENIED
        : error.message
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
