import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageHero } from '@/components/sections/section-heading'
import { EnquiryForm } from '@/components/forms/enquiry-form'
import { MapEmbed } from '@/components/sections/map-embed'
import { TrackedLink } from '@/components/layout/tracked-link'
import { WhatsAppIcon } from '@/components/layout/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { getSiteSettings } from '@/lib/settings'
import { whatsappLink } from '@/lib/utils'
import { pageMetadata } from '@/lib/seo'
import { WHATSAPP_ORDER_MESSAGE } from '@/config/site'

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  return pageMetadata(locale, '/contact', 'contact')
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()
  const s = await getSiteSettings()
  const fullAddress = `${s.address.street}, ${s.address.sector}, ${s.address.city}, ${s.address.country}`

  return (
    <>
      <PageHero
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        body={t('contact.body')}
      />
      <section className="section pt-2 sm:pt-4">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card rounded-2xl border p-6">
            <Phone className="text-accent-strong size-7" aria-hidden />
            <h2 className="mt-3 font-bold">{t('contact.phone')}</h2>
            <TrackedLink
              event="call_click"
              params={{ location: 'contact' }}
              href={`tel:${s.phoneE164}`}
              className="ltr-nums hover:text-accent-strong mt-1 block text-lg font-semibold"
            >
              {s.phone}
            </TrackedLink>
            <Button asChild variant="whatsapp" size="sm" className="mt-3">
              <TrackedLink
                event="whatsapp_click"
                params={{ location: 'contact' }}
                href={whatsappLink(s.whatsappNumber, WHATSAPP_ORDER_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="size-4" />
                {t('nav.whatsapp')}
              </TrackedLink>
            </Button>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <Mail className="text-accent-strong size-7" aria-hidden />
            <h2 className="mt-3 font-bold">{t('contact.email')}</h2>
            <a
              href={`mailto:${s.email}`}
              className="hover:text-accent-strong mt-1 block font-semibold break-all"
            >
              {s.email}
            </a>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <MapPin className="text-accent-strong size-7" aria-hidden />
            <h2 className="mt-3 font-bold">{t('contact.address')}</h2>
            <address className="ltr-nums mt-1 not-italic">{fullAddress}</address>
          </div>
          <div className="bg-card rounded-2xl border p-6">
            <Clock className="text-accent-strong size-7" aria-hidden />
            <h2 className="mt-3 font-bold">{t('contact.hours')}</h2>
            <p className="mt-1">{s.hoursLabel}</p>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div className="bg-card rounded-3xl border p-6 sm:p-8">
            <h2 className="text-2xl font-bold">{t('contact.formTitle')}</h2>
            <div className="mt-6">
              <EnquiryForm idPrefix="contact" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('contact.mapTitle')}</h2>
            <div className="mt-6">
              <MapEmbed
                query={fullAddress}
                title={t('contact.mapIframeTitle')}
                loadLabel={t('contact.loadMap')}
                directionsLabel={t('contact.directions')}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
