import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { processDueSubscriptions } from '@/server/subscriptions'

export const dynamic = 'force-dynamic'

/** Called daily by Vercel Cron (see vercel.json) with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  const ok =
    Boolean(secret) &&
    header.length === expected.length &&
    timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results = await processDueSubscriptions()
  return NextResponse.json({
    processed: results.length,
    created: results.filter((r) => r.ok).length,
    results,
  })
}
