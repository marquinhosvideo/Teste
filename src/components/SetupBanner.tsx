import { Settings } from 'lucide-react'

export function SetupBanner() {
  return (
    <aside className="setup-banner">
      <Settings size={18} />
      <div>
        <strong>Modo local</strong>
        <p>
          Para a família ver as mesmas atualizações, configure o Supabase (grátis): copie{' '}
          <code>.env.example</code> → <code>.env</code>, rode <code>supabase/schema.sql</code> e
          reinicie o app. Guia em <code>SYNC.md</code>.
        </p>
      </div>
    </aside>
  )
}
