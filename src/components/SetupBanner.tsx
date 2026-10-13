import { Settings } from 'lucide-react'
import { supabaseConfigError } from '../lib/supabase'

export function SetupBanner() {
  return (
    <aside className="setup-banner">
      <Settings size={18} />
      <div>
        <strong>Modo local / sem nuvem</strong>
        <p>
          {supabaseConfigError ??
            'Configure o arquivo .env (não o .env.example) e reinicie o npm run dev.'}
        </p>
        <p>
          Depois que o `.env` estiver certo, <strong>não rode</strong>{' '}
          <code>cp .env.example .env</code> de novo — isso sobrescreve suas chaves e o login
          volta a falhar.
        </p>
      </div>
    </aside>
  )
}
