'use client'

import { DEFAULT_SETTINGS } from '@/config/site'

/** Last-resort error page when a root layout itself fails. Self-contained: no providers, no fonts. */
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(180deg,#e6f7fb,#fff)',
          color: '#0f172a',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <main>
          <p style={{ fontSize: 56, fontWeight: 800, color: '#2a246533', margin: 0 }}>500</p>
          <h1 style={{ fontSize: 28, margin: '8px 0' }}>Something went wrong</h1>
          <p style={{ color: '#475569', maxWidth: 420 }}>
            Sorry — an unexpected error occurred. Please try again, or call us on{' '}
            <a
              href={`tel:${DEFAULT_SETTINGS.phoneE164}`}
              style={{ color: '#00728c', fontWeight: 600 }}
            >
              {DEFAULT_SETTINGS.phone}
            </a>{' '}
            to place your order.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: '12px 24px',
              borderRadius: 12,
              border: 0,
              background: '#ffd60a',
              color: '#1b1747',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
