export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  if (cleaned.startsWith('+58')) cleaned = cleaned.slice(3)
  if (cleaned.startsWith('0058')) cleaned = cleaned.slice(4)
  if (cleaned.startsWith('58')) cleaned = cleaned.slice(2)
  if (!cleaned.startsWith('0') && cleaned.length === 10) cleaned = '0' + cleaned
  return cleaned
}
