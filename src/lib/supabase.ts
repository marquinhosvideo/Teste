import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type SyncStatus = 'offline' | 'connecting' | 'online' | 'error'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

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

export const supabaseUrl = url
export const supabaseKeyPrefix = anonKey.slice(0, 16)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          apikey: anonKey,
        },
      },
    })
  : null

/** Teste simples de rede/CORS até o projeto Supabase */
export async function testSupabaseConnection(): Promise<{
  ok: boolean
  detail: string
}> {
  if (!isSupabaseConfigured) {
    return { ok: false, detail: supabaseConfigError ?? 'Supabase não configurado' }
  }

  const healthUrl = `${url}/auth/v1/health`
  try {
    const res = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })
    if (!res.ok) {
      return {
        ok: false,
        detail: `Supabase respondeu HTTP ${res.status}. Confira a chave (anon/publishable) no painel.`,
      }
    }
    return {
      ok: true,
      detail: `Conexão OK com ${url}`,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      detail:
        `O navegador não alcançou ${url} (${msg}). ` +
        'Reinicie o npm run dev, teste janela anônima, e no Supabase use a chave Legacy anon (eyJ...) se a publishable falhar.',
    }
  }
}
