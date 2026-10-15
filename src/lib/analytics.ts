'use client'

import { track as vercelTrack } from '@vercel/analytics'

/** Conversion events tracked in GA4 and Vercel Analytics. */
export type ConversionEvent =
  | 'order_placed'
  | 'quick_order_placed'
  | 'whatsapp_click'
  | 'call_click'
  | 'enquiry_submitted'
  | 'add_to_order'
  | 'sign_up'

type Params = Record<string, string | number | boolean>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function track(event: ConversionEvent, params: Params = {}) {
  try {
    window.gtag?.('event', event, params)
    vercelTrack(event, params)
  } catch {
    /* analytics must never break the UI */
  }
}
