import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { Inter, Plus_Jakarta_Sans, Noto_Nastaliq_Urdu } from 'next/font/google'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { pickClientMessages } from '@/i18n/client-messages'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { routing, isRtl } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/settings'
import { SITE_URL } from '@/config/site'
import { SettingsProvider } from '@/components/providers/settings-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import { themeScript } from '@/components/providers/theme'
import { cn } from '@/lib/utils'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'optional' })
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['600', '700', '800'],
  // 'optional' avoids a late font swap repaint (which delays LCP); next/font's
  // metric-matched fallback keeps the first paint visually identical.
  display: 'optional',
})
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  variable: '--font-nastaliq',
  weight: ['400', '600', '700'],
  // Nastaliq files are large; 'optional' shows the system Urdu font on slow first visits
  // instead of repainting late (cached for later pages).
  display: 'optional',
  preload: false,
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('home.title'), template: t('titleTemplate') },
    description: t('home.description'),
    applicationName: t('siteName'),
    formatDetection: { telephone: false },
    openGraph: { siteName: t('siteName'), type: 'website' },
    twitter: { card: 'summary_large_image' },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070b1f' },
  ],
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const settings = await getSiteSettings()
  const messages = await getMessages()
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={cn(inter.variable, jakarta.variable, locale === 'ur' && nastaliq.variable)}
    >
      <head>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body>
        <NextIntlClientProvider messages={pickClientMessages(messages)}>
          <SettingsProvider settings={settings}>
            <CartProvider>
              {children}
              <Toaster position="top-center" richColors closeButton />
            </CartProvider>
          </SettingsProvider>
        </NextIntlClientProvider>
        {process.env.VERCEL ? <Analytics /> : null}
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="ga4" strategy="lazyOnload">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  )
}
