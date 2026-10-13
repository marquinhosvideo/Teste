import type { Tip } from '../types'
import { stripEmoji, tipIcon } from '../lib/display'

type Props = {
  tips?: Tip[]
}

export function TipsView({ tips }: Props) {
  return (
    <section className="view">
      <section className="band band--parchment band--hero">
        <div className="band__inner">
          <p className="eyebrow">Dicas</p>
          <h1 className="display-lg">Antes de sair.</h1>
          <p className="lede">
            {tips?.length
              ? 'Ressalvas da planilha para Orlando.'
              : 'Nenhuma dica importada ainda.'}
          </p>
        </div>
      </section>

      {tips?.length ? (
        <section className="band">
          <div className="band__inner">
            <div className="tips-stack">
              {tips.map((tip) => {
                const Icon = tipIcon(tip.tema)
                return (
                  <article key={tip.tema} className="tip-row">
                    <span className="tip-row__icon" aria-hidden>
                      <Icon size={18} />
                    </span>
                    <div>
                      <h2>{stripEmoji(tip.tema)}</h2>
                      <p>{stripEmoji(tip.texto)}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  )
}
