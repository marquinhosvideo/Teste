import { useMemo, useState } from 'react'
import { Copy, MapPin, Navigation } from 'lucide-react'
import type { Trip } from '../types'
import { copyText } from '../lib/addresses'
import { groupTripLocations } from '../lib/locations'
import { sampleTrip } from '../data/sampleTrip'

type Props = {
  trip: Trip
}

export function LocationsView({ trip }: Props) {
  const groups = useMemo(
    () =>
      groupTripLocations({
        ...trip,
        // Migração transparente para roteiros salvos antes da seção Locais.
        locations: trip.locations?.length ? trip.locations : sampleTrip.locations,
      }),
    [trip],
  )
  const [copied, setCopied] = useState<string | null>(null)
  const total = groups.reduce((sum, group) => sum + group.places.length, 0)

  async function handleCopy(key: string, text: string) {
    if (!(await copyText(text))) return
    setCopied(key)
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600)
  }

  return (
    <section className="view">
      <section className="band band--parchment band--hero">
        <div className="band__inner">
          <p className="eyebrow">Locais</p>
          <h1 className="display-lg">Todos os endereços.</h1>
          <p className="lede">
            {total
              ? `${total} locais do planejamento, em Alimentação, Compras e Lazer.`
              : 'Nenhum endereço salvo no planejamento.'}
          </p>
        </div>
      </section>

      {groups.map((group) => (
        <section className="band locations-group" key={group.category}>
          <div className="band__inner">
            <div className="locations-group__head">
              <h2 className="section-title">{group.category}</h2>
              <span>{group.places.length}</span>
            </div>
            <ul className="locations-list">
              {group.places.map((place) => {
                const key = `${place.name}|${place.address}`
                const query = encodeURIComponent(`${place.name}, ${place.address}`)
                return (
                  <li className="location-card" key={key}>
                    <MapPin size={19} aria-hidden className="location-card__pin" />
                    <div className="location-card__text">
                      <h3>{place.name}</h3>
                      <p>{place.address}</p>
                    </div>
                    <div className="location-card__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => void handleCopy(key, `${place.name} – ${place.address}`)}
                        aria-label={`Copiar endereço de ${place.name}`}
                        title="Copiar endereço"
                      >
                        <Copy size={18} aria-hidden />
                      </button>
                      <a
                        className="icon-btn"
                        href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir ${place.name} no mapa`}
                        title="Abrir no mapa"
                      >
                        <Navigation size={18} aria-hidden />
                      </a>
                    </div>
                    {copied === key ? (
                      <span className="location-card__copied" role="status">
                        Copiado
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ))}
    </section>
  )
}
