'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { canTransition, ORDER_STATUSES } from '@/lib/order-status'
import { PRODUCTS_TAG, TESTIMONIALS_TAG } from '@/lib/products'
import { SETTINGS_TAG } from '@/lib/settings'
import { DEFAULT_SETTINGS, SETTING_KEYS, type SiteSettings } from '@/config/site'
import { createOrderForSubscription } from '../subscriptions'
import type { ActionResult } from '../action-utils'

/** Every admin action re-checks the role server-side — never trust the UI. */
async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') throw new Error('Forbidden')
  return session.user
}

/* ───────────── Orders ───────────── */

export async function updateOrderStatus(
  orderId: string,
  status: (typeof ORDER_STATUSES)[number],
): Promise<ActionResult> {
  await requireAdmin()
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: 'Invalid status' }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  })
  if (!order) return { ok: false, error: 'Order not found' }
  if (!canTransition(order.status, status)) {
    return { ok: false, error: `Cannot move an order from ${order.status} to ${status}` }
  }

  try {
    await applyStatusChange(order, status)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Update failed' }
  }

  revalidatePath('/admin', 'layout')
  return { ok: true }
}

async function applyStatusChange(
  order: {
    id: string
    status: (typeof ORDER_STATUSES)[number]
    userId: string | null
    bottlesReturned: number
    items: { qty: number; product: { isReturnable: boolean } }[]
  },
  status: (typeof ORDER_STATUSES)[number],
) {
  const orderId = order.id
  await db.$transaction(async (tx) => {
    // Optimistic check: only update if nobody changed the status meanwhile.
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status, ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}) },
    })
    if (updated.count === 0)
      throw new Error('Order was updated by someone else — refresh and try again')

    // Returnable bottle ledger: full bottles out, empties back.
    if (status === 'DELIVERED' && order.userId) {
      const delivered = order.items
        .filter((i) => i.product.isReturnable)
        .reduce((n, i) => n + i.qty, 0)
      const entries = [
        ...(delivered > 0
          ? [{ userId: order.userId, orderId, delta: delivered, reason: 'DELIVERED' as const }]
          : []),
        ...(order.bottlesReturned > 0
          ? [
              {
                userId: order.userId,
                orderId,
                delta: -order.bottlesReturned,
                reason: 'RETURNED' as const,
              },
            ]
          : []),
      ]
      if (entries.length) await tx.bottleLedger.createMany({ data: entries })
    }
  })
}

/* ───────────── Products ───────────── */

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(5).max(300),
  description: z.string().trim().min(10).max(3000),
  price: z.coerce.number().int().min(0).max(1_000_000),
  depositAmount: z.coerce.number().int().min(0).max(1_000_000),
  packSize: z.coerce.number().int().min(1).max(100),
  isAvailable: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(1000),
})

export async function updateProduct(input: z.input<typeof productSchema>): Promise<ActionResult> {
  await requireAdmin()
  const parsed = productSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { id, ...data } = parsed.data
  await db.product.update({ where: { id }, data })
  updateTag(PRODUCTS_TAG)
  revalidatePath('/', 'layout')
  return { ok: true }
}

/* ───────────── Subscriptions ───────────── */

export async function createSubscriptionOrderNow(
  subscriptionId: string,
): Promise<ActionResult<{ orderNumber?: string }>> {
  await requireAdmin()
  const res = await createOrderForSubscription(subscriptionId)
  revalidatePath('/admin', 'layout')
  return res.ok
    ? { ok: true, orderNumber: res.orderNumber }
    : { ok: false, error: 'Could not create the order' }
}

export async function setSubscriptionStatus(
  id: string,
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED',
): Promise<ActionResult> {
  await requireAdmin()
  await db.subscription.update({ where: { id }, data: { status } })
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/* ───────────── Customers ───────────── */

export async function adjustBottles(
  userId: string,
  delta: number,
  note: string,
): Promise<ActionResult> {
  await requireAdmin()
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 500) {
    return { ok: false, error: 'Enter a whole number between -500 and 500' }
  }
  await db.bottleLedger.create({
    data: { userId, delta, reason: 'ADJUSTMENT', note: note.slice(0, 200) || null },
  })
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function setUserRole(
  userId: string,
  role: 'CUSTOMER' | 'ADMIN',
): Promise<ActionResult> {
  const me = await requireAdmin()
  if (me.id === userId) return { ok: false, error: 'You cannot change your own role' }
  await db.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/* ───────────── Enquiries ───────────── */

export async function setEnquiryStatus(
  id: string,
  status: 'NEW' | 'CONTACTED' | 'CLOSED',
): Promise<ActionResult> {
  await requireAdmin()
  await db.enquiry.update({ where: { id }, data: { status } })
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/* ───────────── Testimonials ───────────── */

const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(60),
  text: z.string().trim().min(5).max(600),
  rating: z.coerce.number().int().min(1).max(5),
})

export async function createTestimonial(
  input: z.input<typeof testimonialSchema>,
): Promise<ActionResult> {
  await requireAdmin()
  const parsed = testimonialSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const max = await db.testimonial.aggregate({ _max: { sortOrder: true } })
  await db.testimonial.create({
    data: { ...parsed.data, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  })
  updateTag(TESTIMONIALS_TAG)
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function setTestimonialPublished(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  await requireAdmin()
  await db.testimonial.update({ where: { id }, data: { isPublished } })
  updateTag(TESTIMONIALS_TAG)
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  await requireAdmin()
  await db.testimonial.delete({ where: { id } })
  updateTag(TESTIMONIALS_TAG)
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

/* ───────────── Site settings ───────────── */

const nonNegInt = z.coerce.number().int().min(0).max(10_000_000)
const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  phoneE164: z
    .string()
    .trim()
    .regex(/^\+92\d{9,10}$/, 'Phone (E.164) must look like +923364448494'),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^92\d{9,10}$/, 'WhatsApp number must look like 923364448494 (no + or leading 0)'),
  email: z.email(),
  address: z.object({
    street: z.string().trim().min(2).max(120),
    sector: z.string().trim().min(2).max(40),
    city: z.string().trim().min(2).max(60),
    country: z.string().trim().min(2).max(60),
    countryCode: z.string().trim().length(2),
  }),
  geo: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
  hoursLabel: z.string().trim().min(2).max(80),
  is24x7: z.boolean(),
  freeDelivery: z.boolean(),
  deliveryFee: nonNegInt,
  pricesConfirmed: z.boolean(),
  stats: z.object({
    happyClients: nonNegInt,
    vehicles: nonNegInt,
    employees: nonNegInt,
    yearsInBusiness: nonNegInt,
  }),
  social: z.object({
    facebook: z.union([z.literal(''), z.url()]),
    instagram: z.union([z.literal(''), z.url()]),
    tiktok: z.union([z.literal(''), z.url()]),
    youtube: z.union([z.literal(''), z.url()]),
  }),
  deliveryAreas: z
    .array(
      z.object({
        group: z.string().trim().min(1).max(60),
        areas: z.array(z.string().trim().min(1).max(40)).min(1),
      }),
    )
    .min(1),
})

export async function updateSettings(input: SiteSettings): Promise<ActionResult> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: `${issue?.path.join('.')}: ${issue?.message}` }
  }
  const data = parsed.data as SiteSettings
  await db.$transaction(
    SETTING_KEYS.map((key) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value: data[key] ?? DEFAULT_SETTINGS[key] },
        create: { key, value: data[key] ?? DEFAULT_SETTINGS[key] },
      }),
    ),
  )
  updateTag(SETTINGS_TAG)
  revalidatePath('/', 'layout')
  return { ok: true }
}
