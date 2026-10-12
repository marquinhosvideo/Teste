import { Settings } from 'lucide-react'

export function SetupBanner() {
  return (
    <aside className="setup-banner">
      <Settings size={18} />
      <div>
        <strong>Modo local</strong>
        <p>
          O Vite só lê o arquivo <code>.env</code> (não o <code>.env.example</code>). Na raiz do
          projeto: <code>cp .env.example .env</code>, preencha URL/chave, reinicie{' '}
          <code>npm run dev</code>. Guia em <code>SYNC.md</code>.
        </p>
      </div>
    </aside>
  )
}
