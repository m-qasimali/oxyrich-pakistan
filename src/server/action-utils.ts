import 'server-only'
import type { z } from 'zod'
import { clientIp, rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'

export type FieldErrors = Record<string, string>

export type ActionResult<T = object> =
  ({ ok: true } & T) | { ok: false; error: string; fieldErrors?: FieldErrors }

/** Flatten Zod issues to { "path.to.field": "validation.key" } (first issue per field). */
export function fieldErrorsFrom(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form'
    out[key] ??= issue.message
  }
  return out
}

/**
 * Shared guard for public forms: honeypot, Turnstile and per-IP rate limit.
 * Returns an error code, or null when the request may proceed.
 */
export async function guardPublicForm(
  bucket: keyof typeof RATE_LIMITS,
  fields: { company_website?: string; turnstileToken?: string },
): Promise<'bot' | 'rate_limited' | null> {
  if (fields.company_website) return 'bot'
  const ip = await clientIp()
  if (!(await verifyTurnstile(fields.turnstileToken, ip))) return 'bot'
  if (!(await rateLimit(bucket, `ip:${ip}`))) return 'rate_limited'
  return null
}
