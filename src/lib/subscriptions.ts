import { addDays } from './utils'

export type Frequency = 'WEEKLY' | 'BIWEEKLY'

export const FREQUENCY_DAYS: Record<Frequency, number> = { WEEKLY: 7, BIWEEKLY: 14 }

/** The delivery date after `current` for the given frequency. */
export function nextDeliveryAfter(current: Date, frequency: Frequency): Date {
  return addDays(current, FREQUENCY_DAYS[frequency])
}

/**
 * Skip the upcoming delivery. If the plan is overdue (e.g. after a pause), roll
 * forward until the next date is in the future, then skip one more interval.
 */
export function skipNextDelivery(current: Date, frequency: Frequency, now = new Date()): Date {
  let next = current
  while (next < now) next = nextDeliveryAfter(next, frequency)
  return nextDeliveryAfter(next, frequency)
}

/** When resuming a paused plan, the next delivery is the first scheduled date not in the past. */
export function resumeDate(current: Date, frequency: Frequency, now = new Date()): Date {
  let next = current
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  while (next < today) next = nextDeliveryAfter(next, frequency)
  return next
}
