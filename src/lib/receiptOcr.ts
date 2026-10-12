import { parseAmount } from './format'

export type ReceiptItemDraft = {
  id: string
  description: string
  amount: number
}

/** OCR da foto da nota (português + inglês) — carrega Tesseract sob demanda */
export async function scanReceiptImage(
  file: Blob,
  onProgress?: (pct: number) => void,
): Promise<{ text: string; items: ReceiptItemDraft[] }> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('por+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(Math.round(m.progress * 100))
      }
    },
  })

  try {
    const { data } = await worker.recognize(file)
    const text = data.text || ''
    return { text, items: parseReceiptItems(text) }
  } finally {
    await worker.terminate()
  }
}

export function parseReceiptItems(text: string): ReceiptItemDraft[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const skip =
    /^(total|subtotal|sub total|taxa|troco|change|cash|visa|mastercard|debit|credit|nf-e|cnpj|cpf|data|hora|pedido|table|mesa|qty|qtd|item)\b/i

  const items: ReceiptItemDraft[] = []
  let n = 0

  for (const line of lines) {
    if (skip.test(line)) continue
    const endPrice = line.match(
      /^(.+?)\s+(?:R\$\s*)?(\d{1,4}(?:[.,]\d{2}))\s*[A-Z]?\s*$/i,
    )
    const startPrice = line.match(/^(?:R\$\s*)?(\d{1,4}(?:[.,]\d{2}))\s+(.+)$/i)

    let description = ''
    let amount = 0

    if (endPrice) {
      description = endPrice[1]
      amount = parseAmount(endPrice[2])
    } else if (startPrice) {
      description = startPrice[2]
      amount = parseAmount(startPrice[1])
    } else {
      continue
    }

    description = description
      .replace(/[.]{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!description || description.length < 2) continue
    if (!Number.isFinite(amount) || amount <= 0 || amount > 20000) continue
    if (/^total/i.test(description)) continue

    items.push({
      id: `ocr-${++n}`,
      description: description.slice(0, 80),
      amount,
    })
  }

  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.description.toLowerCase()}|${item.amount}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
