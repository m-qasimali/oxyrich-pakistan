'use client'

import * as React from 'react'
import { useLocale } from 'next-intl'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  remove: (id: string) => void
  reset: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<void> | null = null
function loadScript() {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export const turnstileEnabled = Boolean(SITE_KEY)

/**
 * Cloudflare Turnstile widget (managed/invisible mode). Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const onTokenRef = React.useRef(onToken)
  React.useEffect(() => {
    onTokenRef.current = onToken
  })

  React.useEffect(() => {
    if (!SITE_KEY || !ref.current) return
    let id: string | undefined
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return
        id = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          language: locale,
          appearance: 'interaction-only',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (id && window.turnstile) window.turnstile.remove(id)
    }
  }, [locale])

  if (!SITE_KEY) return null
  return <div ref={ref} className="min-h-0" />
}
