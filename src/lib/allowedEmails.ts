/** Lista de e-mails autorizados (minúsculas). Vazia = qualquer um (só para dev local). */
export function getAllowedEmails(): string[] {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS?.trim() ?? ''
  if (!raw) return []
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmails()
  if (!allowed.length) return true
  return allowed.includes(email.trim().toLowerCase())
}

export function allowedEmailsHint(): string {
  const allowed = getAllowedEmails()
  if (!allowed.length) return ''
  if (allowed.length === 1) return allowed[0]
  return allowed.join(' · ')
}
