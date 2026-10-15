import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const messages = (await import(`../../messages/${locale}.json`)).default
  // Fall back to English for any key missing from a translation.
  const fallback = locale === 'en' ? messages : (await import('../../messages/en.json')).default
  return {
    locale,
    messages: deepMerge(fallback, messages),
    timeZone: 'Asia/Karachi',
  }
})

type Dict = { [key: string]: string | Dict }
function deepMerge(base: Dict, override: Dict): Dict {
  const out: Dict = { ...base }
  for (const [k, v] of Object.entries(override)) {
    const b = out[k]
    out[k] = typeof v === 'object' && typeof b === 'object' ? deepMerge(b, v) : v
  }
  return out
}
