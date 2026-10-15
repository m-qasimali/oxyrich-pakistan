import { describe, expect, it } from 'vitest'
import { canTransition, nextStatuses } from '@/lib/order-status'
import { nextDeliveryAfter, resumeDate, skipNextDelivery } from '@/lib/subscriptions'
import { findDeliveryArea, normalizeSector } from '@/lib/delivery-areas'
import { DEFAULT_SETTINGS } from '@/config/site'

const d = (s: string) => new Date(`${s}T00:00:00.000Z`)

describe('order status workflow', () => {
  it('follows pending → confirmed → out for delivery → delivered', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true)
    expect(canTransition('CONFIRMED', 'OUT_FOR_DELIVERY')).toBe(true)
    expect(canTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true)
  })
  it('does not allow skipping steps or reopening finished orders', () => {
    expect(canTransition('PENDING', 'DELIVERED')).toBe(false)
    expect(nextStatuses('DELIVERED')).toEqual([])
    expect(nextStatuses('CANCELLED')).toEqual([])
  })
})

describe('subscription dates', () => {
  it('advances by 7 or 14 days', () => {
    expect(nextDeliveryAfter(d('2026-10-01'), 'WEEKLY')).toEqual(d('2026-10-08'))
    expect(nextDeliveryAfter(d('2026-10-01'), 'BIWEEKLY')).toEqual(d('2026-10-15'))
  })
  it('skips the upcoming delivery', () => {
    expect(skipNextDelivery(d('2026-10-20'), 'WEEKLY', d('2026-10-14'))).toEqual(d('2026-10-27'))
  })
  it('rolls an overdue plan forward before skipping', () => {
    expect(skipNextDelivery(d('2026-10-01'), 'WEEKLY', d('2026-10-14'))).toEqual(d('2026-10-22'))
  })
  it('resumes on the first scheduled date that is not in the past', () => {
    expect(resumeDate(d('2026-09-30'), 'BIWEEKLY', d('2026-10-14'))).toEqual(d('2026-10-14'))
    expect(resumeDate(d('2026-10-20'), 'WEEKLY', d('2026-10-14'))).toEqual(d('2026-10-20'))
  })
})

describe('delivery area checker', () => {
  const areas = DEFAULT_SETTINGS.deliveryAreas
  it.each([
    ['g11', 'G-11'],
    ['G 11/2', 'G-11'],
    ['f-7 markaz', 'F-7'],
    ['I-9', 'I-9'],
    ['bahria town phase 7', 'Bahria Town'],
    ['dha', 'DHA'],
  ])('finds %s', (q, expected) => {
    expect(findDeliveryArea(q, areas)).toBe(expected)
  })
  it.each(['B-17', 'Rawalpindi', 'x'])('reports %s as not listed', (q) => {
    expect(findDeliveryArea(q, areas)).toBeNull()
  })
  it('normalises sector codes', () => {
    expect(normalizeSector(' g - 9 / 4 ')).toBe('G-9')
  })
})
