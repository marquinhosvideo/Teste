import { useState } from 'react'
import { MapPin } from 'lucide-react'
import type { DayPlace } from '../lib/dayMeta'
import { copyText } from '../lib/addresses'

type Props = {
  places: DayPlace[]
}

export function AddressCopyList({ places }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  if (!places.length) return null

  async function handleCopy(place: DayPlace) {
    const ok = await copyText(place.copyText)
    if (!ok) return
    setCopied(place.copyText)
    window.setTimeout(
      () => setCopied((c) => (c === place.copyText ? null : c)),
      1600,
    )
  }

  return (
    <section className="band">
      <div className="band__inner">
        <h2 className="section-title">Endereços.</h2>
        <p className="section-sub">Copie e cole no Waze.</p>
        <ul className="address-list">
          {places.map((place) => {
            const isCopied = copied === place.copyText
            return (
              <li key={place.copyText} className="address-card">
                <MapPin size={18} aria-hidden className="address-card__pin" />
                <div className="address-card__text">
                  <p className="address-card__name">{place.name}</p>
                  <p className="address-card__addr">{place.addr}</p>
                </div>
                <button
                  type="button"
                  className="btn btn--pearl"
                  onClick={() => void handleCopy(place)}
                >
                  {isCopied ? 'Copiado.' : 'Copiar'}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
