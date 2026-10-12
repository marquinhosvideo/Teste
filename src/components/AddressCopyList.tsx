import { useState } from 'react'
import { Check, Copy, MapPin } from 'lucide-react'
import { copyText } from '../lib/addresses'

type Props = {
  addresses: string[]
  title?: string
}

export function AddressCopyList({ addresses, title = 'Endereços para o Waze' }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  if (!addresses.length) return null

  async function handleCopy(address: string) {
    const ok = await copyText(address)
    if (!ok) return
    setCopied(address)
    window.setTimeout(() => setCopied((c) => (c === address ? null : c)), 1600)
  }

  return (
    <section className="address-list" aria-label={title}>
      <div className="section-head">
        <h3>{title}</h3>
        <p className="muted">Toque em copiar e cole no Waze</p>
      </div>
      <ul className="address-list__items">
        {addresses.map((address) => {
          const isCopied = copied === address
          return (
            <li key={address} className="address-card">
              <div className="address-card__text">
                <MapPin size={16} aria-hidden />
                <p>{address}</p>
              </div>
              <button
                type="button"
                className={`btn btn--ghost address-card__copy ${isCopied ? 'address-card__copy--ok' : ''}`}
                onClick={() => void handleCopy(address)}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? 'Copiado' : 'Copiar'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
