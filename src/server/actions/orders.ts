'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import {
  orderSchema,
  quickOrderSchema,
  type OrderInput,
  type QuickOrderInput,
} from '@/lib/validation'
import { fieldErrorsFrom, guardPublicForm, type ActionResult } from '../action-utils'
import { getBottleBalance, placeOrder } from '../orders'

type OrderSuccess = { orderNumber: string; total: number; whatsappText: string }

const errorFor = (code: 'bot' | 'rate_limited' | 'unavailable' | 'generic') =>
  ({
    bot: 'order.errorBot',
    rate_limited: 'order.errorRateLimit',
    unavailable: 'order.errorUnavailable',
    generic: 'order.errorGeneric',
  })[code]

/** Checkout from the /order page. */
export async function submitOrder(input: OrderInput): Promise<ActionResult<OrderSuccess>> {
  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'order.errorGeneric', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const data = parsed.data
  const blocked = await guardPublicForm('order', data)
  if (blocked) return { ok: false, error: errorFor(blocked) }

  const user = await getCurrentUser()
  const result = await placeOrder({
    userId: user?.id,
    name: data.name,
    phone: data.phone,
    sector: data.sector,
    address: data.address,
    notes: data.notes,
    items: data.items,
    bottlesReturned: data.bottlesReturned,
    source: 'WEBSITE',
  })
  if (!result.ok) return { ok: false, error: errorFor(result.error) }
  if (user) revalidatePath('/[locale]/account', 'page')
  return {
    ok: true,
    orderNumber: result.orderNumber,
    total: result.total,
    whatsappText: result.whatsappText,
  }
}

/** Home page quick order: product → quantity → sector → phone. */
export async function submitQuickOrder(
  input: QuickOrderInput,
): Promise<ActionResult<OrderSuccess>> {
  const parsed = quickOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'order.errorGeneric', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const data = parsed.data
  const blocked = await guardPublicForm('order', data)
  if (blocked) return { ok: false, error: errorFor(blocked) }

  const user = await getCurrentUser()
  const result = await placeOrder({
    userId: user?.id,
    name: data.name || user?.name || 'Quick order',
    phone: data.phone,
    sector: data.sector,
    address: `${data.sector} — full address to be confirmed by phone`,
    items: [{ productId: data.productId, qty: data.qty }],
    bottlesReturned: 0,
    source: 'QUICK_ORDER',
  })
  if (!result.ok) return { ok: false, error: errorFor(result.error) }
  return {
    ok: true,
    orderNumber: result.orderNumber,
    total: result.total,
    whatsappText: result.whatsappText,
  }
}

/** One-tap reorder from /account: same items and address, current prices, empties exchanged. */
export async function reorder(orderId: string): Promise<ActionResult<OrderSuccess>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'order.errorGeneric' }
  if (!(await rateLimit('order', `user:${user.id}`))) {
    return { ok: false, error: errorFor('rate_limited') }
  }

  const previous = await db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: { include: { product: true } } },
  })
  if (!previous) return { ok: false, error: 'order.errorGeneric' }

  const returnableQty = previous.items
    .filter((i) => i.product.isReturnable)
    .reduce((n, i) => n + i.qty, 0)
  const balance = await getBottleBalance(user.id)

  const result = await placeOrder({
    userId: user.id,
    name: previous.guestName,
    phone: previous.guestPhone,
    sector: previous.sector,
    address: previous.addressText,
    notes: previous.notes,
    items: previous.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    // Repeat customers exchange the empties they hold.
    bottlesReturned: Math.min(returnableQty, balance),
    source: 'WEBSITE',
  })
  if (!result.ok) return { ok: false, error: errorFor(result.error) }
  revalidatePath('/[locale]/account', 'page')
  return {
    ok: true,
    orderNumber: result.orderNumber,
    total: result.total,
    whatsappText: result.whatsappText,
  }
}
