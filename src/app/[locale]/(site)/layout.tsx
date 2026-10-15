import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FloatingActions } from '@/components/layout/floating-actions'
import { JsonLd } from '@/components/json-ld'
import { getSiteSettings } from '@/lib/settings'
import { localBusinessJsonLd, organizationJsonLd } from '@/lib/seo'

/** Public site chrome. The admin area has its own root layout and never renders this. */
export default async function SiteLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  // Every layout must set the locale for static rendering (layouts and pages render in parallel).
  setRequestLocale(locale)
  const t = await getTranslations('nav')
  const settings = await getSiteSettings()
  return (
    <>
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-lg px-4 py-2 focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <FloatingActions />
      <JsonLd data={organizationJsonLd(settings)} />
      <JsonLd data={localBusinessJsonLd(settings)} />
    </>
  )
}
