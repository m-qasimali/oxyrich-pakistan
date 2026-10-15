import 'server-only'
import { after } from 'next/server'
import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'
import { quoteOrder, formatOrderNumber, formatPKR } from '@/lib/pricing'
import { adminRecipient, newOrderEmail, sendEmail } from '@/lib/email'
import { SITE_URL } from '@/config/site'
import type { OrderSource } from '@/generated/prisma/client'

export type PlaceOrderInput = {
  userId?: string | null
  name: string
  phone: string
  sector: string
  address: string
  notes?: string | null
  items: { productId: string; qty: number }[]
  bottlesReturned: number
  source: OrderSource
  subscriptionId?: string | null
}

export type PlaceOrderResult =
  | {
      ok: true
      orderId: string
      number: number
      orderNumber: string
      total: number
      whatsappText: string
    }
  | { ok: false; error: 'unavailable' | 'generic' }

/**
 * Price the order from the database (never trusting client prices), persist it,
 * and notify the business by email after the response is sent.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  // Merge duplicate lines for the same product.
  const merged = new Map<string, number>()
  for (const i of input.items) merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.qty)

  const products = await db.product.findMany({ where: { id: { in: [...merged.keys()] } } })
  if (products.length !== merged.size || products.some((p) => !p.isAvailable)) {
    return { ok: false, error: 'unavailable' }
  }

  const settings = await getSiteSettings()
  const quote = quoteOrder(
    products.map((p) => ({ product: p, qty: merged.get(p.id)! })),
    { bottlesReturned: input.bottlesReturned, deliveryFee: settings.deliveryFee },
  )

  try {
    const order = await db.order.create({
      data: {
        userId: input.userId ?? null,
        guestName: input.name,
        guestPhone: input.phone,
        sector: input.sector,
        addressText: input.address,
        notes: input.notes || null,
        source: input.source,
        subscriptionId: input.subscriptionId ?? null,
        subtotal: quote.subtotal,
        depositTotal: quote.depositTotal,
        deliveryFee: quote.deliveryFee,
        total: quote.total,
        bottlesReturned: quote.bottlesReturned,
        items: {
          create: quote.lines.map((l) => ({
            productId: l.productId,
            productName: l.name,
            qty: l.qty,
            unitPrice: l.unitPrice,
            depositPerUnit: l.depositPerUnit,
          })),
        },
      },
    })

    const orderNumber = formatOrderNumber(order.number)
    const mail = newOrderEmail(
      {
        number: order.number,
        name: input.name,
        phone: input.phone,
        sector: input.sector,
        address: input.address,
        notes: input.notes,
        items: quote.lines.map((l) => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice })),
        subtotal: quote.subtotal,
        depositTotal: quote.depositTotal,
        bottlesReturned: quote.bottlesReturned,
        total: quote.total,
        source: input.source,
      },
      `${SITE_URL}/admin/orders/${order.id}`,
    )
    after(() => sendEmail({ to: adminRecipient(settings.email), ...mail }))

    const whatsappText = [
      `Order ${orderNumber}`,
      ...quote.lines.map((l) => `• ${l.qty} × ${l.name}`),
      `Total: ${formatPKR(quote.total)} (cash on delivery)`,
      `Name: ${input.name}`,
      `Phone: ${input.phone}`,
      `Address: ${input.address}, ${input.sector}`,
    ].join('\n')

    return {
      ok: true,
      orderId: order.id,
      number: order.number,
      orderNumber,
      total: quote.total,
      whatsappText,
    }
  } catch (error) {
    console.error('[orders] failed to create order', error)
    return { ok: false, error: 'generic' }
  }
}

/** Oxyrich bottles currently held by a customer (sum of ledger deltas, never below 0). */
export async function getBottleBalance(userId: string): Promise<number> {
  const agg = await db.bottleLedger.aggregate({ where: { userId }, _sum: { delta: true } })
  return Math.max(0, agg._sum.delta ?? 0)
}
