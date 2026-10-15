'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import {
  addressSchema,
  changePasswordSchema,
  subscriptionSchema,
  type AddressInput,
  type ChangePasswordInput,
  type SubscriptionInput,
} from '@/lib/validation'
import { resumeDate, skipNextDelivery } from '@/lib/subscriptions'
import { fieldErrorsFrom, type ActionResult } from '../action-utils'

const ACCOUNT_PATH = '/[locale]/account'

async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not signed in')
  return user
}

/* ───────────── Password ───────────── */

export async function changePassword(input: ChangePasswordInput): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  if (!(await rateLimit('login', `change:${user.id}`))) {
    return { ok: false, error: 'auth.rateLimited' }
  }
  const record = await db.user.findUnique({ where: { id: user.id } })
  if (!record || !(await bcrypt.compare(parsed.data.currentPassword, record.passwordHash))) {
    return {
      ok: false,
      error: 'account.wrongPassword',
      fieldErrors: { currentPassword: 'account.wrongPassword' },
    }
  }
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  })
  return { ok: true }
}

/* ───────────── Addresses ───────────── */

export async function addAddress(input: AddressInput): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = addressSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const count = await db.address.count({ where: { userId: user.id } })
  if (count >= 10) return { ok: false, error: 'form.error' }
  const isDefault = parsed.data.isDefault || count === 0
  await db.$transaction([
    ...(isDefault
      ? [db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })]
      : []),
    db.address.create({
      data: {
        userId: user.id,
        label: parsed.data.label || null,
        sector: parsed.data.sector,
        street: parsed.data.street,
        house: parsed.data.house,
        notes: parsed.data.notes || null,
        isDefault,
      },
    }),
  ])
  revalidatePath(ACCOUNT_PATH, 'page')
  return { ok: true }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const user = await requireUser()
  await db.address.deleteMany({ where: { id, userId: user.id } })
  revalidatePath(ACCOUNT_PATH, 'page')
  return { ok: true }
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const user = await requireUser()
  const owned = await db.address.findFirst({ where: { id, userId: user.id } })
  if (!owned) return { ok: false, error: 'form.error' }
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ])
  revalidatePath(ACCOUNT_PATH, 'page')
  return { ok: true }
}

/* ───────────── Subscriptions ───────────── */

export async function createSubscription(input: SubscriptionInput): Promise<ActionResult> {
  const user = await requireUser()
  const parsed = subscriptionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const data = parsed.data
  const product = await db.product.findUnique({ where: { id: data.productId } })
  if (!product || !product.isAvailable) return { ok: false, error: 'order.errorUnavailable' }

  const start = new Date(`${data.startDate}T00:00:00.000Z`)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  if (start < today)
    return { ok: false, error: 'form.error', fieldErrors: { startDate: 'validation.dateInvalid' } }

  const active = await db.subscription.count({
    where: { userId: user.id, status: { not: 'CANCELLED' } },
  })
  if (active >= 5) return { ok: false, error: 'form.error' }

  await db.subscription.create({
    data: {
      userId: user.id,
      productId: product.id,
      qty: data.qty,
      frequency: data.frequency,
      nextDeliveryDate: start,
      sector: data.sector,
      addressText: data.address,
      notes: data.notes || null,
    },
  })
  revalidatePath(ACCOUNT_PATH, 'page')
  return { ok: true }
}

export type SubscriptionCommand = 'skip' | 'pause' | 'resume' | 'cancel'

export async function updateSubscription(
  id: string,
  command: SubscriptionCommand,
): Promise<ActionResult> {
  const user = await requireUser()
  const sub = await db.subscription.findFirst({ where: { id, userId: user.id } })
  if (!sub || sub.status === 'CANCELLED') return { ok: false, error: 'form.error' }

  switch (command) {
    case 'skip':
      if (sub.status !== 'ACTIVE') return { ok: false, error: 'form.error' }
      await db.subscription.update({
        where: { id },
        data: { nextDeliveryDate: skipNextDelivery(sub.nextDeliveryDate, sub.frequency) },
      })
      break
    case 'pause':
      await db.subscription.update({ where: { id }, data: { status: 'PAUSED' } })
      break
    case 'resume':
      await db.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          nextDeliveryDate: resumeDate(sub.nextDeliveryDate, sub.frequency),
        },
      })
      break
    case 'cancel':
      await db.subscription.update({ where: { id }, data: { status: 'CANCELLED' } })
      break
  }
  revalidatePath(ACCOUNT_PATH, 'page')
  return { ok: true }
}
