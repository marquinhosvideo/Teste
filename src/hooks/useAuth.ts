import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AuthState = {
  ready: boolean
  session: Session | null
  user: User | null
  error: string | null
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
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setState({
        ready: true,
        session: data.session,
        user: data.session?.user ?? null,
        error: null,
      })
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        ready: true,
        session,
        user: session?.user ?? null,
      }))
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    setState((p) => ({ ...p, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState((p) => ({ ...p, error: error.message }))
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase não configurado')
    setState((p) => ({ ...p, error: null }))
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setState((p) => ({ ...p, error: error.message }))
      throw error
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
