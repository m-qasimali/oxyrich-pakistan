import 'server-only'
import { headers } from 'next/headers'
import { db } from './db'

export type RateLimitRule = { limit: number; windowSeconds: number }

export const RATE_LIMITS = {
  login: { limit: 8, windowSeconds: 15 * 60 },
  register: { limit: 5, windowSeconds: 60 * 60 },
  forgotPassword: { limit: 3, windowSeconds: 60 * 60 },
  order: { limit: 10, windowSeconds: 60 * 60 },
  enquiry: { limit: 5, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/**
 * Fixed-window rate limiter backed by Postgres so limits hold across serverless
 * instances. Returns true when the request is allowed.
 */
export async function rateLimit(bucket: keyof typeof RATE_LIMITS, id: string): Promise<boolean> {
  if (process.env.DISABLE_RATE_LIMIT === 'true') return true
  const rule = RATE_LIMITS[bucket]
  const key = `${bucket}:${id}`
  const now = new Date()
  const resetAt = new Date(now.getTime() + rule.windowSeconds * 1000)
  try {
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count"   = CASE WHEN "RateLimit"."resetAt" < ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
      RETURNING "count"`
    return (rows[0]?.count ?? 0) <= rule.limit
  } catch (error) {
    // Fail open: never block real customers because the limiter table is unavailable.
    console.error('[rate-limit]', error)
    return true
  }
}
