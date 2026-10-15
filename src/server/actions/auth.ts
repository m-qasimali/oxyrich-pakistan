'use server'

import { createHash, randomBytes } from 'node:crypto'
import { AuthError } from 'next-auth'
import { after } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signIn, signOut } from '@/lib/auth'
import { passwordResetEmail, sendEmail } from '@/lib/email'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from '@/lib/validation'
import { SITE_URL } from '@/config/site'
import { fieldErrorsFrom, guardPublicForm, type ActionResult } from '../action-utils'

const RESET_TTL_MS = 60 * 60 * 1000
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'auth.invalid', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  try {
    await signIn('credentials', {
      phone: parsed.data.phone,
      password: parsed.data.password,
      remember: String(Boolean(parsed.data.remember)),
      redirect: false,
    })
    return { ok: true }
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code
      return { ok: false, error: code === 'rate_limited' ? 'auth.rateLimited' : 'auth.invalid' }
    }
    throw error
  }
}

export async function register(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const data = parsed.data
  const blocked = await guardPublicForm('register', data)
  if (blocked === 'rate_limited') return { ok: false, error: 'auth.rateLimited' }
  if (blocked) return { ok: false, error: 'order.errorBot' }

  const existing = await db.user.findUnique({ where: { phone: data.phone }, select: { id: true } })
  if (existing) {
    return { ok: false, error: 'auth.phoneTaken', fieldErrors: { phone: 'auth.phoneTaken' } }
  }

  await db.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email ?? null,
      passwordHash: await hashPassword(data.password),
    },
  })
  // NOTE: earlier guest orders are deliberately NOT linked by phone number — the number
  // isn't verified yet, so that would expose someone else's addresses. Revisit once
  // SMS OTP verification is added.

  await signIn('credentials', {
    phone: data.phone,
    password: data.password,
    remember: 'true',
    redirect: false,
  })
  return { ok: true }
}

export async function logout() {
  await signOut({ redirect: false })
}

/**
 * Always responds the same way so the form can't be used to discover which
 * numbers have accounts. A reset link is emailed only if the account has an email.
 */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const blocked = await guardPublicForm('forgotPassword', parsed.data)
  if (blocked === 'rate_limited') return { ok: false, error: 'auth.rateLimited' }
  if (blocked) return { ok: false, error: 'order.errorBot' }
  if (!(await rateLimit('forgotPassword', `phone:${parsed.data.phone}`))) {
    return { ok: false, error: 'auth.rateLimited' }
  }

  const user = await db.user.findUnique({ where: { phone: parsed.data.phone } })
  if (user?.email) {
    const token = randomBytes(32).toString('base64url')
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    })
    const link = `${SITE_URL}/reset-password?token=${token}`
    const email = user.email
    after(() => sendEmail({ to: email, ...passwordResetEmail(user.name, link) }))
  } else {
    console.info(
      `[auth] password reset requested for ${parsed.data.phone} (no email on file) from ${await clientIp()}`,
    )
  }
  return { ok: true }
}

export async function resetPassword(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'form.error', fieldErrors: fieldErrorsFrom(parsed.error) }
  }
  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: sha256(parsed.data.token) },
  })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: 'auth.resetInvalid' }
  }
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    db.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ])
  return { ok: true }
}
