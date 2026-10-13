import { formatMoney } from '../lib/format'
import { brlToUsd } from '../lib/currency'

type Props = {
  /** Valor canônico em BRL */
  amountBrl: number
  /** Empilha BRL + USD (totais) ou coloca lado a lado (listas) */
  layout?: 'stack' | 'inline'
  className?: string
}

export function MoneyPair({ amountBrl, layout = 'inline', className = '' }: Props) {
  return (
    <span className={`money-pair money-pair--${layout} ${className}`.trim()}>
      <span className="money-pair__brl">{formatMoney(amountBrl, 'BRL')}</span>
      <span className="money-pair__usd">{formatMoney(brlToUsd(amountBrl), 'USD')}</span>
    </span>
  )
}
