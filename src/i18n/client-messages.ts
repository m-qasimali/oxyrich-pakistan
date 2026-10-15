import type { AbstractIntlMessages } from 'next-intl'

/**
 * Only these messages are sent to the browser — server components translate
 * everything else on the server, which keeps the page payload small.
 * Add a namespace (or "namespace.key") here when a client component needs it.
 */
const CLIENT_MESSAGES = [
  'nav',
  'common',
  'order',
  'auth',
  'validation',
  'form',
  'delivery',
  'testimonials',
  'account',
  'subscriptions',
  'errors',
  'products.goToOrder',
  'home.quickOrderTitle',
] as const

export function pickClientMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  const out: Record<string, AbstractIntlMessages | string> = {}
  for (const path of CLIENT_MESSAGES) {
    const [ns, key] = path.split('.') as [string, string | undefined]
    const value = messages[ns]
    if (value === undefined) continue
    if (!key) out[ns] = value
    else if (typeof value === 'object') {
      const existing = (out[ns] ??= {}) as Record<string, unknown>
      existing[key] = value[key]
    }
  }
  return out as AbstractIntlMessages
}
