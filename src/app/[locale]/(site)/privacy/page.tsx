import { setRequestLocale, getTranslations } from 'next-intl/server'
import { LegalPage } from '@/components/legal-page'
import { getSiteSettings } from '@/lib/settings'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageProps<'/[locale]/privacy'>) {
  const { locale } = await params
  return pageMetadata(locale, '/privacy', 'privacy')
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/privacy'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('meta.privacy')
  const s = await getSiteSettings()
  return (
    <LegalPage
      title={t('title')}
      updated="14 October 2026"
      sections={[
        {
          heading: 'What we collect',
          body: [
            'When you place an order, send an enquiry or create an account we collect your name, mobile number, delivery address and sector, and — if you choose to provide it — your email address and order notes.',
            'We keep a record of your orders, delivery plans and the number of returnable bottles held at your address.',
          ],
        },
        {
          heading: 'How we use it',
          body: [
            'We use your details only to confirm and deliver your orders, manage your account and delivery plans, contact you about your order (by phone, SMS or WhatsApp), and reply to your enquiries.',
            'We use privacy-friendly analytics to understand how the website is used and to improve it. We do not sell your personal information.',
          ],
        },
        {
          heading: 'Security',
          body: [
            'Passwords are stored as one-way hashes and are never visible to our staff. Access to order data is limited to authorised Oxyrich staff.',
          ],
        },
        {
          heading: 'Your choices',
          body: [
            `You can ask us to correct or delete your account and personal information at any time by emailing ${s.email} or calling ${s.phone}.`,
          ],
        },
      ]}
    />
  )
}
