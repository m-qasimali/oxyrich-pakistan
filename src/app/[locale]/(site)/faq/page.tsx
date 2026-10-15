import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/sections/section-heading'
import { FaqList, getFaqItems } from '@/components/sections/faq'
import { CtaBand } from '@/components/sections/cta-band'
import { JsonLd } from '@/components/json-ld'
import { faqJsonLd, pageMetadata } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<'/[locale]/faq'>) {
  const { locale } = await params
  return pageMetadata(locale, '/faq', 'faq')
}

export default async function FaqPage({ params }: PageProps<'/[locale]/faq'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('faq')
  const items = await getFaqItems()
  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} body={t('body')} />
      <section className="section pt-2">
        <div className="container-page max-w-3xl">
          <FaqList />
        </div>
      </section>
      <CtaBand />
      <JsonLd data={faqJsonLd(items)} />
    </>
  )
}
