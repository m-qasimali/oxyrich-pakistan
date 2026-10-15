import { setRequestLocale, getTranslations } from 'next-intl/server'
import { LegalPage } from '@/components/legal-page'
import { getSiteSettings } from '@/lib/settings'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/terms'>) {
  const { locale } = await params
  return pageMetadata(locale, '/terms', 'terms')
}

export default async function TermsPage({ params }: PageProps<'/[locale]/terms'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('meta.terms')
  const s = await getSiteSettings()
  return (
    <LegalPage
      title={t('title')}
      updated="14 October 2026"
      sections={[
        {
          heading: 'Orders',
          body: [
            'Orders placed on this website are requests. An order is confirmed when our team contacts you by phone or WhatsApp to confirm the items, price and delivery time.',
            'Prices shown on the website may be indicative. The price confirmed with you before delivery is the price you pay.',
          ],
        },
        {
          heading: 'Delivery and payment',
          body: [
            'We deliver within our service areas in Islamabad. Payment is cash on delivery unless otherwise agreed.',
          ],
        },
        {
          heading: 'Returnable bottles',
          body: [
            '19 litre bottles remain the property of Oxyrich Pakistan. A refundable deposit is charged for each new bottle. On repeat orders, hand back an empty bottle in exchange for each full one.',
            'Deposits are refunded when bottles are returned in good condition. Lost or damaged bottles may not be eligible for a refund.',
          ],
        },
        {
          heading: 'Delivery plans',
          body: [
            'Weekly and bi-weekly delivery plans can be skipped, paused or cancelled at any time from your account.',
          ],
        },
        {
          heading: 'Contact',
          body: [`Questions about these terms? Call ${s.phone} or email ${s.email}.`],
        },
      ]}
    />
  )
}
