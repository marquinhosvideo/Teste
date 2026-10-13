import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type SyncStatus = 'offline' | 'connecting' | 'online' | 'error'

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

function looksLikePlaceholder(value: string): boolean {
  return !value || /SEU_PROJETO|sua_chave|xxxx|example\.com|changeme|replace_me/i.test(value)
}

/** true só quando URL/chave parecem reais (não o modelo do .env.example) */
export const isSupabaseConfigured =
  Boolean(url && anonKey) && !looksLikePlaceholder(url) && !looksLikePlaceholder(anonKey)

export const supabaseConfigError = !url || !anonKey
  ? 'Falta o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  : looksLikePlaceholder(url) || looksLikePlaceholder(anonKey)
    ? 'O .env ainda está com valores de exemplo. Não rode de novo “cp .env.example .env” — isso apaga suas chaves. Abra o .env e cole de novo a URL e a chave do Supabase.'
    : null

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
