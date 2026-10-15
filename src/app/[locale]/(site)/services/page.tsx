import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/sections/section-heading'
import { ServicesGrid } from '@/components/sections/services'
import { EnquiryForm, type EnquiryType } from '@/components/forms/enquiry-form'
import { enquiryTypes } from '@/lib/validation'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>) {
  const { locale } = await params
  return pageMetadata(locale, '/services', 'services')
}

export default async function ServicesPage({
  params,
  searchParams,
}: PageProps<'/[locale]/services'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('services')
  const requested = (await searchParams).type
  const defaultType: EnquiryType = (enquiryTypes as readonly string[]).includes(String(requested))
    ? (requested as EnquiryType)
    : 'COMMERCIAL'

  return (
    <>
      <PageHero eyebrow={t('pageEyebrow')} title={t('pageTitle')} body={t('pageBody')} />
      <section className="section pt-4 sm:pt-6">
        <div className="container-page">
          <ServicesGrid headingLevel="h2" />
        </div>
      </section>
      <section
        id="enquiry"
        className="section bg-muted/60 scroll-mt-24"
        aria-labelledby="enquiry-title"
      >
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="enquiry-title" className="text-3xl font-bold">
              {t('enquiryTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">{t('enquiryBody')}</p>
          </div>
          <div className="bg-card rounded-3xl border p-6 sm:p-8">
            <EnquiryForm key={defaultType} defaultType={defaultType} idPrefix="svc" />
          </div>
        </div>
      </section>
    </>
  )
}
