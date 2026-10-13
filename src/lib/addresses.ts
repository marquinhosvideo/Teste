/** Extrai endereços úteis para colar no Waze a partir do dia/atividades */

export function extractDayAddresses(input: {
  dayNotes?: string
  activityLocations?: Array<string | undefined>
}): string[] {
  const found: string[] = []

  const pinLine = input.dayNotes
    ?.split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('📍'))

  if (pinLine) {
    const raw = pinLine.replace(/^📍\s*/, '')
    for (const part of splitLocations(raw)) found.push(part)
  }

  for (const loc of input.activityLocations ?? []) {
    if (!loc) continue
    for (const part of splitLocations(loc)) found.push(part)
  }

  return unique(found.map(cleanAddress).filter((a) => a.length >= 8))
}

function splitLocations(raw: string): string[] {
  const parts: string[] = []
  // "A | B" ou "A (alternativa: B)"
  const byPipe = raw.split('|').map((s) => s.trim())
  for (const chunk of byPipe) {
    const alt = chunk.match(/^(.*?)\s*\((?:alternativa|alt\.?):\s*(.+?)\)\s*$/i)
    if (alt) {
      parts.push(alt[1].trim())
      parts.push(alt[2].trim())
    } else {
      parts.push(chunk)
    }
  }
  return parts.filter(Boolean)
}

function cleanAddress(value: string): string {
  return value
    .replace(/[⭐*]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*[–—-]\s*/g, ' – ')
    .trim()
}

function unique(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of list) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fallback abaixo
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
