import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ur'],
  defaultLocale: 'en',
  // English lives at "/", Urdu at "/ur/...".
  localePrefix: 'as-needed',
  // English is the default for everyone; Urdu is opt-in via the language switcher.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]

export const RTL_LOCALES: Locale[] = ['ur']
export const isRtl = (locale: string) => (RTL_LOCALES as string[]).includes(locale)
