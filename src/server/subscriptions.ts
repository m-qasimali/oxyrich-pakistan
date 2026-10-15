import 'server-only'
import { db } from '@/lib/db'
import { nextDeliveryAfter } from '@/lib/subscriptions'
import { getBottleBalance, placeOrder } from './orders'

/**
 * Create orders for every active subscription due on or before `asOf` (end of day,
 * Asia/Karachi is UTC+5 so we compare against the UTC date), then advance each
 * subscription to its next date. Advancing the date makes this idempotent.
 */
export async function processDueSubscriptions(asOf = new Date()) {
  const endOfDay = new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate(), 23, 59, 59),
  )
  const due = await db.subscription.findMany({
    where: { status: 'ACTIVE', nextDeliveryDate: { lte: endOfDay } },
    include: { user: true },
    take: 200,
  })

  const results: { subscriptionId: string; ok: boolean; orderNumber?: string }[] = []
  for (const sub of due) {
    results.push(await createOrderForSubscription(sub.id))
  }
  return results
}

export async function createOrderForSubscription(subscriptionId: string) {
  const sub = await db.subscription.findUnique({
    where: { id: subscriptionId },
    include: { user: true },
  })
  if (!sub || sub.status !== 'ACTIVE') return { subscriptionId, ok: false }

  // Claim this delivery date first so concurrent runs can't double-create.
  const next = nextDeliveryAfter(sub.nextDeliveryDate, sub.frequency)
  const claimed = await db.subscription.updateMany({
    where: { id: sub.id, nextDeliveryDate: sub.nextDeliveryDate, status: 'ACTIVE' },
    data: { nextDeliveryDate: next },
  })
  if (claimed.count === 0) return { subscriptionId, ok: false }

  const balance = await getBottleBalance(sub.userId)
  const result = await placeOrder({
    userId: sub.userId,
    name: sub.user.name,
    phone: sub.user.phone,
    sector: sub.sector,
    address: sub.addressText,
    notes: [
      sub.notes,
      `Delivery plan — scheduled ${sub.nextDeliveryDate.toISOString().slice(0, 10)}`,
    ]
      .filter(Boolean)
      .join(' · '),
    items: [{ productId: sub.productId, qty: sub.qty }],
    bottlesReturned: Math.min(sub.qty, balance),
    source: 'SUBSCRIPTION',
    subscriptionId: sub.id,
  })

  if (!result.ok) {
    // Roll the date back so the delivery isn't silently lost.
    await db.subscription.update({
      where: { id: sub.id },
      data: { nextDeliveryDate: sub.nextDeliveryDate },
    })
    return { subscriptionId, ok: false }
  }
  return { subscriptionId, ok: true, orderNumber: result.orderNumber }
}
