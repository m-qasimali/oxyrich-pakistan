/**
 * Pakistani phone number helpers. Numbers are stored in local 11-digit form
 * ("03364448494") so the same customer always maps to one account.
 */

/** Strip formatting and convert +92 / 0092 / 92 prefixes to the local leading 0. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('0092')) digits = digits.slice(4)
  else if (digits.startsWith('92') && digits.length >= 11) digits = digits.slice(2)
  if (!digits.startsWith('0')) digits = `0${digits}`
  return digits
}

/** Mobile numbers: 03XX-XXXXXXX (11 digits). Required for accounts and orders (WhatsApp). */
export function isPakistaniMobile(input: string): boolean {
  return /^03\d{9}$/.test(normalizePhone(input))
}

/** Any PK number: mobile or landline with area code (e.g. 051-1234567). */
export function isPakistaniPhone(input: string): boolean {
  return /^0\d{9,10}$/.test(normalizePhone(input))
}

/** "03364448494" → "0336-4448494" */
export function formatPhone(input: string): string {
  const n = normalizePhone(input)
  return /^03\d{9}$/.test(n) ? `${n.slice(0, 4)}-${n.slice(4)}` : n
}

/** "03364448494" → "923364448494" (for wa.me links) */
export function toWhatsAppNumber(input: string): string {
  return `92${normalizePhone(input).slice(1)}`
}
