import type { DeliveryAreaGroup } from '@/config/site'

const SECTOR = /^([A-Z])\s*-?\s*(\d{1,2})\b/

/** Normalise sector input like "g11", "G 11/2", "g-11 markaz" → "G-11". Other text is upper-cased. */
export function normalizeSector(input: string): string {
  const s = input.trim().toUpperCase().replace(/\s+/g, ' ')
  const m = s.match(SECTOR)
  return m ? `${m[1]}-${m[2]}` : s
}

/**
 * Find the served area for a query, or null.
 * - Sector codes must match exactly after normalisation ("g11/2" → "G-11").
 * - Named areas match on their first word ("bahria town phase 7" → "Bahria Town", "dha 2" → "DHA").
 */
export function findDeliveryArea(query: string, groups: DeliveryAreaGroup[]): string | null {
  const q = normalizeSector(query)
  if (q.length < 2) return null
  const all = groups.flatMap((g) => g.areas)

  const sector = all.find((a) => a.toUpperCase() === q)
  if (sector) return sector

  const firstWord = q.split(' ')[0]!
  if (firstWord.length < 3) return null
  return (
    all.find((a) => !SECTOR.test(a.toUpperCase()) && a.toUpperCase().split(' ')[0] === firstWord) ??
    null
  )
}
