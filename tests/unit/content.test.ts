import { describe, expect, it } from 'vitest'
import en from '../../messages/en.json'
import ur from '../../messages/ur.json'
import { CATALOG_PRODUCTS, CATALOG_TESTIMONIALS } from '@/content/catalog'
import { DEFAULT_SETTINGS } from '@/config/site'

type Dict = { [k: string]: string | Dict }
const keys = (o: Dict, prefix = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefix}${k}`] : keys(v, `${prefix}${k}.`),
  )

describe('translations', () => {
  it('Urdu has every English key (and no stray keys)', () => {
    const enKeys = keys(en as Dict).sort()
    const urKeys = keys(ur as Dict).sort()
    expect(urKeys.filter((k) => !enKeys.includes(k))).toEqual([])
    expect(enKeys.filter((k) => !urKeys.includes(k))).toEqual([])
  })
})

describe('business content (fixes from the old site)', () => {
  const all = JSON.stringify({ en, ur, CATALOG_PRODUCTS, CATALOG_TESTIMONIALS })
  it('has no template leftovers or known typos', () => {
    for (const bad of [
      'Acuas',
      'Experiance',
      'litter',
      'definetly',
      'Lorem',
      'Search by keyword',
    ]) {
      expect(all).not.toContain(bad)
    }
  })
  it('keeps the real business details', () => {
    expect(DEFAULT_SETTINGS.phone).toBe('0336-4448494')
    expect(DEFAULT_SETTINGS.email).toBe('oxyrichpakistan@gmail.com')
    expect(DEFAULT_SETTINGS.address.street).toBe('264, Street 6')
    expect(DEFAULT_SETTINGS.address.sector).toBe('I-9/3')
    expect(DEFAULT_SETTINGS.stats).toMatchObject({ happyClients: 876, vehicles: 50, employees: 12 })
  })
  it('seeds the three products and four testimonials', () => {
    expect(CATALOG_PRODUCTS.map((p) => p.sizeLitres)).toEqual([19, 1.5, 1])
    expect(CATALOG_TESTIMONIALS.map((t) => t.name)).toEqual([
      'Hassam Khan',
      'Umer Razzaq',
      'Tufail Khan',
      'Zeeshan Ahmad',
    ])
  })
})
