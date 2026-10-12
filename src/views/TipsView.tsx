import type { Tip } from '../types'

type Props = {
  tips?: Tip[]
}

export function TipsView({ tips }: Props) {
  if (!tips?.length) {
    return (
      <section className="view">
        <header className="view-header">
          <h1>Dicas</h1>
          <p className="muted">Nenhuma dica importada ainda.</p>
        </header>
      </section>
    )
  }

  return (
    <section className="view">
      <header className="view-header">
        <h1>Dicas</h1>
        <p className="muted">Ressalvas da planilha para a viagem a Orlando</p>
      </header>

      <div className="tips-stack">
        {tips.map((tip) => (
          <article key={tip.tema} className="tip-card">
            <h2>{tip.tema}</h2>
            <p>{tip.texto}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
